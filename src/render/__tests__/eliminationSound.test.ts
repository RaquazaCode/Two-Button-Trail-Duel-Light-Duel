import { ELIMINATION_SOUND_COOLDOWN, shouldPlayEliminationSound } from "../elimination";

test("shouldPlayEliminationSound respects cooldown", () => {
  expect(shouldPlayEliminationSound(null, 1, 0.2)).toBe(true);
  expect(shouldPlayEliminationSound(1, 1.05, 0.2)).toBe(false);
  expect(shouldPlayEliminationSound(1, 1.25, 0.2)).toBe(true);
});

test("elimination sound cooldown avoids rapid spam", () => {
  expect(ELIMINATION_SOUND_COOLDOWN).toBeGreaterThanOrEqual(2);
});
