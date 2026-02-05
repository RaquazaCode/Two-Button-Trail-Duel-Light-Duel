import type { Difficulty } from "./difficulty";

export type BotRole = "HUNTER" | "ROAMER";

export const getHunterCount = (difficulty: Difficulty) => {
  if (difficulty === "HARD") return 2;
  if (difficulty === "MEDIUM") return 1;
  return 0;
};

export const assignBotRoles = (
  ids: string[],
  difficulty: Difficulty,
  rng: () => number = Math.random
): Map<string, BotRole> => {
  const roles = new Map<string, BotRole>();
  const hunterCount = Math.min(getHunterCount(difficulty), ids.length);
  const pool = [...ids];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  pool.forEach((id, index) => {
    roles.set(id, index < hunterCount ? "HUNTER" : "ROAMER");
  });

  return roles;
};
