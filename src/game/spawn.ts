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

const normalizeAngle = (value: number) => {
  const tau = Math.PI * 2;
  let angle = value % tau;
  if (angle < 0) angle += tau;
  return angle;
};

const mixAngles = (a: number, b: number, t: number) => {
  const ax = Math.cos(a);
  const ay = Math.sin(a);
  const bx = Math.cos(b);
  const by = Math.sin(b);
  const x = ax * (1 - t) + bx * t;
  const y = ay * (1 - t) + by * t;
  return Math.atan2(y, x);
};

const pickHeading = (pos: Vec2, rng: () => number) => {
  const radial = Math.atan2(pos.y, pos.x);
  const inward = radial + Math.PI;
  const tangent = radial + (rng() < 0.5 ? Math.PI / 2 : -Math.PI / 2);

  // Favor inward-biased starts so bots don't clip walls early, while still varying lanes.
  const modeRoll = rng();
  if (modeRoll < 0.55) {
    const jitter = (rng() - 0.5) * (Math.PI / 3);
    return normalizeAngle(inward + jitter);
  }
  if (modeRoll < 0.9) {
    const mixed = mixAngles(inward, tangent, 0.45);
    const jitter = (rng() - 0.5) * (Math.PI / 5);
    return normalizeAngle(mixed + jitter);
  }
  const random = rng() * Math.PI * 2;
  const outwardDelta = Math.abs(Math.atan2(Math.sin(random - radial), Math.cos(random - radial)));
  if (outwardDelta <= Math.PI / 6) {
    return normalizeAngle(random + Math.PI / 2);
  }
  return normalizeAngle(random);
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
        const candidatePos = randomPointInCircle(limit, rng);
        let nearest = Infinity;
        for (const spawn of spawns) {
          const dx = spawn.pos.x - candidatePos.x;
          const dy = spawn.pos.y - candidatePos.y;
          nearest = Math.min(nearest, Math.hypot(dx, dy));
        }
        const candidate: SpawnPoint = {
          pos: candidatePos,
          heading: pickHeading(candidatePos, rng),
        };
        if (nearest >= targetDistance) {
          best = candidate;
          bestDistance = nearest;
          break;
        }
        if (nearest > bestDistance) {
          bestDistance = nearest;
          best = candidate;
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
    const pos = vec2(Math.cos(angle) * radius, Math.sin(angle) * radius);
    return {
      pos,
      heading: pickHeading(pos, rng),
    };
  });
};
