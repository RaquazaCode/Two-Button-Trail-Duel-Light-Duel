import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";
import { CONFIG } from "./config";
import { stepPhysics } from "./physics";
import { intersectsAny, outOfBounds } from "./collision";

const normalizeAngle = (angle: number) => {
  let value = angle % (Math.PI * 2);
  if (value < -Math.PI) value += Math.PI * 2;
  if (value > Math.PI) value -= Math.PI * 2;
  return value;
};

export const chooseBotInput = (args: {
  id: string;
  pos: Vec2;
  heading: number;
  turnVel: number;
  arenaHalf: number;
  trails: TrailSegment[];
  time: number;
  playerPos?: Vec2;
}): -1 | 0 | 1 => {
  const lookahead = 0.5;
  const dt = 1 / CONFIG.simHz;
  const steps = Math.max(1, Math.ceil(lookahead / dt));
  const candidates: Array<-1 | 0 | 1> = [-1, 0, 1];

  const scored = candidates.map((input) => {
    let pos = args.pos;
    let heading = args.heading;
    let turnVel = args.turnVel;
    let safeSteps = 0;

    for (let i = 0; i < steps; i += 1) {
      const next = stepPhysics({
        pos,
        heading,
        turnVel,
        input,
        dt,
        speed: CONFIG.speed,
        turnRate: CONFIG.turnRate,
        inertia: CONFIG.turnInertia,
      });

      const hitTrail = intersectsAny(pos, next.pos, args.trails, args.time);
      const hitWall = outOfBounds(next.pos, args.arenaHalf);
      if (hitWall || hitTrail.hit) break;

      safeSteps += 1;
      pos = next.pos;
      heading = next.heading;
      turnVel = next.turnVel;
    }

    let score = safeSteps / steps;
    if (safeSteps === steps && args.playerPos) {
      const targetAngle = Math.atan2(args.playerPos.y - pos.y, args.playerPos.x - pos.x);
      const delta = Math.abs(normalizeAngle(targetAngle - heading));
      score += 0.2 * (1 - delta / Math.PI);
    }

    return { input, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0].score;
  if (bestScore < 0.5) {
    const turnCandidate = scored.find((entry) => entry.input !== 0);
    if (turnCandidate) return turnCandidate.input;
  }
  const straight = scored.find((entry) => entry.input === 0);
  if (straight && Math.abs(straight.score - bestScore) < 1e-3) return 0;
  return scored[0].input;
};
