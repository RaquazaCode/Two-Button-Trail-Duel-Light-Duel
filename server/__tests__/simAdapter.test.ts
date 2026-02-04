import { CONFIG } from "../../src/sim/config";
import { vec2 } from "../../src/sim/math";
import { buildSnapshot, createWorld } from "../simAdapter";

test("createWorld seeds players and arena bounds", () => {
  const world = createWorld(["p1", "p2"], 0);

  expect(world.players).toHaveLength(2);
  expect(world.arenaHalf).toBe(CONFIG.arenaSize / 2);
  expect(world.running).toBe(true);

  world.players.forEach((player) => {
    expect(Math.abs(player.pos.x)).toBeLessThanOrEqual(world.arenaHalf);
    expect(Math.abs(player.pos.y)).toBeLessThanOrEqual(world.arenaHalf);
  });
});

test("buildSnapshot mirrors world state with tick", () => {
  const world = createWorld(["p1"], 5);
  world.players[0].pos = vec2(3, 4);

  const snapshot = buildSnapshot(world, 42);

  expect(snapshot.tick).toBe(42);
  expect(snapshot.time).toBe(5);
  expect(snapshot.players[0].pos.x).toBe(3);
  expect(snapshot.players[0].pos.y).toBe(4);
});
