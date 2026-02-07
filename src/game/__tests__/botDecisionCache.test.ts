import { createBotDecisionCache, getDecisionInterval } from "../botDecisionCache";

test("decision intervals scale by difficulty", () => {
  expect(getDecisionInterval("EASY")).toBeGreaterThan(getDecisionInterval("MEDIUM"));
  expect(getDecisionInterval("MEDIUM")).toBeGreaterThan(getDecisionInterval("HARD"));
});

test("cache reuses bot decision until interval elapses", () => {
  const cache = createBotDecisionCache("MEDIUM");
  let calls = 0;
  const compute = () => {
    calls += 1;
    return 1 as const;
  };

  const first = cache.get("b1", 0, compute);
  const second = cache.get("b1", 0.03, compute);

  expect(first).toBe(1);
  expect(second).toBe(1);
  expect(calls).toBe(1);

  const third = cache.get("b1", 0.2, compute);
  expect(third).toBe(1);
  expect(calls).toBe(2);
});

test("cache can be reset between matches", () => {
  const cache = createBotDecisionCache("HARD");
  let calls = 0;
  const compute = () => {
    calls += 1;
    return -1 as const;
  };

  cache.get("b2", 0, compute);
  cache.get("b2", 0.02, compute);
  expect(calls).toBe(1);

  cache.reset();
  cache.get("b2", 0.03, compute);
  expect(calls).toBe(2);
});

test("cache breaks endless turning streaks with forced breakout", () => {
  const cache = createBotDecisionCache("EASY", () => 0.5);
  const computeLeft = () => -1 as const;
  let out: -1 | 0 | 1 = 0;

  for (let i = 0; i < 24; i += 1) {
    out = cache.get("b3", i * 0.2, computeLeft);
  }

  expect(out).toBe(0);
});
