import type { EliminationReason, PlayerId, WorldState } from "../sim/types";
import type { ResultStatus } from "../ui/menu";

export type MatchOutcome =
  | { finished: false }
  | {
      finished: true;
      status: ResultStatus;
      winner: PlayerId;
      survival: number;
      eliminationReason?: EliminationReason;
      eliminatedBy?: PlayerId;
    };

export const evaluateOutcome = (
  world: WorldState,
  playerId: PlayerId,
  roundDuration: number
): MatchOutcome => {
  const player = world.players.find((entry) => entry.id === playerId);
  if (!player) return { finished: false };

  const alive = world.players.filter((entry) => entry.alive);
  const timeUp = world.time >= roundDuration;

  if (!player.alive) {
    return {
      finished: true,
      status: "ELIMINATED",
      winner: alive[0]?.id ?? "none",
      survival: world.time,
      eliminationReason: player.eliminationReason,
      eliminatedBy: player.eliminatedBy,
    };
  }

  if (timeUp) {
    return {
      finished: true,
      status: "TIME_UP",
      winner: alive[0]?.id ?? playerId,
      survival: world.time,
    };
  }

  if (alive.length <= 1) {
    return {
      finished: true,
      status: "VICTORY",
      winner: playerId,
      survival: world.time,
    };
  }

  return { finished: false };
};
