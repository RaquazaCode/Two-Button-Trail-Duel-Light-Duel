import { formatResultSubtitle, formatResultTitle, type ResultStatus } from "../menu";

test("formatResultTitle maps status to label", () => {
  const statuses: ResultStatus[] = ["VICTORY", "ELIMINATED", "TIME_UP"];
  expect(formatResultTitle(statuses[0])).toBe("Victory");
  expect(formatResultTitle(statuses[1])).toBe("Eliminated");
  expect(formatResultTitle(statuses[2])).toBe("Time Up");
});

test("formatResultSubtitle includes payout and winner", () => {
  const text = formatResultSubtitle({
    status: "ELIMINATED",
    winner: "b2",
    payout: 0,
  });
  expect(text).toBe("Winner: b2 • Payout 0.00");
});
