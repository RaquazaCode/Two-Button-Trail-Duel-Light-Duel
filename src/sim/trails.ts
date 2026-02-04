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
  if (length > 4) {
    const parts = Math.ceil(length / 4);
    const segments: TrailSegment[] = [];
    for (let i = 0; i < parts; i += 1) {
      const t0 = i / parts;
      const t1 = (i + 1) / parts;
      segments.push({
        id: args.state.trailId + 1 + i,
        owner: args.owner,
        start: {
          x: args.prev.x + dx * t0,
          y: args.prev.y + dz * t0,
        },
        end: {
          x: args.prev.x + dx * t1,
          y: args.prev.y + dz * t1,
        },
        createdAt: args.time,
        solidAt: args.time + args.solidifyDelay,
      });
    }
    return {
      trails: [...args.trails, ...segments],
      gapOnState,
      gapTimer: args.time,
      trailId: args.state.trailId + parts,
    };
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
