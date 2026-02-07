import { stepWorld } from "../step";
import { vec2 } from "../math";
import { CONFIG } from "../config";

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

test("stepWorld prunes trails beyond trail lifetime", () => {
  const world = {
    time: CONFIG.trailLifetime + 0.5,
    players: [
      {
        id: "p1",
        pos: vec2(0, 0),
        heading: 0,
        turnVel: 0,
        alive: true,
        gapTimer: 0,
        gapOn: true,
        trailId: 200,
      },
    ],
    trails: [
      {
        id: 1,
        owner: "p1",
        start: vec2(-5, 0),
        end: vec2(-4, 0),
        createdAt: 0,
        solidAt: 0.2,
      },
      {
        id: 2,
        owner: "p1",
        start: vec2(-1, 0),
        end: vec2(0, 0),
        createdAt: CONFIG.trailLifetime - 0.1,
        solidAt: CONFIG.trailLifetime,
      },
    ],
    arenaHalf: 200,
    running: true,
  };

  const next = stepWorld(world, { p1: 0 }, 1 / CONFIG.simHz);
  const cutoff = next.time - CONFIG.trailLifetime;

  expect(next.trails.some((trail) => trail.id === 1)).toBe(false);
  expect(next.trails.every((trail) => trail.createdAt >= cutoff)).toBe(true);
});
