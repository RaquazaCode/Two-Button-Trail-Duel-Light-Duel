import { BLOOM_SETTINGS } from "../bloomConfig";

test("bloom settings reduce glare while keeping glow", () => {
  expect(BLOOM_SETTINGS.strength).toBeCloseTo(0.7);
  expect(BLOOM_SETTINGS.radius).toBeCloseTo(0.6);
  expect(BLOOM_SETTINGS.threshold).toBeCloseTo(0.3);
});
