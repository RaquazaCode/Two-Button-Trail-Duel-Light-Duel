import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

const trails: any[] = [];

test("roamer vs hunter prefer different targets", () => {
  const roamerInput = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos: vec2(20, 0),
    difficulty: "EASY",
    role: "ROAMER",
    goalAngle: Math.PI,
    rng: () => 0.1,
  });

  const hunterInput = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos: vec2(20, 0),
    difficulty: "EASY",
    role: "HUNTER",
    goalAngle: Math.PI,
    rng: () => 0.1,
  });

  expect(roamerInput).not.toBe(hunterInput);
});
