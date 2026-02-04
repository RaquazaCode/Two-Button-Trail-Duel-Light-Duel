import { inputToMessage } from "../messages";

test("inputToMessage maps inputs to left/right flags", () => {
  expect(inputToMessage(-1)).toEqual({ left: true, right: false });
  expect(inputToMessage(1)).toEqual({ left: false, right: true });
  expect(inputToMessage(0)).toEqual({ left: false, right: false });
});
