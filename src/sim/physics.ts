import { vec2, type Vec2 } from "./math";

export type PhysicsInput = {
  pos: Vec2;
  heading: number;
  turnVel: number;
  input: -1 | 0 | 1;
  dt: number;
  speed: number;
  turnRate: number;
  inertia: number;
};

export const stepPhysics = (p: PhysicsInput) => {
  const target = p.input * p.turnRate;
  const alpha = Math.min(1, p.dt / p.inertia);
  const turnVel = p.turnVel + (target - p.turnVel) * alpha;
  const heading = p.heading + turnVel * p.dt;
  const pos = vec2(
    p.pos.x + Math.cos(heading) * p.speed * p.dt,
    p.pos.y + Math.sin(heading) * p.speed * p.dt
  );
  return { pos, heading, turnVel };
};
