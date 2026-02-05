import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

const trails: any[] = [];

test("hard difficulty prefers aggressive cut-off vs easy", () => {
  const easyInput = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos: vec2(20, 8),
    difficulty: "EASY",
    rng: () => 0.1,
  });

  const hardInput = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos: vec2(20, 8),
    difficulty: "HARD",
    rng: () => 0.1,
  });

  expect(easyInput).toBe(0);
  expect(hardInput).not.toBe(0);
});
