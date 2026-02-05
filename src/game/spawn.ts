import { vec2, type Vec2 } from "../sim/math";

export type SpawnPoint = { pos: Vec2; heading: number };

type SpawnOptions = {
  count: number;
  arenaHalf: number;
  minDistance: number;
  margin: number;
  rng?: () => number;
  maxAttempts?: number;
};

const randomPointInCircle = (radius: number, rng: () => number): Vec2 => {
  const angle = rng() * Math.PI * 2;
  const r = Math.sqrt(rng()) * radius;
  return vec2(Math.cos(angle) * r, Math.sin(angle) * r);
};

export const generateSpawnPoints = (options: SpawnOptions): SpawnPoint[] => {
  const rng = options.rng ?? Math.random;
  const minDistance = Math.max(0, options.minDistance);
  const margin = Math.max(0, options.margin);
  const maxAttempts = options.maxAttempts ?? options.count * 200;
  const limit = Math.max(0, options.arenaHalf - margin);
  const minFloor = minDistance * 0.9;
  const candidateAttempts = Math.max(12, Math.floor(maxAttempts / options.count));

  const attemptPlacement = (targetDistance: number): SpawnPoint[] | null => {
    const spawns: SpawnPoint[] = [];
    for (let i = 0; i < options.count; i += 1) {
      let best: SpawnPoint | null = null;
      let bestDistance = -Infinity;
      for (let attempt = 0; attempt < candidateAttempts; attempt += 1) {
        const candidate = randomPointInCircle(limit, rng);
        let nearest = Infinity;
        for (const spawn of spawns) {
          const dx = spawn.pos.x - candidate.x;
          const dy = spawn.pos.y - candidate.y;
          nearest = Math.min(nearest, Math.hypot(dx, dy));
        }
        if (nearest >= targetDistance) {
          best = { pos: candidate, heading: rng() * Math.PI * 2 };
          bestDistance = nearest;
          break;
        }
        if (nearest > bestDistance) {
          bestDistance = nearest;
          best = { pos: candidate, heading: rng() * Math.PI * 2 };
        }
      }
      if (!best || bestDistance < targetDistance) return null;
      spawns.push(best);
    }
    return spawns;
  };

  let currentDistance = minDistance;
  for (let round = 0; round < 4; round += 1) {
    const attempt = attemptPlacement(currentDistance);
    if (attempt) return attempt;
    currentDistance = Math.max(minFloor, currentDistance * 0.9);
  }

  const rotation = rng() * Math.PI * 2;
  const radius = limit;
  return Array.from({ length: options.count }, (_, i) => {
    const angle = rotation + (Math.PI * 2 * i) / options.count;
    return {
      pos: vec2(Math.cos(angle) * radius, Math.sin(angle) * radius),
      heading: rng() * Math.PI * 2,
    };
  });
};
