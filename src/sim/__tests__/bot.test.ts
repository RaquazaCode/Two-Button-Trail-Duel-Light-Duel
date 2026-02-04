import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

test("bot avoids a trail directly ahead", () => {
  const input = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 50,
    trails: [
      {
        id: 1,
        owner: "p1",
        start: vec2(5, -0.3),
        end: vec2(5, 0.3),
        createdAt: 0,
        solidAt: 0,
      },
    ],
    time: 10,
    playerPos: vec2(40, 0),
  });
  expect(input).not.toBe(0);
});
