import { ELIMINATION_SOUND_COOLDOWN, shouldPlayEliminationSound } from "../elimination";

test("shouldPlayEliminationSound respects cooldown", () => {
  expect(shouldPlayEliminationSound(null, 1, 0.2)).toBe(true);
  expect(shouldPlayEliminationSound(1, 1.05, 0.2)).toBe(false);
  expect(shouldPlayEliminationSound(1, 1.25, 0.2)).toBe(true);
});

test("elimination sound cooldown avoids rapid spam", () => {
  expect(ELIMINATION_SOUND_COOLDOWN).toBeGreaterThanOrEqual(3);
});

test("only one trigger is allowed within cooldown window", () => {
  let lastPlayed: number | null = null;

  const t1 = 10;
  expect(shouldPlayEliminationSound(lastPlayed, t1, ELIMINATION_SOUND_COOLDOWN)).toBe(true);
  lastPlayed = t1;

  const t2 = t1 + ELIMINATION_SOUND_COOLDOWN * 0.5;
  expect(shouldPlayEliminationSound(lastPlayed, t2, ELIMINATION_SOUND_COOLDOWN)).toBe(false);

  const t3 = t1 + ELIMINATION_SOUND_COOLDOWN - 0.01;
  expect(shouldPlayEliminationSound(lastPlayed, t3, ELIMINATION_SOUND_COOLDOWN)).toBe(false);

  const t4 = t1 + ELIMINATION_SOUND_COOLDOWN;
  expect(shouldPlayEliminationSound(lastPlayed, t4, ELIMINATION_SOUND_COOLDOWN)).toBe(true);
});
