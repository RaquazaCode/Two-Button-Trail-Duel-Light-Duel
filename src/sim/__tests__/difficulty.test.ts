import { getDifficultyProfile } from "../difficulty";

test("difficulty profiles expose expected levels", () => {
  const easy = getDifficultyProfile("EASY");
  const medium = getDifficultyProfile("MEDIUM");
  const hard = getDifficultyProfile("HARD");

  expect(easy.name).toBe("EASY");
  expect(medium.name).toBe("MEDIUM");
  expect(hard.name).toBe("HARD");

  expect(easy.aggression).toBeLessThan(medium.aggression);
  expect(medium.aggression).toBeLessThan(hard.aggression);
  expect(easy.reactionScale).toBeLessThan(hard.reactionScale);
});
