import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";

const cross = (a: Vec2, b: Vec2) => a.x * b.y - a.y * b.x;

const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });

const overlap = (aMin: number, aMax: number, bMin: number, bMax: number) =>
  !(aMax < bMin || bMax < aMin);

export const segmentsIntersect = (p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2) => {
  const r = sub(p2, p1);
  const s = sub(q2, q1);
  const denom = cross(r, s);
  if (denom === 0) return false;
  const t = cross(sub(q1, p1), s) / denom;
  const u = cross(sub(q1, p1), r) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

export const intersectsAny = (
  prev: Vec2,
  next: Vec2,
  trails: TrailSegment[],
  time: number,
  options?: { selfId?: string; selfGrace?: number }
) => {
  const moveMinX = Math.min(prev.x, next.x);
  const moveMaxX = Math.max(prev.x, next.x);
  const moveMinY = Math.min(prev.y, next.y);
  const moveMaxY = Math.max(prev.y, next.y);

  for (const trail of trails) {
    if (time < trail.solidAt) continue;
    if (options?.selfId && trail.owner === options.selfId) {
      const grace = options.selfGrace ?? 0;
      if (time - trail.createdAt < grace) continue;
    }

    const trailMinX = Math.min(trail.start.x, trail.end.x);
    const trailMaxX = Math.max(trail.start.x, trail.end.x);
    const trailMinY = Math.min(trail.start.y, trail.end.y);
    const trailMaxY = Math.max(trail.start.y, trail.end.y);

    if (
      !overlap(moveMinX, moveMaxX, trailMinX, trailMaxX) ||
      !overlap(moveMinY, moveMaxY, trailMinY, trailMaxY)
    ) {
      continue;
    }

    if (segmentsIntersect(prev, next, trail.start, trail.end)) {
      return { hit: true, owner: trail.owner };
    }
  }

  return { hit: false };
};

export const outOfBounds = (pos: Vec2, arenaHalf: number) => Math.hypot(pos.x, pos.y) > arenaHalf;
