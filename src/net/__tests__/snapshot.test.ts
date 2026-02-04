import type { ServerSnapshot } from "../../sim/types";
import { snapshotToWorld } from "../snapshot";

test("snapshotToWorld builds a renderable world state", () => {
  const snapshot: ServerSnapshot = {
    tick: 12,
    time: 3.5,
    arenaHalf: 40,
    players: [
      { id: "p1", pos: { x: 1, y: 2 }, heading: 0.5, alive: true },
    ],
    trails: [],
  };

  const world = snapshotToWorld(snapshot);

  expect(world.time).toBe(3.5);
  expect(world.arenaHalf).toBe(40);
  expect(world.players[0].id).toBe("p1");
  expect(world.players[0].pos.x).toBe(1);
  expect(world.players[0].pos.y).toBe(2);
  expect(world.players[0].turnVel).toBe(0);
  expect(world.players[0].gapTimer).toBe(0);
  expect(world.players[0].gapOn).toBe(true);
  expect(world.players[0].trailId).toBe(0);
});
