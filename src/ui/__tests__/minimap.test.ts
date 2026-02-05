import { worldToMinimap } from "../minimap";

test("worldToMinimap maps positions into unit circle", () => {
  const point = worldToMinimap({ x: 50, y: 0 }, 100);
  expect(point.x).toBeCloseTo(0.5);
  expect(point.y).toBeCloseTo(0);
});
