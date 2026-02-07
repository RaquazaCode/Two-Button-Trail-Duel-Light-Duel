import { chooseBotInput } from "../bot";
import { vec2 } from "../math";
import { stepPhysics } from "../physics";
import { CONFIG } from "../config";

const trails: any[] = [];

test("roamer keeps more distance while hunter pressures the player", () => {
  const initialPos = vec2(0, 0);
  const playerPos = vec2(20, 0);

  const roamerInput = chooseBotInput({
    id: "b1",
    pos: initialPos,
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos,
    difficulty: "EASY",
    role: "ROAMER",
    goalAngle: Math.PI,
    rng: () => 0.1,
  });

  const hunterInput = chooseBotInput({
    id: "b1",
    pos: initialPos,
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos,
    difficulty: "EASY",
    role: "HUNTER",
    goalAngle: Math.PI,
    rng: () => 0.1,
  });

  const dt = 0.6;
  const roamerNext = stepPhysics({
    pos: initialPos,
    heading: 0,
    turnVel: 0,
    input: roamerInput,
    dt,
    speed: CONFIG.speed,
    turnRate: CONFIG.turnRate,
    inertia: CONFIG.turnInertia,
  }).pos;
  const hunterNext = stepPhysics({
    pos: initialPos,
    heading: 0,
    turnVel: 0,
    input: hunterInput,
    dt,
    speed: CONFIG.speed,
    turnRate: CONFIG.turnRate,
    inertia: CONFIG.turnInertia,
  }).pos;

  const roamerDistance = Math.hypot(playerPos.x - roamerNext.x, playerPos.y - roamerNext.y);
  const hunterDistance = Math.hypot(playerPos.x - hunterNext.x, playerPos.y - hunterNext.y);
  expect(roamerDistance).toBeGreaterThanOrEqual(hunterDistance);
});
