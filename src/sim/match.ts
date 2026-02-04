import type { EliminationReason, PlayerId, PlayerState } from "./types";

export type EliminationHit = {
  reason: EliminationReason;
  by?: PlayerId;
} | null;

export const resolveElimination = (args: {
  player: PlayerState;
  hit: EliminationHit;
  time: number;
}) => {
  if (!args.hit) return args.player;
  return {
    ...args.player,
    alive: false,
    eliminatedAt: args.time,
    eliminationReason: args.hit.reason,
    eliminatedBy: args.hit.by,
  };
};
