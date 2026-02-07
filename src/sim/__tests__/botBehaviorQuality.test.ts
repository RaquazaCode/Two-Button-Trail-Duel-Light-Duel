import { CONFIG } from "../config";
import { chooseBotInput } from "../bot";
import { assignBotRoles } from "../botRoles";
import { generateSpawnPoints } from "../../game/spawn";
import { vec2 } from "../math";
import { stepWorld } from "../step";
import { createBotDecisionCache } from "../../game/botDecisionCache";

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const runRound = (difficulty: "EASY" | "MEDIUM" | "HARD", seconds: number) => {
  const spawnRng = createRng(42);
  const roleRng = createRng(84);
  const decisionRng = createRng(126);
  const botRng = createRng(168);

  const spawns = generateSpawnPoints({
    count: 9,
    arenaHalf: CONFIG.arenaSize / 2,
    minDistance: CONFIG.speed * 5,
    margin: CONFIG.speed * 2,
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

  const dt = 1 / CONFIG.simHz;
  while (world.time < seconds) {
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
  }

  return world.players.filter((p) => p.alive).length;
};

test("easy mode avoids early full collapse", () => {
  expect(runRound("EASY", 10)).toBeGreaterThanOrEqual(3);
});

test("medium mode remains competitive beyond early game", () => {
  expect(runRound("MEDIUM", 10)).toBeGreaterThanOrEqual(3);
});

test("hard mode avoids immediate full collapse", () => {
  expect(runRound("HARD", 10)).toBeGreaterThanOrEqual(3);
});
