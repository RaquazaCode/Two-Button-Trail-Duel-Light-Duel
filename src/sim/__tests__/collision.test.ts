import { intersectsAny, outOfBounds } from "../collision";
import { vec2 } from "../math";

test("collision detects segment intersection", () => {
  const hit = intersectsAny(
    vec2(0, 0),
    vec2(2, 0),
    [
      {
        start: vec2(1, -1),
        end: vec2(1, 1),
        solidAt: 0,
        createdAt: 0,
        owner: "p2",
        id: 1,
      },
    ],
    1
  );
  expect(hit.hit).toBe(true);
  expect(hit.owner).toBe("p2");
});

test("self trail ignored within grace window", () => {
  const hit = intersectsAny(
    vec2(0, 0),
    vec2(1, 0),
    [
      {
        start: vec2(0, 0),
        end: vec2(1, 0),
        solidAt: 0,
        createdAt: 1,
        owner: "p1",
        id: 1,
      },
    ],
    1.2,
    { selfId: "p1", selfGrace: 0.35 }
  );

  expect(hit.hit).toBe(false);
});

test("bounds detect out of arena", () => {
  expect(outOfBounds(vec2(6, 0), 5)).toBe(true);
});
