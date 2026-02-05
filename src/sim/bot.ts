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
  role?: "HUNTER" | "ROAMER";
  goalAngle?: number;
  rng?: () => number;
}): -1 | 0 | 1 => {
  const rng = args.rng ?? Math.random;
  const profile = getDifficultyProfile(args.difficulty);
  const role = args.role ?? "ROAMER";
  const lookahead = args.difficulty === "HARD" ? 0.7 : 0.5 / profile.reactionScale;
  const dt = 1 / CONFIG.simHz;
  const steps = Math.max(1, Math.ceil(lookahead / dt));
  const candidates: Array<-1 | 0 | 1> = [-1, 0, 1];

  const hashToUnit = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0) / 4294967296;
  };

  const goalDuration = role === "ROAMER" ? 3.2 : 2.4;
  const goalBucket = Math.floor(args.time / goalDuration);
  const goalSeed = hashToUnit(`${args.id}:${goalBucket}:${role}`);
  const goalAngle = args.goalAngle ?? goalSeed * Math.PI * 2;
  const goalWeight = role === "ROAMER" ? 0.32 : 0.18;
  const sampleCount = args.difficulty === "HARD" ? 6 : 1;

  const scoreCandidate = (input: -1 | 0 | 1) => {
    let total = 0;
    for (let sample = 0; sample < sampleCount; sample += 1) {
      let pos = args.pos;
      let heading = args.heading;
      let turnVel = args.turnVel;
      let safeSteps = 0;

      for (let i = 0; i < steps; i += 1) {
        let stepInput = input;
        if (args.difficulty === "HARD" && sampleCount > 1 && i > 0) {
          const r = rng();
          stepInput = r < 0.34 ? -1 : r < 0.68 ? 0 : 1;
        }

        const next = stepPhysics({
          pos,
          heading,
          turnVel,
          input: stepInput,
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
      if (safeSteps === steps) {
        const deltaGoal = Math.abs(normalizeAngle(goalAngle - heading));
        score += goalWeight * (1 - deltaGoal / Math.PI);
      }

      if (role === "HUNTER" && args.playerPos && safeSteps > 0) {
        const dx = args.playerPos.x - pos.x;
        const dy = args.playerPos.y - pos.y;
        const distance = Math.hypot(dx, dy);
        const targetAngle = Math.atan2(dy, dx);
        const delta = normalizeAngle(targetAngle - heading);
        const forwardBias = Math.max(0, 1 - Math.abs(delta) / Math.PI);
        score += profile.pressure * 0.2 * forwardBias;

        if (distance < CONFIG.speed * 6) {
          const cutoffInput: -1 | 1 = delta >= 0 ? -1 : 1;
          if (input === cutoffInput) {
            score += profile.aggression * 0.3 * forwardBias;
          }
        }
      }

      score *= 1 + profile.riskTolerance * 0.06;
      total += score;
    }

    return total / sampleCount;
  };

  const scored = candidates.map((input) => ({ input, score: scoreCandidate(input) }));

  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0].score;
  if (role === "ROAMER") {
    const deltaGoal = normalizeAngle(goalAngle - args.heading);
    const preferred: -1 | 1 = deltaGoal >= 0 ? 1 : -1;
    const top = scored[0];
    const second = scored[1];
    if (second && Math.abs(top.score - second.score) < 1e-3) {
      return preferred;
    }
  }
  if (bestScore < 0.5) {
    const turnCandidate = scored.find((entry) => entry.input !== 0);
    if (turnCandidate) return turnCandidate.input;
  }
  const straight = scored.find((entry) => entry.input === 0);
  if (straight && Math.abs(straight.score - bestScore) < 1e-3) return 0;
  return scored[0].input;
};
