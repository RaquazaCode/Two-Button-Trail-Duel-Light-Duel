import { STADIUM_SETTINGS } from "../stadiumConfig";

test("stadium settings keep danger ring vivid but controlled", () => {
  expect(STADIUM_SETTINGS.emissiveIntensity).toBeCloseTo(1.0);
  expect(STADIUM_SETTINGS.emissive).toBe(0xff3b1a);
  expect(STADIUM_SETTINGS.roughness).toBeGreaterThanOrEqual(0.4);
});
