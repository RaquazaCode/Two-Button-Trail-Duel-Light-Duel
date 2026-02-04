import { coerceMode, formatConnectionStatus, modeToUseServer } from "../menu";

test("coerceMode normalizes to LOCAL or ONLINE", () => {
  expect(coerceMode("ONLINE")).toBe("ONLINE");
  expect(coerceMode("LOCAL")).toBe("LOCAL");
  expect(coerceMode("something-else")).toBe("LOCAL");
});

test("modeToUseServer maps ONLINE to true", () => {
  expect(modeToUseServer("ONLINE")).toBe(true);
  expect(modeToUseServer("LOCAL")).toBe(false);
});

test("formatConnectionStatus renders human labels", () => {
  expect(formatConnectionStatus("DISCONNECTED")).toBe("Disconnected");
  expect(formatConnectionStatus("CONNECTING")).toBe("Connecting");
  expect(formatConnectionStatus("CONNECTED")).toBe("Connected");
});
