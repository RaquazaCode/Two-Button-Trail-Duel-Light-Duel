import { CONFIG } from "../sim/config";
import { stepWorld } from "../sim/step";
import type { WorldState } from "../sim/types";

export type InputProvider = () => Record<string, -1 | 0 | 1>;

export type LoopHandle = {
  stop: () => void;
};

const MAX_STEPS_PER_FRAME = 8;

export const createGameLoop = (
  initial: WorldState,
  inputProvider: InputProvider,
  onUpdate: (world: WorldState, simMs: number) => void
): LoopHandle => {
  let world = initial;
  let last = performance.now();
  let accumulator = 0;
  const dt = 1 / CONFIG.simHz;
  let running = true;

  const tick = (now: number) => {
    if (!running) return;
    const frame = (now - last) / 1000;
    last = now;
    accumulator += Math.min(frame, 0.25);

    const simStart = performance.now();
    let steps = 0;
    while (accumulator >= dt && steps < MAX_STEPS_PER_FRAME) {
      world = stepWorld(world, inputProvider(), dt);
      accumulator -= dt;
      steps += 1;
    }

    if (steps === MAX_STEPS_PER_FRAME && accumulator >= dt) {
      // Avoid spiral-of-death under load by dropping stale backlog.
      accumulator = 0;
    }

    const simMs = performance.now() - simStart;
    onUpdate(world, simMs);
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  return {
    stop: () => {
      running = false;
    },
  };
};
