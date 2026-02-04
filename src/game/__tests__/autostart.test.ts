import { shouldAutoStart } from "../autostart";

test("auto-starts when autostart query is enabled", () => {
  expect(shouldAutoStart("?autostart=1")).toBe(true);
  expect(shouldAutoStart("?autostart=true")).toBe(true);
  expect(shouldAutoStart("?foo=bar&autostart=yes")).toBe(true);
});

test("does not auto-start without the query", () => {
  expect(shouldAutoStart("")).toBe(false);
  expect(shouldAutoStart("?foo=bar")).toBe(false);
  expect(shouldAutoStart("?autostart=0")).toBe(false);
});
