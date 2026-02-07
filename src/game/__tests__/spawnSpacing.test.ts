import { generateSpawnPoints } from "../spawn";

const makeRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const minPairDistance = (points: { pos: { x: number; y: number } }[]) => {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[i].pos.x - points[j].pos.x;
      const dy = points[i].pos.y - points[j].pos.y;
      min = Math.min(min, Math.hypot(dx, dy));
    }
  }
  return min;
};

test("generateSpawnPoints preserves spacing even when attempts are limited", () => {
  const spawns = generateSpawnPoints({
    count: 8,
    arenaHalf: 437.5,
    minDistance: 240,
    margin: 96,
    rng: makeRng(42),
    maxAttempts: 1,
  });

  expect(spawns).toHaveLength(8);
  expect(minPairDistance(spawns)).toBeGreaterThanOrEqual(192);
});

test("spawn headings avoid immediate outward wall direction", () => {
  const spawns = generateSpawnPoints({
    count: 8,
    arenaHalf: 437.5,
    minDistance: 220,
    margin: 96,
    rng: makeRng(1337),
    maxAttempts: 100,
  });

  spawns.forEach((spawn) => {
    const radial = Math.atan2(spawn.pos.y, spawn.pos.x);
    const outward = Math.abs(
      Math.atan2(Math.sin(spawn.heading - radial), Math.cos(spawn.heading - radial))
    );
    expect(outward).toBeGreaterThan(Math.PI / 6);
  });
});
