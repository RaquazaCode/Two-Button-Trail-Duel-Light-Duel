import { computeEnvironmentLayout } from "../environmentLayout";

test("computeEnvironmentLayout scales arena visuals", () => {
  const layout = computeEnvironmentLayout(250);

  expect(layout.arenaHalf).toBe(125);
  expect(layout.gridSize).toBeCloseTo(255);
  expect(layout.floorSize).toBeCloseTo(1500);
  expect(layout.stadiumRadius).toBeCloseTo(127.5);
  expect(layout.stadiumTube).toBeCloseTo(4);
  expect(layout.stadiumHeight).toBeCloseTo(8);
  expect(layout.skylineLayers.length).toBe(3);
  expect(layout.skylineLayers[0].radius).toBeCloseTo(275);
  expect(layout.skylineLayers[1].radius).toBeCloseTo(400);
  expect(layout.skylineLayers[2].radius).toBeCloseTo(550);
});
