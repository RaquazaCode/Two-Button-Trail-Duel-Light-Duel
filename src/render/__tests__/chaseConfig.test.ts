import { CHASE_CONFIG } from "../chaseConfig";

test("CHASE_CONFIG uses a gentle camera roll", () => {
  expect(CHASE_CONFIG.height).toBeCloseTo(6);
  expect(CHASE_CONFIG.distance).toBeCloseTo(16);
  expect(CHASE_CONFIG.lookAhead).toBeCloseTo(26);
  expect(CHASE_CONFIG.rollFactor).toBeCloseTo(0.04);
  expect(CHASE_CONFIG.rollMax).toBeCloseTo(0.024);
  expect(CHASE_CONFIG.rollSmoothing).toBeCloseTo(16);
});
