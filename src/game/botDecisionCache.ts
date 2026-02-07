import type { Difficulty } from "../sim/difficulty";

type BotInput = -1 | 0 | 1;

type BotDecisionState = {
  input: BotInput;
  nextThinkAt: number;
  turnStreak: number;
  breakoutUntil: number;
};

const DECISION_INTERVAL: Record<Difficulty, number> = {
  EASY: 0.19,
  MEDIUM: 0.155,
  HARD: 0.125,
};

const MAX_TURN_STREAK: Record<Difficulty, number> = {
  EASY: 4,
  MEDIUM: 6,
  HARD: 7,
};

const BREAKOUT_DURATION: Record<Difficulty, number> = {
  EASY: 0.68,
  MEDIUM: 0.58,
  HARD: 0.52,
};

export const getDecisionInterval = (difficulty: Difficulty) => DECISION_INTERVAL[difficulty];

export const createBotDecisionCache = (
  difficulty: Difficulty,
  rng: () => number = Math.random
) => {
  const state = new Map<string, BotDecisionState>();

  const get = (id: string, time: number, compute: () => BotInput): BotInput => {
    const existing = state.get(id);
    if (existing && time < existing.breakoutUntil) return 0;
    if (existing && time < existing.nextThinkAt) return existing.input;

    const prevInput = existing?.input ?? 0;
    let nextInput = compute();

    let nextStreak = 0;
    if (nextInput !== 0 && nextInput === prevInput) {
      nextStreak = (existing?.turnStreak ?? 0) + 1;
    } else if (nextInput !== 0) {
      nextStreak = 1;
    }

    let breakoutUntil = existing?.breakoutUntil ?? 0;
    if (nextStreak > MAX_TURN_STREAK[difficulty]) {
      // Break self-spirals by forcing a straight-line breakout window.
      nextInput = 0;
      nextStreak = 0;
      breakoutUntil = time + BREAKOUT_DURATION[difficulty];
    }

    const jitter = 0.9 + rng() * 0.2;
    state.set(id, {
      input: nextInput,
      nextThinkAt: time + DECISION_INTERVAL[difficulty] * jitter,
      turnStreak: nextStreak,
      breakoutUntil,
    });

    return nextInput;
  };

  const reset = () => {
    state.clear();
  };

  return { get, reset };
};
