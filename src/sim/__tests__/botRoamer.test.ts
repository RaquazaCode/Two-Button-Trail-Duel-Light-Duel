import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

test("roamer avoids driving directly at the player when nearby", () => {
  const input = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 200,
    trails: [],
    time: 1,
    playerPos: vec2(8, 0),
    difficulty: "EASY",
    role: "ROAMER",
    goalAngle: 0,
    rng: () => 0.5,
  });

  expect(input).not.toBe(0);
});
