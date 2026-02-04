import { getPlayerColor, PLAYER_COLOR } from "../palette";

test("getPlayerColor returns cyan for player one", () => {
  expect(getPlayerColor("p1")).toBe(PLAYER_COLOR);
});

test("getPlayerColor assigns distinct spectrum colors for bots", () => {
  const bots = ["b1", "b2", "b3", "b4", "b5", "b6", "b7"];
  const colors = bots.map((id) => getPlayerColor(id));
  expect(new Set(colors).size).toBe(colors.length);
});
