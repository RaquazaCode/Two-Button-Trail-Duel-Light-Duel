import { getCameraFar, getPixelRatio } from "../sceneConfig";

test("getPixelRatio clamps high-density screens", () => {
  expect(getPixelRatio(1)).toBe(1);
  expect(getPixelRatio(2)).toBe(1.5);
  expect(getPixelRatio(undefined)).toBe(1);
});

test("getCameraFar scales with large arenas", () => {
  expect(getCameraFar(250)).toBe(900);
  expect(getCameraFar(2500)).toBeGreaterThan(900);
});
