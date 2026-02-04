import { advanceWorld } from "../time";
import { vec2 } from "../../sim/math";
import type { WorldState } from "../../sim/types";

const world: WorldState = {
  time: 0,
  players: [
    { id: "p1", pos: vec2(0, 0), heading: 0, turnVel: 0, alive: true, gapTimer: 0, gapOn: true, trailId: 0 },
  ],
  trails: [],
  arenaHalf: 50,
  running: true,
};

test("advanceWorld steps time by ms", () => {
  const next = advanceWorld(world, { p1: 0 }, 1000, 1 / 60);
  expect(next.time).toBeGreaterThan(0.9);
});
