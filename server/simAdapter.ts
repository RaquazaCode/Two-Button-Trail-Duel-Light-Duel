import { CONFIG } from "../src/sim/config";
import { vec2 } from "../src/sim/math";
import type { PlayerState, TrailSegment, WorldState } from "../src/sim/types";

export type ServerSnapshot = {
  tick: number;
  time: number;
  arenaHalf: number;
  players: Array<{
    id: string;
    pos: PlayerState["pos"];
    heading: number;
    alive: boolean;
    eliminatedAt?: number;
  }>;
  trails: TrailSegment[];
};

export const createWorld = (playerIds: string[], now = 0): WorldState => {
  const arenaHalf = CONFIG.arenaSize / 2;
  const radius = arenaHalf * 0.6;
  const count = Math.max(1, playerIds.length);

  const players = playerIds.map((id, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      id,
      pos: vec2(Math.cos(angle) * radius, Math.sin(angle) * radius),
      heading: angle + Math.PI,
      turnVel: 0,
      alive: true,
      gapTimer: 0,
      gapOn: true,
      trailId: 0,
    } satisfies PlayerState;
  });

  return {
    time: now,
    players,
    trails: [],
    arenaHalf,
    running: true,
  };
};

export const buildSnapshot = (world: WorldState, tick: number): ServerSnapshot => {
  return {
    tick,
    time: world.time,
    arenaHalf: world.arenaHalf,
    players: world.players.map((player) => ({
      id: player.id,
      pos: player.pos,
      heading: player.heading,
      alive: player.alive,
      eliminatedAt: player.eliminatedAt,
    })),
    trails: world.trails,
  };
};
