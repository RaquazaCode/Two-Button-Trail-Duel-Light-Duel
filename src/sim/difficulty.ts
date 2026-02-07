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
      aggression: 0.78,
      pressure: 0.82,
      reactionScale: 1.3,
      riskTolerance: 0.38,
      cooperationChance: 0.45,
    };
  }

  if (difficulty === "MEDIUM") {
    return {
      name: "MEDIUM",
      aggression: 0.52,
      pressure: 0.56,
      reactionScale: 1.08,
      riskTolerance: 0.53,
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
