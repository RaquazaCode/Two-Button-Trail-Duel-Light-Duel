import { updateTrail } from "../trails";
import { vec2 } from "../math";

test("trail renders continuously when gapOff is zero", () => {
  const res = updateTrail({
    prev: vec2(0, 0),
    next: vec2(1, 0),
    time: 2.05,
    gapOn: 2.0,
    gapOff: 0,
    solidifyDelay: 0.2,
    state: { gapTimer: 2.05, gapOnState: true, trailId: 1 },
    owner: "p1",
    trails: [],
  });

  expect(res.trails.length).toBe(1);
});

test("trail splits abnormal long segments into smaller pieces", () => {
  const res = updateTrail({
    prev: vec2(0, 0),
    next: vec2(100, 0),
    time: 1,
    gapOn: 2.0,
    gapOff: 0.2,
    solidifyDelay: 0.2,
    state: { gapTimer: 0, gapOnState: true, trailId: 1 },
    owner: "p1",
    trails: [],
  });

  expect(res.trails.length).toBeGreaterThan(1);
  expect(res.trails[0].start).toEqual(vec2(0, 0));
  expect(res.trails[res.trails.length - 1].end).toEqual(vec2(100, 0));
});
