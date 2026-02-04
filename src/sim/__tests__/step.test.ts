import { stepWorld } from "../step";
import { vec2 } from "../math";

test("stepWorld advances time and emits trails", () => {
  const world = {
    time: 0,
    players: [
      {
        id: "p1",
        pos: vec2(0, 0),
        heading: 0,
        turnVel: 0,
        alive: true,
        gapTimer: 0,
        gapOn: true,
        trailId: 0,
      },
    ],
    trails: [],
    arenaHalf: 50,
    running: true,
  };
  const next = stepWorld(world, { p1: 0 }, 1 / 60);
  expect(next.time).toBeGreaterThan(0);
  expect(next.trails.length).toBeGreaterThan(0);
});
