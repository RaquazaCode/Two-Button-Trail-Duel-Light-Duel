import { formatStatus } from "../hud";

test("HUD displays seconds-only countdown and ALIVE format", () => {
  const text = formatStatus({ time: 12, alive: 4, total: 8, mode: "LOCAL", roundDuration: 100 });
  expect(text).toContain("TIME: 88");
  expect(text).toContain("ALIVE: 4/8");
});
