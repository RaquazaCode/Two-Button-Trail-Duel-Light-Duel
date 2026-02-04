import { CONFIG } from "../config";

test("config uses balanced tuning preset", () => {
  expect(CONFIG.arenaSize).toBe(875);
  expect(CONFIG.speed).toBe(48);
  expect(CONFIG.turnRate).toBe(2.2);
  expect(CONFIG.turnInertia).toBe(0.2);
  expect(CONFIG.gapOff).toBe(0);
  expect(CONFIG.selfTrailGrace).toBeCloseTo(0.35);
  expect(CONFIG.shrinkStart).toBe(50);
  expect(CONFIG.shrinkEnd).toBe(150);
  expect(CONFIG.shrinkTo).toBe(0.45);
  expect(CONFIG.roundDuration).toBe(90);
});
