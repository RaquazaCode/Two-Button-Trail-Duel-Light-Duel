import { type Vec2 } from "./math";
import { type TrailSegment } from "./types";

export const updateTrail = (args: {
  prev: Vec2;
  next: Vec2;
  time: number;
  gapOn: number;
  gapOff: number;
  solidifyDelay: number;
  state: { gapTimer: number; gapOnState: boolean; trailId: number };
  owner: string;
  trails: TrailSegment[];
}) => {
  const total = args.gapOn + args.gapOff;
  const mod = args.time % total;
  const gapOnState = mod < args.gapOn;

  if (!gapOnState) {
    return { trails: args.trails, gapOnState, gapTimer: args.time };
  }

  const dx = args.next.x - args.prev.x;
  const dz = args.next.y - args.prev.y;
  const length = Math.hypot(dx, dz);
  if (length > 8) {
    return { trails: args.trails, gapOnState, gapTimer: args.time };
  }

  const seg: TrailSegment = {
    id: args.state.trailId + 1,
    owner: args.owner,
    start: args.prev,
    end: args.next,
    createdAt: args.time,
    solidAt: args.time + args.solidifyDelay,
  };

  return {
    trails: [...args.trails, seg],
    gapOnState,
    gapTimer: args.time,
    trailId: seg.id,
  };
};
