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

const randomBetween = (min: number, max: number, rng: () => number) =>
  min + (max - min) * rng();

export const generateSpawnPoints = (options: SpawnOptions): SpawnPoint[] => {
  const rng = options.rng ?? Math.random;
  const minDistance = Math.max(0, options.minDistance);
  const margin = Math.max(0, options.margin);
  const maxAttempts = options.maxAttempts ?? options.count * 200;
  const limit = Math.max(0, options.arenaHalf - margin);

  const spawns: SpawnPoint[] = [];
  let attempts = 0;

  while (spawns.length < options.count && attempts < maxAttempts) {
    attempts += 1;
    const x = randomBetween(-limit, limit, rng);
    const y = randomBetween(-limit, limit, rng);
    const candidate = vec2(x, y);

    const spaced = spawns.every((spawn) => {
      const dx = spawn.pos.x - candidate.x;
      const dy = spawn.pos.y - candidate.y;
      return Math.hypot(dx, dy) >= minDistance;
    });

    if (!spaced) continue;

    const heading = rng() * Math.PI * 2;
    spawns.push({ pos: candidate, heading });
  }

  if (spawns.length < options.count) {
    const remaining = options.count - spawns.length;
    const radius = limit * 0.65;
    for (let i = 0; i < remaining; i += 1) {
      const angle = (Math.PI * 2 * i) / remaining;
      spawns.push({
        pos: vec2(Math.cos(angle) * radius, Math.sin(angle) * radius),
        heading: angle + Math.PI / 2,
      });
    }
  }

  return spawns;
};
