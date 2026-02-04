export const arenaHalfAt = (
  time: number,
  half: number,
  start: number,
  end: number,
  shrinkTo: number
) => {
  if (time <= start) return half;
  if (time >= end) return half * shrinkTo;
  const t = (time - start) / (end - start);
  return half + (half * shrinkTo - half) * t;
};
