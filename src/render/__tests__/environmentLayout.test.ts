import { computeEnvironmentLayout } from "../environmentLayout";

test("computeEnvironmentLayout scales arena visuals", () => {
  const layout = computeEnvironmentLayout(250);

  expect(layout.arenaHalf).toBe(125);
  expect(layout.gridSize).toBeCloseTo(250);
  expect(layout.floorSize).toBeCloseTo(250);
  expect(layout.stadiumRadius).toBeCloseTo(125);
  expect(layout.stadiumTube).toBeCloseTo(10);
  expect(layout.stadiumHeight).toBeCloseTo(18);
  expect(layout.skylineLayers.length).toBe(3);
  expect(layout.skylineLayers[0].radius).toBeCloseTo(275);
  expect(layout.skylineLayers[1].radius).toBeCloseTo(400);
  expect(layout.skylineLayers[2].radius).toBeCloseTo(550);
});

test("computeEnvironmentLayout caps skyline counts for huge arenas", () => {
  const layout = computeEnvironmentLayout(2500);

  layout.skylineLayers.forEach((layer) => {
    expect(layer.count).toBeLessThanOrEqual(140);
  });
});
