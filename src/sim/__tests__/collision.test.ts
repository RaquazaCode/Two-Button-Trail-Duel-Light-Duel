import { intersectsAny, outOfBounds } from "../collision";
import { vec2 } from "../math";

test("collision detects segment intersection", () => {
  const hit = intersectsAny(
    vec2(0, 0),
    vec2(2, 0),
    [{ start: vec2(1, -1), end: vec2(1, 1), solidAt: 0, owner: "p2", id: 1 }],
    1
  );
  expect(hit).toBe(true);
});

test("bounds detect out of arena", () => {
  expect(outOfBounds(vec2(6, 0), 5)).toBe(true);
});
