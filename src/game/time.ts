import { stepWorld } from "../sim/step";
import type { WorldState } from "../sim/types";

export const advanceWorld = (
  world: WorldState,
  inputs: Record<string, -1 | 0 | 1>,
  ms: number,
  dt: number
): WorldState => {
  const steps = Math.max(1, Math.round(ms / (dt * 1000)));
  let next = world;
  for (let i = 0; i < steps; i += 1) {
    next = stepWorld(next, inputs, dt);
  }
  return next;
};
