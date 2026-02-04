import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";

export const chooseBotInput = (args: {
  pos: Vec2;
  heading: number;
  arenaHalf: number;
  trails: TrailSegment[];
}): -1 | 0 | 1 => {
  if (Math.abs(args.pos.x) > args.arenaHalf * 0.8) return args.pos.x > 0 ? -1 : 1;
  if (Math.abs(args.pos.y) > args.arenaHalf * 0.8) return args.pos.y > 0 ? -1 : 1;
  return 0;
};
