import { computeCameraRoll, computeChaseCamera } from "../chaseCamera";

test("computeChaseCamera positions camera behind heading", () => {
  const result = computeChaseCamera({
    pos: { x: 0, y: 0 },
    heading: 0,
    height: 10,
    distance: 20,
    lookAhead: 12,
    shoulder: 2,
  });

  expect(result.position.x).toBeCloseTo(-20);
  expect(result.position.y).toBeCloseTo(10);
  expect(result.position.z).toBeCloseTo(2);
  expect(result.target.x).toBeCloseTo(12);
  expect(result.target.z).toBeCloseTo(0);
});

test("computeChaseCamera respects heading rotation", () => {
  const result = computeChaseCamera({
    pos: { x: 5, y: 5 },
    heading: Math.PI / 2,
    height: 8,
    distance: 10,
    lookAhead: 6,
    shoulder: 2,
  });

  expect(result.position.x).toBeCloseTo(3);
  expect(result.position.z).toBeCloseTo(-5);
  expect(result.target.x).toBeCloseTo(5);
  expect(result.target.z).toBeCloseTo(11);
});

test("computeCameraRoll clamps and scales turn velocity", () => {
  expect(computeCameraRoll(0, 0.2, 0.4)).toBeCloseTo(0);
  expect(computeCameraRoll(1, 0.2, 0.4)).toBeCloseTo(0.2);
  expect(computeCameraRoll(5, 0.2, 0.4)).toBeCloseTo(0.4);
  expect(computeCameraRoll(-5, 0.2, 0.4)).toBeCloseTo(-0.4);
});
