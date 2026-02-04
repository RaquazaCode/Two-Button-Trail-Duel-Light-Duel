import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

test("bot chooses a safe direction", () => {
  const input = chooseBotInput({
    pos: vec2(0, 0),
    heading: 0,
    arenaHalf: 10,
    trails: [],
  });
  expect([-1, 0, 1]).toContain(input);
});
