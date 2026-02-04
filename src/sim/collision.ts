import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";

const cross = (a: Vec2, b: Vec2) => a.x * b.y - a.y * b.x;

const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });

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
  time: number
) => {
  return trails.some((t) => time >= t.solidAt && segmentsIntersect(prev, next, t.start, t.end));
};

export const outOfBounds = (pos: Vec2, arenaHalf: number) =>
  Math.abs(pos.x) > arenaHalf || Math.abs(pos.y) > arenaHalf;
