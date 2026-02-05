import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";
import { CONFIG } from "./config";
import { stepPhysics } from "./physics";
import { intersectsAny, outOfBounds } from "./collision";
import { getDifficultyProfile, type Difficulty } from "./difficulty";

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
  difficulty: Difficulty;
  rng?: () => number;
}): -1 | 0 | 1 => {
  const rng = args.rng ?? Math.random;
  const profile = getDifficultyProfile(args.difficulty);
  const lookahead = 0.5 / profile.reactionScale;
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

    if (args.playerPos && safeSteps > 0) {
      const dx = args.playerPos.x - pos.x;
      const dy = args.playerPos.y - pos.y;
      const distance = Math.hypot(dx, dy);
      const targetAngle = Math.atan2(dy, dx);
      const delta = normalizeAngle(targetAngle - heading);
      const forwardBias = Math.max(0, 1 - Math.abs(delta) / Math.PI);
      score += profile.pressure * 0.15 * forwardBias;

      if (distance < CONFIG.speed * 6) {
        const cutoffInput: -1 | 1 = delta >= 0 ? -1 : 1;
        if (input === cutoffInput) {
          score += profile.aggression * 0.25 * forwardBias;
        }
      }

      if (input !== 0 && rng() < profile.cooperationChance) {
        score += 0.12;
      }

      score *= 1 + profile.riskTolerance * 0.05;
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
