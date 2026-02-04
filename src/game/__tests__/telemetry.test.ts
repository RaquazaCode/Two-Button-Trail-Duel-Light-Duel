import { renderGameToText } from "../telemetry";
import { vec2 } from "../../sim/math";
import type { WorldState } from "../../sim/types";

const world: WorldState = {
  time: 1.5,
  players: [
    { id: "p1", pos: vec2(1, 2), heading: 0, turnVel: 0, alive: true, gapTimer: 0, gapOn: true, trailId: 0 },
  ],
  trails: [],
  arenaHalf: 50,
  running: true,
};

test("renderGameToText outputs JSON with player and arena", () => {
  const text = renderGameToText(world);
  const data = JSON.parse(text);
  expect(data.mode).toBe("running");
  expect(data.arena.half).toBe(50);
  expect(data.players.length).toBe(1);
  expect(data.players[0].id).toBe("p1");
});
