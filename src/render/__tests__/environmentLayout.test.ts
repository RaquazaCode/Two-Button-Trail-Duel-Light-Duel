import { computeEnvironmentLayout } from "../environmentLayout";

test("computeEnvironmentLayout scales arena visuals", () => {
  const layout = computeEnvironmentLayout(250);

  expect(layout.arenaHalf).toBe(125);
  expect(layout.gridSize).toBeCloseTo(255);
  expect(layout.floorSize).toBeCloseTo(1500);
  expect(layout.stadiumRadius).toBeCloseTo(127.5);
  expect(layout.skylineRadius).toBeCloseTo(400);
});
