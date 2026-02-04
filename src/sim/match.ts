import type { PlayerState } from "./types";

export const resolveElimination = (args: { player: PlayerState; hit: boolean; time: number }) => {
  if (!args.hit) return args.player;
  return { ...args.player, alive: false, eliminatedAt: args.time };
};
