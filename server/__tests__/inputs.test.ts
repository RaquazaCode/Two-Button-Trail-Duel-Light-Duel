import { coerceInput } from "../inputs";

test("coerceInput prefers single direction", () => {
  expect(coerceInput({ left: true, right: false })).toBe(-1);
  expect(coerceInput({ left: false, right: true })).toBe(1);
  expect(coerceInput({ left: false, right: false })).toBe(0);
});

test("coerceInput cancels opposing inputs", () => {
  expect(coerceInput({ left: true, right: true })).toBe(0);
});
