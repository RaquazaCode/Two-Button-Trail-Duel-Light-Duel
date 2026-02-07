import { CONFIG } from "../sim/config";

export type TrailDifficulty = "EASY" | "MEDIUM" | "HARD";

const TRAIL_LIFETIME_BY_DIFFICULTY: Record<TrailDifficulty, number> = {
  EASY: 45,
  MEDIUM: 80,
  HARD: 120,
};

export const getTrailLifetimeForDifficulty = (difficulty: TrailDifficulty) =>
  TRAIL_LIFETIME_BY_DIFFICULTY[difficulty];

export const applyTrailLifetimeForDifficulty = (difficulty: TrailDifficulty) => {
  CONFIG.trailLifetime = getTrailLifetimeForDifficulty(difficulty);
};
