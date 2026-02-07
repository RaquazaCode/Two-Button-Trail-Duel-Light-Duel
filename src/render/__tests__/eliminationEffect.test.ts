import { getFlashIntensity, getShockScale, shouldCreateEliminationEffect } from "../elimination";

test("flash intensity decays after the flash window", () => {
  expect(getFlashIntensity(0)).toBeCloseTo(1);
  expect(getFlashIntensity(0.06)).toBeGreaterThan(0);
  expect(getFlashIntensity(0.12)).toBeCloseTo(0);
});

test("shock ring expands over its duration", () => {
  expect(getShockScale(0)).toBeCloseTo(1);
  expect(getShockScale(0.25)).toBeCloseTo(3);
});

test("elimination effect is created once per elimination timestamp", () => {
  expect(shouldCreateEliminationEffect(undefined, 2)).toBe(true);
  expect(shouldCreateEliminationEffect(2, 2)).toBe(false);
  expect(shouldCreateEliminationEffect(2, 3)).toBe(true);
  expect(shouldCreateEliminationEffect(2, undefined)).toBe(false);
});
