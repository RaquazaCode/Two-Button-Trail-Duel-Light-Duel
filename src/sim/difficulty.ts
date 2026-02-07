export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type DifficultyProfile = {
  name: Difficulty;
  aggression: number;
  pressure: number;
  reactionScale: number;
  riskTolerance: number;
  cooperationChance: number;
};

export const getDifficultyProfile = (difficulty: Difficulty): DifficultyProfile => {
  if (difficulty === "HARD") {
    return {
      name: "HARD",
      aggression: 0.7,
      pressure: 0.72,
      reactionScale: 1.3,
      riskTolerance: 0.33,
      cooperationChance: 0.45,
    };
  }

  if (difficulty === "MEDIUM") {
    return {
      name: "MEDIUM",
      aggression: 0.46,
      pressure: 0.48,
      reactionScale: 1.08,
      riskTolerance: 0.5,
      cooperationChance: 0.18,
    };
  }

  return {
    name: "EASY",
    aggression: 0.33,
    pressure: 0.36,
    reactionScale: 0.95,
    riskTolerance: 0.62,
    cooperationChance: 0.0,
  };
};
