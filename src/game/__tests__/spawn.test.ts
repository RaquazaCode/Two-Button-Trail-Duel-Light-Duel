import { generateSpawnPoints } from "../spawn";

const makeRng = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

test("generateSpawnPoints spreads players within bounds", () => {
  const rng = makeRng(42);
  const spawns = generateSpawnPoints({
    count: 6,
    arenaHalf: 100,
    minDistance: 20,
    margin: 10,
    rng,
  });

  expect(spawns).toHaveLength(6);

  spawns.forEach((spawn) => {
    expect(Math.abs(spawn.pos.x)).toBeLessThanOrEqual(90);
    expect(Math.abs(spawn.pos.y)).toBeLessThanOrEqual(90);
    expect(spawn.heading).toBeGreaterThanOrEqual(0);
    expect(spawn.heading).toBeLessThan(Math.PI * 2);
  });

  for (let i = 0; i < spawns.length; i += 1) {
    for (let j = i + 1; j < spawns.length; j += 1) {
      const dx = spawns[i].pos.x - spawns[j].pos.x;
      const dy = spawns[i].pos.y - spawns[j].pos.y;
      const distance = Math.hypot(dx, dy);
      expect(distance).toBeGreaterThanOrEqual(20);
    }
  }
});

test("generateSpawnPoints always fills requested slots", () => {
  const rng = makeRng(7);
  const spawns = generateSpawnPoints({
    count: 8,
    arenaHalf: 200,
    minDistance: 60,
    margin: 20,
    rng,
    maxAttempts: 0,
  });

  expect(spawns).toHaveLength(8);

  for (let i = 0; i < spawns.length; i += 1) {
    for (let j = i + 1; j < spawns.length; j += 1) {
      const dx = spawns[i].pos.x - spawns[j].pos.x;
      const dy = spawns[i].pos.y - spawns[j].pos.y;
      const distance = Math.hypot(dx, dy);
      expect(distance).toBeGreaterThanOrEqual(60);
    }
  }
});
