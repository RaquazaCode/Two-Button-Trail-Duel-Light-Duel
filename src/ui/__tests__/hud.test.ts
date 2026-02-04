import { formatStatus } from "../hud";

test("formatStatus includes round countdown, alive, and mode", () => {
  const text = formatStatus({ time: 1.234, alive: 3, total: 8, mode: "LOCAL", roundDuration: 90 });
  expect(text).toBe("round 01:29 | alive 3/8 | LOCAL");
});
