export type EnvironmentLayout = {
  arenaHalf: number;
  gridSize: number;
  gridCell: number;
  gridMajorEvery: number;
  gridMinorLine: number;
  gridMajorLine: number;
  floorSize: number;
  stadiumRadius: number;
  stadiumTube: number;
  stadiumHeight: number;
  skylineLayers: Array<{
    radius: number;
    count: number;
    minHeight: number;
    maxHeight: number;
    opacity: number;
    stripCount: number;
    billboardCount: number;
  }>;
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
    stadiumTube: 4,
    stadiumHeight: 8,
    skylineLayers: [
      {
        radius: arenaHalf * 2.2,
        count: Math.max(28, Math.round(arenaSize / 7)),
        minHeight: 26,
        maxHeight: 70,
        opacity: 0.9,
        stripCount: 2,
        billboardCount: 1,
      },
      {
        radius: arenaHalf * 3.2,
        count: Math.max(34, Math.round(arenaSize / 6)),
        minHeight: 34,
        maxHeight: 90,
        opacity: 0.7,
        stripCount: 3,
        billboardCount: 2,
      },
      {
        radius: arenaHalf * 4.4,
        count: Math.max(40, Math.round(arenaSize / 5)),
        minHeight: 40,
        maxHeight: 110,
        opacity: 0.5,
        stripCount: 3,
        billboardCount: 3,
      },
    ],
  };
};
