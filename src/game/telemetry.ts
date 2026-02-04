import type { WorldState } from "../sim/types";

export const renderGameToText = (world: WorldState): string => {
  const payload = {
    mode: world.running ? "running" : "stopped",
    time: world.time,
    arena: {
      half: world.arenaHalf,
      origin: "center (0,0), +x right, +y forward",
    },
    players: world.players.map((p) => ({
      id: p.id,
      x: p.pos.x,
      y: p.pos.y,
      alive: p.alive,
    })),
    trails: {
      count: world.trails.length,
    },
  };

  return JSON.stringify(payload);
};
