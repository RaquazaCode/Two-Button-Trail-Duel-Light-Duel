import { vec2, add, scale, length } from "../math";

test("vec2 math works", () => {
  const a = vec2(3, 4);
  const b = vec2(1, 2);
  const c = add(a, b);
  expect(c.x).toBe(4);
  expect(c.y).toBe(6);
  expect(length(a)).toBe(5);
  const d = scale(a, 2);
  expect(d.x).toBe(6);
  expect(d.y).toBe(8);
});
