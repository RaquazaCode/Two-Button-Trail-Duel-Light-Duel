import { projectToPlayerMinimap, worldToMinimap } from "../minimap";

test("worldToMinimap maps positions into unit circle", () => {
  const point = worldToMinimap({ x: 50, y: 0 }, 100);
  expect(point.x).toBeCloseTo(0.5);
  expect(point.y).toBeCloseTo(0);
});

test("player-relative minimap projection keeps forward direction at top", () => {
  const point = projectToPlayerMinimap({
    worldPos: { x: 10, y: 0 },
    playerPos: { x: 0, y: 0 },
    playerHeading: 0,
    arenaHalf: 100,
  });
  expect(point.x).toBeCloseTo(0);
  expect(point.y).toBeCloseTo(0.1);
});

test("player-relative minimap projection keeps right side on right", () => {
  const point = projectToPlayerMinimap({
    worldPos: { x: 0, y: -10 },
    playerPos: { x: 0, y: 0 },
    playerHeading: 0,
    arenaHalf: 100,
  });
  expect(point.x).toBeCloseTo(0.1);
  expect(point.y).toBeCloseTo(0);
});
