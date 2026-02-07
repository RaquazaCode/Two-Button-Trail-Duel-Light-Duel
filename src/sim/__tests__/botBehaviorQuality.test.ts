import { CONFIG } from "../config";
import { chooseBotInput } from "../bot";
import { assignBotRoles } from "../botRoles";
import { generateSpawnPoints } from "../../game/spawn";
import { vec2 } from "../math";
import { stepWorld } from "../step";
import { createBotDecisionCache } from "../../game/botDecisionCache";
import { TOTAL_PLAYERS } from "../../game/playerContract";

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const TEST_SPAWN_MIN_DISTANCE = CONFIG.arenaSize * 0.18;
const TEST_SPAWN_MARGIN = CONFIG.arenaSize * 0.16;

const runCheckpoints = (
  difficulty: "EASY" | "MEDIUM" | "HARD",
  checkpoints: readonly number[]
) => {
  const spawnRng = createRng(42);
  const roleRng = createRng(84);
  const decisionRng = createRng(126);
  const botRng = createRng(168);

  const spawns = generateSpawnPoints({
    count: TOTAL_PLAYERS,
    arenaHalf: CONFIG.arenaSize / 2,
    minDistance: TEST_SPAWN_MIN_DISTANCE,
    margin: TEST_SPAWN_MARGIN,
    rng: spawnRng,
  });

  let world = {
    time: 0,
    players: spawns.map((spawn, i) => ({
      id: i === 0 ? "p1" : `b${i}`,
      pos: vec2(spawn.pos.x, spawn.pos.y),
      heading: spawn.heading,
      turnVel: 0,
      alive: true,
      gapTimer: 0,
      gapOn: true,
      trailId: 0,
    })),
    trails: [],
    arenaHalf: CONFIG.arenaSize / 2,
    running: true,
  };

  const roles = assignBotRoles(
    world.players.filter((p) => p.id !== "p1").map((p) => p.id),
    difficulty,
    roleRng
  );
  const cache = createBotDecisionCache(difficulty, decisionRng);

  const sorted = [...checkpoints].sort((a, b) => a - b);
  const aliveByTime = new Map<number, number>();

  const dt = 1 / CONFIG.simHz;
  while (world.time < sorted[sorted.length - 1]) {
    const p1 = world.players.find((p) => p.id === "p1");
    const inputs: Record<string, -1 | 0 | 1> = { p1: 0 };
    for (const bot of world.players.filter((p) => p.id !== "p1")) {
      inputs[bot.id] = cache.get(bot.id, world.time, () =>
        chooseBotInput({
          id: bot.id,
          pos: bot.pos,
          heading: bot.heading,
          turnVel: bot.turnVel,
          arenaHalf: world.arenaHalf,
          trails: world.trails,
          time: world.time,
          playerPos: p1?.pos,
          difficulty,
          role: roles.get(bot.id),
          rng: botRng,
        })
      );
    }
    world = stepWorld(world, inputs, dt);

    while (
      aliveByTime.size < sorted.length &&
      world.time >= sorted[aliveByTime.size]
    ) {
      const checkpoint = sorted[aliveByTime.size];
      aliveByTime.set(checkpoint, world.players.filter((p) => p.alive).length);
    }
  }

  return aliveByTime;
};

test("easy mode keeps multiple riders alive through 30s", () => {
  const alive = runCheckpoints("EASY", [10, 30]);
  expect(alive.get(10)).toBeGreaterThanOrEqual(4);
  expect(alive.get(30)).toBeGreaterThanOrEqual(1);
}, 15000);

test("medium mode stays competitive through 30s", () => {
  const alive = runCheckpoints("MEDIUM", [10, 30]);
  expect(alive.get(10)).toBeGreaterThanOrEqual(4);
  expect(alive.get(30)).toBeGreaterThanOrEqual(1);
}, 15000);

test("hard mode preserves pressure without total collapse by 30s", () => {
  const alive = runCheckpoints("HARD", [10, 30]);
  expect(alive.get(10)).toBeGreaterThanOrEqual(5);
  expect(alive.get(30)).toBeGreaterThanOrEqual(1);
}, 15000);
