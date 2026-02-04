import { coerceMode, modeToUseServer } from "../menu";

test("coerceMode normalizes to LOCAL or ONLINE", () => {
  expect(coerceMode("ONLINE")).toBe("ONLINE");
  expect(coerceMode("LOCAL")).toBe("LOCAL");
  expect(coerceMode("something-else")).toBe("LOCAL");
});

test("modeToUseServer maps ONLINE to true", () => {
  expect(modeToUseServer("ONLINE")).toBe(true);
  expect(modeToUseServer("LOCAL")).toBe(false);
});
