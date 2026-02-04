import { CONFIG } from "../sim/config";
import { stepWorld } from "../sim/step";
import type { WorldState } from "../sim/types";

export type InputProvider = () => Record<string, -1 | 0 | 1>;

export type LoopHandle = {
  stop: () => void;
};

export const createGameLoop = (
  initial: WorldState,
  inputProvider: InputProvider,
  onUpdate: (world: WorldState) => void
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

    while (accumulator >= dt) {
      world = stepWorld(world, inputProvider(), dt);
      accumulator -= dt;
    }

    onUpdate(world);
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  return {
    stop: () => {
      running = false;
    },
  };
};
