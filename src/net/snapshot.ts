import type { ServerSnapshot, WorldState } from "../sim/types";

export const snapshotToWorld = (snapshot: ServerSnapshot): WorldState => {
  return {
    time: snapshot.time,
    arenaHalf: snapshot.arenaHalf,
    trails: snapshot.trails,
    running: true,
    players: snapshot.players.map((player) => ({
      id: player.id,
      pos: player.pos,
      heading: player.heading,
      alive: player.alive,
      eliminatedAt: player.eliminatedAt,
      turnVel: 0,
      gapTimer: 0,
      gapOn: true,
      trailId: 0,
    })),
  };
};
