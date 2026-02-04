export type EnvironmentLayout = {
  arenaHalf: number;
  gridSize: number;
  gridCell: number;
  gridMajorEvery: number;
  gridMinorLine: number;
  gridMajorLine: number;
  floorSize: number;
  stadiumRadius: number;
  skylineRadius: number;
  skylineCount: number;
};

export const computeEnvironmentLayout = (arenaSize: number): EnvironmentLayout => {
  const arenaHalf = arenaSize / 2;
  const gridCell = 10;
  const gridMajorEvery = 5;

  return {
    arenaHalf,
    gridSize: arenaSize * 1.02,
    gridCell,
    gridMajorEvery,
    gridMinorLine: 0.08,
    gridMajorLine: 0.2,
    floorSize: arenaSize * 6,
    stadiumRadius: arenaHalf * 1.02,
    skylineRadius: arenaHalf * 3.2,
    skylineCount: Math.max(24, Math.round(arenaSize / 8)),
  };
};
