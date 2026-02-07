import { getTrailLifetimeForDifficulty } from "../trailDifficulty";

test("trail lifetime increases with difficulty and hard keeps trails longest", () => {
  const easy = getTrailLifetimeForDifficulty("EASY");
  const medium = getTrailLifetimeForDifficulty("MEDIUM");
  const hard = getTrailLifetimeForDifficulty("HARD");

  expect(easy).toBeGreaterThan(0);
  expect(medium).toBeGreaterThan(easy);
  expect(hard).toBeGreaterThan(medium);
});
