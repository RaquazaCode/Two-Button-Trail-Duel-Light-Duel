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
    baseHeight: number;
  }>;
};

export const computeEnvironmentLayout = (arenaSize: number): EnvironmentLayout => {
  const arenaHalf = arenaSize / 2;
  const gridCell = 10;
  const gridMajorEvery = 5;
  const capCount = (value: number) => Math.min(140, Math.max(28, value));

  return {
    arenaHalf,
    gridSize: arenaSize,
    gridCell,
    gridMajorEvery,
    gridMinorLine: 0.08,
    gridMajorLine: 0.2,
    floorSize: arenaSize,
    stadiumRadius: arenaHalf,
    stadiumTube: 10,
    stadiumHeight: 18,
    skylineLayers: [
      {
        radius: arenaHalf * 1.8,
        count: capCount(Math.round(arenaSize / 10)),
        minHeight: 60,
        maxHeight: 150,
        opacity: 0.95,
        stripCount: 4,
        billboardCount: 1,
        baseHeight: 10,
      },
      {
        radius: arenaHalf * 2.2,
        count: capCount(Math.round(arenaSize / 9)),
        minHeight: 50,
        maxHeight: 130,
        opacity: 0.95,
        stripCount: 3,
        billboardCount: 1,
        baseHeight: 12,
      },
      {
        radius: arenaHalf * 3.2,
        count: capCount(Math.round(arenaSize / 8)),
        minHeight: 70,
        maxHeight: 170,
        opacity: 0.75,
        stripCount: 4,
        billboardCount: 1,
        baseHeight: 16,
      },
      {
        radius: arenaHalf * 4.4,
        count: capCount(Math.round(arenaSize / 7)),
        minHeight: 90,
        maxHeight: 210,
        opacity: 0.6,
        stripCount: 4,
        billboardCount: 1,
        baseHeight: 22,
      },
    ],
  };
};
