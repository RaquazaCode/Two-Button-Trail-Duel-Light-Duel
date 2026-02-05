import { createPerfTracker } from "../perf";

test("createPerfTracker aggregates frame statistics", () => {
  const tracker = createPerfTracker(3);
  tracker.record({ frameMs: 10, updateMs: 2, renderMs: 3, players: 8, trails: 120 });
  tracker.record({ frameMs: 20, updateMs: 4, renderMs: 5, players: 8, trails: 120 });
  tracker.record({ frameMs: 30, updateMs: 6, renderMs: 7, players: 8, trails: 120 });

  const snapshot = tracker.snapshot();
  expect(snapshot.frameMs.avg).toBeCloseTo(20, 1);
  expect(snapshot.frameMs.max).toBeCloseTo(30, 1);
  expect(snapshot.frameMs.p95).toBeCloseTo(30, 1);
  expect(snapshot.fps).toBeCloseTo(50, 1);
});
