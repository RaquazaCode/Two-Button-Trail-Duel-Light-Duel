import { evaluateOutcome } from "../outcome";
import { vec2 } from "../../sim/math";
import type { PlayerState, WorldState } from "../../sim/types";

const basePlayer = (overrides: Partial<PlayerState>): PlayerState => ({
  id: "p1",
  pos: vec2(0, 0),
  heading: 0,
  turnVel: 0,
  alive: true,
  gapTimer: 0,
  gapOn: true,
  trailId: 0,
  ...overrides,
});

const makeWorld = (players: PlayerState[], time = 10): WorldState => ({
  time,
  players,
  trails: [],
  arenaHalf: 50,
  running: true,
});

test("ends immediately when the local player is eliminated", () => {
  const world = makeWorld([
    basePlayer({ alive: false, eliminatedAt: 6, eliminationReason: "TRAIL", eliminatedBy: "b2" }),
    basePlayer({ id: "b1" }),
    basePlayer({ id: "b2" }),
  ]);

  const outcome = evaluateOutcome(world, "p1", 90);
  expect(outcome.finished).toBe(true);
  if (!outcome.finished) return;
  expect(outcome.status).toBe("ELIMINATED");
  expect(outcome.eliminatedBy).toBe("b2");
});

test("declares victory when only the player remains", () => {
  const world = makeWorld([basePlayer({ alive: true })], 20);
  const outcome = evaluateOutcome(world, "p1", 90);
  expect(outcome.finished).toBe(true);
  if (!outcome.finished) return;
  expect(outcome.status).toBe("VICTORY");
});

test("ends with time up when the round timer expires", () => {
  const world = makeWorld([basePlayer({ alive: true }), basePlayer({ id: "b1", alive: true })], 91);
  const outcome = evaluateOutcome(world, "p1", 90);
  expect(outcome.finished).toBe(true);
  if (!outcome.finished) return;
  expect(outcome.status).toBe("TIME_UP");
});

test("continues while multiple players are alive before time expires", () => {
  const world = makeWorld([basePlayer({ alive: true }), basePlayer({ id: "b1", alive: true })], 20);
  const outcome = evaluateOutcome(world, "p1", 90);
  expect(outcome.finished).toBe(false);
});
