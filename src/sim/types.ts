import type { Vec2 } from "./math";

export type PlayerId = string;
export type EliminationReason = "TRAIL" | "WALL";

export type PlayerState = {
  id: PlayerId;
  pos: Vec2;
  heading: number;
  turnVel: number;
  alive: boolean;
  gapTimer: number;
  gapOn: boolean;
  trailId: number;
  eliminatedAt?: number;
  eliminationReason?: EliminationReason;
  eliminatedBy?: PlayerId;
};

export type TrailSegment = {
  id: number;
  owner: PlayerId;
  start: Vec2;
  end: Vec2;
  createdAt: number;
  solidAt: number;
};

export type WorldState = {
  time: number;
  players: PlayerState[];
  trails: TrailSegment[];
  arenaHalf: number;
  running: boolean;
};

export type ServerSnapshot = {
  tick: number;
  time: number;
  arenaHalf: number;
  players: Array<{
    id: PlayerId;
    pos: Vec2;
    heading: number;
    alive: boolean;
    eliminatedAt?: number;
  }>;
  trails: TrailSegment[];
};
