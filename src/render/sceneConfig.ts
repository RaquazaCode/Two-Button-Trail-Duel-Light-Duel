export const getPixelRatio = (devicePixelRatio?: number) => {
  const ratio = devicePixelRatio ?? 1;
  return Math.min(1.5, Math.max(1, ratio));
};

export const getCameraFar = (arenaSize: number) => {
  return Math.max(900, arenaSize * 3);
};
