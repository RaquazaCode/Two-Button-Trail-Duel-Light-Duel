import { formatStatus } from "../hud";

test("formatStatus includes time, alive, and mode", () => {
  const text = formatStatus({ time: 1.234, alive: 3, total: 8, mode: "LOCAL" });
  expect(text).toBe("t=1.23s | alive 3/8 | LOCAL");
});
