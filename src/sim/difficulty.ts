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
      aggression: 0.85,
      pressure: 0.9,
      reactionScale: 1.4,
      riskTolerance: 0.35,
      cooperationChance: 0.5,
    };
  }

  if (difficulty === "MEDIUM") {
    return {
      name: "MEDIUM",
      aggression: 0.55,
      pressure: 0.6,
      reactionScale: 1.15,
      riskTolerance: 0.5,
      cooperationChance: 0.2,
    };
  }

  return {
    name: "EASY",
    aggression: 0.35,
    pressure: 0.4,
    reactionScale: 1.0,
    riskTolerance: 0.6,
    cooperationChance: 0.0,
  };
};
