import { createEnvUpdateGate } from "../envGate";

test("env update gate throttles by stride", () => {
  const gate = createEnvUpdateGate({ stride: 3, maxFrameMs: 40, sampleSize: 3 });
  expect(gate.shouldUpdate(16)).toBe(false);
  expect(gate.shouldUpdate(16)).toBe(false);
  expect(gate.shouldUpdate(16)).toBe(true);
});

test("env update gate disables when frame time spikes", () => {
  const gate = createEnvUpdateGate({ stride: 1, maxFrameMs: 30, sampleSize: 3 });
  expect(gate.shouldUpdate(20)).toBe(true);
  expect(gate.shouldUpdate(50)).toBe(false);
  expect(gate.shouldUpdate(50)).toBe(false);
});
