import { STADIUM_SETTINGS } from "../stadiumConfig";

test("stadium settings keep danger ring vivid but controlled", () => {
  expect(STADIUM_SETTINGS.topIntensity).toBeGreaterThanOrEqual(1.3);
  expect(STADIUM_SETTINGS.baseIntensity).toBeLessThan(STADIUM_SETTINGS.topIntensity);
  expect(STADIUM_SETTINGS.topEmissive).toBe(0xff5a2a);
  expect(STADIUM_SETTINGS.roughness).toBeGreaterThanOrEqual(0.4);
});
