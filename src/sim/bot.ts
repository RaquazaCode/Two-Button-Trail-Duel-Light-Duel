import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";
import { CONFIG } from "./config";
import { intersectsAny, outOfBounds } from "./collision";
import { getDifficultyProfile, type Difficulty } from "./difficulty";

const normalizeAngle = (angle: number) => {
  let value = angle % (Math.PI * 2);
  if (value < -Math.PI) value += Math.PI * 2;
  if (value > Math.PI) value -= Math.PI * 2;
  return value;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const hashToUnit = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0) / 4294967296;
};

const pointToSegmentDistanceSq = (point: Vec2, start: Vec2, end: Vec2) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    const px = point.x - start.x;
    const py = point.y - start.y;
    return px * px + py * py;
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy))
  );

  const cx = start.x + dx * t;
  const cy = start.y + dy * t;
  const ox = point.x - cx;
  const oy = point.y - cy;
  return ox * ox + oy * oy;
};

const filterNearbyTrails = (
  trails: TrailSegment[],
  pos: Vec2,
  radius: number
): TrailSegment[] => {
  const minX = pos.x - radius;
  const maxX = pos.x + radius;
  const minY = pos.y - radius;
  const maxY = pos.y + radius;

  const result: TrailSegment[] = [];
  for (const trail of trails) {
    const trailMinX = Math.min(trail.start.x, trail.end.x);
    const trailMaxX = Math.max(trail.start.x, trail.end.x);
    const trailMinY = Math.min(trail.start.y, trail.end.y);
    const trailMaxY = Math.max(trail.start.y, trail.end.y);
    if (trailMaxX < minX || trailMinX > maxX || trailMaxY < minY || trailMinY > maxY) {
      continue;
    }
    result.push(trail);
  }

  return result;
};

const clearanceScore = (pos: Vec2, arenaHalf: number, trails: TrailSegment[], horizon: number) => {
  const wallClearance = Math.max(0, arenaHalf - Math.hypot(pos.x, pos.y));
  const wallScore = Math.min(1, wallClearance / Math.max(1, horizon));

  let nearestTrailSq = Number.POSITIVE_INFINITY;
  for (const trail of trails) {
    nearestTrailSq = Math.min(nearestTrailSq, pointToSegmentDistanceSq(pos, trail.start, trail.end));
  }

  const trailClearance = Number.isFinite(nearestTrailSq) ? Math.sqrt(nearestTrailSq) : horizon;
  const trailScore = Math.min(1, trailClearance / Math.max(1, horizon));

  return wallScore * 0.4 + trailScore * 0.6;
};

const chooseOpenSectorAngle = (args: {
  pos: Vec2;
  arenaHalf: number;
  trails: TrailSegment[];
  role: "HUNTER" | "ROAMER";
  difficulty: Difficulty;
  playerPos?: Vec2;
  horizon: number;
}) => {
  const sampleAngles = args.difficulty === "HARD" ? 18 : 14;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestAngle = 0;

  for (let i = 0; i < sampleAngles; i += 1) {
    const angle = (Math.PI * 2 * i) / sampleAngles;
    const probe = {
      x: args.pos.x + Math.cos(angle) * args.horizon,
      y: args.pos.y + Math.sin(angle) * args.horizon,
    };

    let score = clearanceScore(probe, args.arenaHalf, args.trails, args.horizon);

    if (args.playerPos) {
      const pdx = args.playerPos.x - probe.x;
      const pdy = args.playerPos.y - probe.y;
      const playerDistance = Math.hypot(pdx, pdy);
      const pressureRadius = CONFIG.speed * 14;
      const closeness = clamp01(1 - playerDistance / pressureRadius);
      if (args.role === "ROAMER") {
        const avoid =
          args.difficulty === "EASY" ? 1.1 : args.difficulty === "MEDIUM" ? 0.85 : 0.5;
        score -= closeness * avoid;
      } else {
        const chase =
          args.difficulty === "HARD" ? 0.55 : args.difficulty === "MEDIUM" ? 0.42 : 0.28;
        score += closeness * chase;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestAngle = angle;
    }
  }

  return bestAngle;
};

const pickWallEscapeInput = (pos: Vec2, heading: number): -1 | 0 | 1 => {
  const inward = Math.atan2(-pos.y, -pos.x);
  const delta = normalizeAngle(inward - heading);
  if (Math.abs(delta) < 0.12) return 0;
  return delta > 0 ? 1 : -1;
};

export const chooseBotInput = (args: {
  id: string;
  pos: Vec2;
  heading: number;
  turnVel: number;
  arenaHalf: number;
  trails: TrailSegment[];
  time: number;
  playerPos?: Vec2;
  difficulty: Difficulty;
  role?: "HUNTER" | "ROAMER";
  goalAngle?: number;
  rng?: () => number;
}): -1 | 0 | 1 => {
  const profile = getDifficultyProfile(args.difficulty);
  const role = args.role ?? "ROAMER";
  const idSeed = hashToUnit(args.id);

  const distanceFromCenter = Math.hypot(args.pos.x, args.pos.y);
  const wallDangerRadius = args.arenaHalf - CONFIG.speed * 2.8;
  if (distanceFromCenter > wallDangerRadius) {
    return pickWallEscapeInput(args.pos, args.heading);
  }

  const baseDt = 1 / CONFIG.simHz;
  const stepStride = 4;
  const dt = baseDt * stepStride;
  const lookaheadSeconds =
    args.difficulty === "HARD" ? 0.44 : args.difficulty === "MEDIUM" ? 0.38 : 0.34;
  const steps = Math.max(1, Math.ceil(lookaheadSeconds / dt));
  const horizonRadius = CONFIG.speed * (lookaheadSeconds + 2.2) + CONFIG.trailWidth * 8;
  const nearbyTrails = filterNearbyTrails(args.trails, args.pos, horizonRadius);

  const shortProbe = {
    x: args.pos.x + Math.cos(args.heading) * CONFIG.speed * 0.42,
    y: args.pos.y + Math.sin(args.heading) * CONFIG.speed * 0.42,
  };
  const directHazard = intersectsAny(args.pos, shortProbe, nearbyTrails, args.time).hit;

  if (role === "ROAMER" && args.playerPos) {
    const dx = args.playerPos.x - args.pos.x;
    const dy = args.playerPos.y - args.pos.y;
    const distance = Math.hypot(dx, dy);
    const toward = normalizeAngle(Math.atan2(dy, dx) - args.heading);
    if (distance < CONFIG.speed * 8 && Math.abs(toward) < Math.PI / 4) {
      return toward > 0 ? -1 : 1;
    }
  }

  if (directHazard) {
    const bias = hashToUnit(`${args.id}:hazard:${Math.floor(args.time * 5)}`);
    return bias > 0.5 ? 1 : -1;
  }

  const goalDuration = role === "ROAMER" ? 3.2 : 2.4;
  const goalBucket = Math.floor(args.time / goalDuration);
  const goalSeed = hashToUnit(`${args.id}:${goalBucket}:${role}`);
  const goalAngle = args.goalAngle ?? goalSeed * Math.PI * 2;

  const openAngle = chooseOpenSectorAngle({
    pos: args.pos,
    arenaHalf: args.arenaHalf,
    trails: nearbyTrails,
    role,
    difficulty: args.difficulty,
    playerPos: args.playerPos,
    horizon: Math.min(args.arenaHalf * 0.55, CONFIG.speed * 6.5),
  });

  const patrolSpin = role === "ROAMER" ? 0.08 : 0.11;
  const patrolAngle = (idSeed * Math.PI * 2 + args.time * patrolSpin) % (Math.PI * 2);
  const patrolRadius = args.arenaHalf * (role === "ROAMER" ? 0.72 : 0.58);
  const patrolPoint = {
    x: Math.cos(patrolAngle) * patrolRadius,
    y: Math.sin(patrolAngle) * patrolRadius,
  };

  const candidates: Array<-1 | 0 | 1> = [-1, 0, 1];

  const scoreCandidate = (input: -1 | 0 | 1) => {
    let px = args.pos.x;
    let py = args.pos.y;
    let heading = args.heading;
    let turnVel = args.turnVel;
    let safeSteps = 0;
    const prev = { x: px, y: py };
    const next = { x: px, y: py };

    for (let i = 0; i < steps; i += 1) {
      const target = input * CONFIG.turnRate;
      const alpha = Math.min(1, dt / CONFIG.turnInertia);
      turnVel += (target - turnVel) * alpha;
      heading += turnVel * dt;
      const nx = px + Math.cos(heading) * CONFIG.speed * dt;
      const ny = py + Math.sin(heading) * CONFIG.speed * dt;

      prev.x = px;
      prev.y = py;
      next.x = nx;
      next.y = ny;

      const hitTrail = intersectsAny(prev, next, nearbyTrails, args.time);
      const hitWall = outOfBounds(next, args.arenaHalf);
      if (hitWall || hitTrail.hit) break;

      safeSteps += 1;
      px = nx;
      py = ny;
    }

    const safeRatio = safeSteps / steps;
    let score = safeRatio * 2.2;
    score += clearanceScore({ x: px, y: py }, args.arenaHalf, nearbyTrails, horizonRadius) * 1.15;

    const deltaOpen = Math.abs(normalizeAngle(openAngle - heading));
    score += (1 - deltaOpen / Math.PI) * (role === "ROAMER" ? 0.95 : 0.45);

    const deltaGoal = Math.abs(normalizeAngle(goalAngle - heading));
    score += (1 - deltaGoal / Math.PI) * (role === "ROAMER" ? 0.22 : 0.12);

    const patrolAngleNow = Math.atan2(patrolPoint.y - py, patrolPoint.x - px);
    const patrolAlign = 1 - Math.abs(normalizeAngle(patrolAngleNow - heading)) / Math.PI;
    if (role === "ROAMER") {
      score += patrolAlign * (args.difficulty === "HARD" ? 0.35 : 0.55);
    } else {
      score += patrolAlign * 0.1;
    }

    const turnCost = role === "ROAMER" ? 0.1 : 0.06;
    score -= Math.abs(input) * turnCost;

    if (Math.abs(input) > 0 && Math.sign(input) === Math.sign(args.turnVel) && Math.abs(args.turnVel) > 1.2) {
      score -= role === "ROAMER" ? 0.2 : 0.08;
    }

    if (safeRatio < 0.55 && Math.abs(input) > 0) {
      score -= 0.25;
    }

    const distanceFromCenterEnd = Math.hypot(px, py);
    if (role === "ROAMER" && distanceFromCenterEnd < args.arenaHalf * 0.35 && Math.abs(input) > 0) {
      score -= 0.1;
    }

    if (args.playerPos) {
      const distanceNow = Math.hypot(args.playerPos.x - args.pos.x, args.playerPos.y - args.pos.y);
      const distanceEnd = Math.hypot(args.playerPos.x - px, args.playerPos.y - py);

      if (role === "ROAMER") {
        const keepAway = CONFIG.speed * 12;
        const targetAngle = Math.atan2(args.playerPos.y - py, args.playerPos.x - px);
        const toward = Math.max(0, 1 - Math.abs(normalizeAngle(targetAngle - heading)) / Math.PI);
        const proximity = clamp01(1 - distanceEnd / keepAway);
        const separationWeight = args.difficulty === "HARD" ? 0.35 : 0.75;
        score += ((distanceEnd - distanceNow) / Math.max(1, keepAway)) * separationWeight;
        score -= proximity * (0.9 + toward * 0.45 + profile.pressure * 0.25);
      }

      if (role === "HUNTER") {
        const targetAngle = Math.atan2(args.playerPos.y - py, args.playerPos.x - px);
        const forward = Math.max(0, 1 - Math.abs(normalizeAngle(targetAngle - heading)) / Math.PI);
        score += forward * (0.45 + profile.pressure * 0.35);
        score += ((distanceNow - distanceEnd) / Math.max(1, horizonRadius)) *
          (0.65 + profile.aggression * 0.35);
      }
    }

    return { score, safeRatio };
  };

  const scored = candidates.map((input) => {
    const metrics = scoreCandidate(input);
    return { input, score: metrics.score, safeRatio: metrics.safeRatio };
  });
  scored.sort((a, b) => b.score - a.score);

  if (scored[0].safeRatio < 0.45) {
    const safest = [...scored].sort((a, b) => b.safeRatio - a.safeRatio)[0];
    if (safest.safeRatio > scored[0].safeRatio) return safest.input;
  }

  return scored[0].input;
};
