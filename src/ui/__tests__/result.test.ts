import {
  getResultActions,
  formatResultCause,
  formatResultSubtitle,
  formatResultTitle,
  type ResultStatus,
} from "../menu";

test("formatResultTitle maps status to label", () => {
  const statuses: ResultStatus[] = ["VICTORY", "ELIMINATED", "TIME_UP"];
  expect(formatResultTitle(statuses[0])).toBe("Victory");
  expect(formatResultTitle(statuses[1])).toBe("Eliminated");
  expect(formatResultTitle(statuses[2])).toBe("Time Up");
});

test("formatResultSubtitle includes survival time and payout", () => {
  const text = formatResultSubtitle({
    survival: 12.3,
    payout: 0.45,
  });
  expect(text).toBe("Survived 00:12 • Payout 0.45");
});

test("formatResultCause explains elimination cause", () => {
  const text = formatResultCause({
    status: "ELIMINATED",
    winner: "b2",
    eliminatedBy: "b2",
    eliminationReason: "TRAIL",
  });
  expect(text).toBe("Eliminated by b2 (trail)");
});

test("getResultActions includes play again and main menu", () => {
  const actions = getResultActions();
  expect(actions).toEqual(["Play Again", "Main Menu"]);
});
