export const inputToMessage = (input: -1 | 0 | 1) => ({
  left: input === -1,
  right: input === 1,
});
