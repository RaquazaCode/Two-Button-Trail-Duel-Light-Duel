export type InputMessage = {
  left?: boolean;
  right?: boolean;
};

export const coerceInput = (message: InputMessage): -1 | 0 | 1 => {
  const left = !!message.left;
  const right = !!message.right;
  if (left === right) return 0;
  return left ? -1 : 1;
};
