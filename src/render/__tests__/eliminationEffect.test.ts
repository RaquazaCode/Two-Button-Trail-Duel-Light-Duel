import { getFlashIntensity, getShockScale } from "../elimination";

test("flash intensity decays after the flash window", () => {
  expect(getFlashIntensity(0)).toBeCloseTo(1);
  expect(getFlashIntensity(0.06)).toBeGreaterThan(0);
  expect(getFlashIntensity(0.12)).toBeCloseTo(0);
});

test("shock ring expands over its duration", () => {
  expect(getShockScale(0)).toBeCloseTo(1);
  expect(getShockScale(0.25)).toBeCloseTo(3);
});
