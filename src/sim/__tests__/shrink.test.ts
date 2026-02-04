import { arenaHalfAt } from "../shrink";

test("arena shrinks over time", () => {
  const start = arenaHalfAt(0, 50, 20, 60, 0.4);
  const mid = arenaHalfAt(40, 50, 20, 60, 0.4);
  const end = arenaHalfAt(60, 50, 20, 60, 0.4);
  expect(start).toBe(50);
  expect(mid).toBeLessThan(50);
  expect(end).toBeCloseTo(20);
});
