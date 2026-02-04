import { resolveElimination } from "../match";
import { vec2 } from "../math";

test("player marked eliminated on collision", () => {
  const res = resolveElimination({
    player: {
      id: "p1",
      pos: vec2(0, 0),
      heading: 0,
      turnVel: 0,
      alive: true,
      gapTimer: 0,
      gapOn: true,
      trailId: 0,
    },
    hit: { reason: "TRAIL", by: "b2" },
    time: 10,
  });
  expect(res.alive).toBe(false);
  expect(res.eliminatedAt).toBe(10);
  expect(res.eliminationReason).toBe("TRAIL");
  expect(res.eliminatedBy).toBe("b2");
});
