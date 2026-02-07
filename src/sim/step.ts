import { CONFIG } from "./config";
import { stepPhysics } from "./physics";
import { updateTrail } from "./trails";
import { intersectsAny, outOfBounds } from "./collision";
import { arenaHalfAt } from "./shrink";
import { resolveElimination } from "./match";
import type { TrailSegment, WorldState } from "./types";
import type { Vec2 } from "./math";

const BUCKET_SIZE = 28;
const BUCKET_PAD = CONFIG.trailWidth * 1.5;

type TrailBuckets = Map<string, TrailSegment[]>;
type TrailSpatialCache = {
  buckets: TrailBuckets;
  indexedTrailCount: number;
};

const trailCache = new WeakMap<WorldState, TrailSpatialCache>();

const bucketIndex = (value: number) => Math.floor(value / BUCKET_SIZE);
const bucketKey = (x: number, y: number) => `${x}:${y}`;

const addTrailToBuckets = (buckets: TrailBuckets, trail: TrailSegment) => {
  const minX = Math.min(trail.start.x, trail.end.x) - BUCKET_PAD;
  const maxX = Math.max(trail.start.x, trail.end.x) + BUCKET_PAD;
  const minY = Math.min(trail.start.y, trail.end.y) - BUCKET_PAD;
  const maxY = Math.max(trail.start.y, trail.end.y) + BUCKET_PAD;

  for (let bx = bucketIndex(minX); bx <= bucketIndex(maxX); bx += 1) {
    for (let by = bucketIndex(minY); by <= bucketIndex(maxY); by += 1) {
      const key = bucketKey(bx, by);
      const list = buckets.get(key);
      if (list) {
        list.push(trail);
      } else {
        buckets.set(key, [trail]);
      }
    }
  }
};

const ensureTrailBuckets = (world: WorldState) => {
  const cached = trailCache.get(world);
  const buckets = cached?.buckets ?? new Map<string, TrailSegment[]>();
  let indexedTrailCount = cached?.indexedTrailCount ?? 0;

  if (indexedTrailCount > world.trails.length) {
    buckets.clear();
    indexedTrailCount = 0;
  }

  for (let i = indexedTrailCount; i < world.trails.length; i += 1) {
    addTrailToBuckets(buckets, world.trails[i]);
  }

  return { buckets, indexedTrailCount: world.trails.length };
};

const getCollisionCandidates = (buckets: TrailBuckets, prev: Vec2, next: Vec2) => {
  const minX = Math.min(prev.x, next.x) - BUCKET_PAD;
  const maxX = Math.max(prev.x, next.x) + BUCKET_PAD;
  const minY = Math.min(prev.y, next.y) - BUCKET_PAD;
  const maxY = Math.max(prev.y, next.y) + BUCKET_PAD;

  const unique = new Map<string, TrailSegment>();
  for (let bx = bucketIndex(minX); bx <= bucketIndex(maxX); bx += 1) {
    for (let by = bucketIndex(minY); by <= bucketIndex(maxY); by += 1) {
      const list = buckets.get(bucketKey(bx, by));
      if (!list) continue;
      for (const trail of list) {
        unique.set(`${trail.owner}:${trail.id}`, trail);
      }
    }
  }

  return [...unique.values()];
};

export const stepWorld = (
  world: WorldState,
  inputs: Record<string, -1 | 0 | 1>,
  dt: number
): WorldState => {
  const time = world.time + dt;
  const arenaHalf = arenaHalfAt(
    time,
    CONFIG.arenaSize / 2,
    CONFIG.shrinkStart,
    CONFIG.shrinkEnd,
    CONFIG.shrinkTo
  );
  const trails = [...world.trails];
  const spatial = ensureTrailBuckets(world);
  const trailBuckets = spatial.buckets;

  const players = world.players.map((p) => {
    if (!p.alive) return p;
    const input = inputs[p.id] ?? 0;
    const phys = stepPhysics({
      pos: p.pos,
      heading: p.heading,
      turnVel: p.turnVel,
      input,
      dt,
      speed: CONFIG.speed,
      turnRate: CONFIG.turnRate,
      inertia: CONFIG.turnInertia,
    });

    const trailRes = updateTrail({
      prev: p.pos,
      next: phys.pos,
      time,
      gapOn: CONFIG.gapOn,
      gapOff: CONFIG.gapOff,
      solidifyDelay: CONFIG.solidifyDelay,
      state: { gapTimer: p.gapTimer, gapOnState: p.gapOn, trailId: p.trailId },
      owner: p.id,
    });

    if (trailRes.segments.length > 0) {
      for (const segment of trailRes.segments) {
        trails.push(segment);
        addTrailToBuckets(trailBuckets, segment);
      }
    }

    const collisionTrails = time >= CONFIG.openingGrace;
    const trailCandidates = collisionTrails
      ? getCollisionCandidates(trailBuckets, p.pos, phys.pos)
      : [];
    const trailHit = collisionTrails
      ? intersectsAny(p.pos, phys.pos, trailCandidates, time, {
          selfId: p.id,
          selfGrace: CONFIG.selfTrailGrace,
        })
      : { hit: false as const };
    const wallHit = outOfBounds(phys.pos, arenaHalf);
    const hit = wallHit
      ? { reason: "WALL" as const }
      : trailHit.hit
        ? { reason: "TRAIL" as const, by: trailHit.owner }
        : null;

    return resolveElimination({
      player: {
        ...p,
        pos: phys.pos,
        heading: phys.heading,
        turnVel: phys.turnVel,
        gapTimer: trailRes.gapTimer,
        gapOn: trailRes.gapOnState,
        trailId: trailRes.trailId ?? p.trailId,
      },
      hit,
      time,
    });
  });

  let activeTrails = trails;
  let activeBuckets = trailBuckets;
  if (CONFIG.trailLifetime > 0) {
    const cutoff = time - CONFIG.trailLifetime;
    if (cutoff > 0) {
      const filtered = trails.filter((trail) => trail.createdAt >= cutoff);
      if (filtered.length !== trails.length) {
        activeTrails = filtered;
        activeBuckets = new Map<string, TrailSegment[]>();
        for (const trail of activeTrails) {
          addTrailToBuckets(activeBuckets, trail);
        }
      }
    }
  }

  const nextWorld = { ...world, time, arenaHalf, players, trails: activeTrails };
  trailCache.set(nextWorld, {
    buckets: activeBuckets,
    indexedTrailCount: activeTrails.length,
  });
  return nextWorld;
};
