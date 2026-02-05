import { coerceMode, formatConnectionStatus, formatModeLabel, modeToUseServer } from "../menu";

test("coerceMode normalizes to LOCAL or ONLINE", () => {
  expect(coerceMode("ONLINE")).toBe("ONLINE");
  expect(coerceMode("LOCAL")).toBe("LOCAL");
  expect(coerceMode("something-else")).toBe("LOCAL");
});

test("modeToUseServer maps ONLINE to true", () => {
  expect(modeToUseServer("ONLINE")).toBe(true);
  expect(modeToUseServer("LOCAL")).toBe(false);
});

test("mode labels are user friendly", () => {
  expect(formatModeLabel("LOCAL")).toBe("Single Player");
  expect(formatModeLabel("ONLINE")).toBe("Online (Multiplayer)");
});

test("formatConnectionStatus renders human labels", () => {
  expect(formatConnectionStatus("DISCONNECTED")).toBe("Disconnected");
  expect(formatConnectionStatus("CONNECTING")).toBe("Connecting");
  expect(formatConnectionStatus("CONNECTED")).toBe("Connected");
});
