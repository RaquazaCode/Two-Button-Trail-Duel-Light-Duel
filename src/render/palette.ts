export const PLAYER_COLOR = 0x00f5ff;

const BOT_COLORS = [
  0xff3b30,
  0xff9500,
  0xffd60a,
  0x34c759,
  0x30d5c8,
  0xaf52de,
  0xff2d55,
];

const extractIndex = (id: string) => {
  const match = id.match(/\d+/);
  if (!match) return 0;
  return Math.max(0, parseInt(match[0], 10) - 1);
};

export const getPlayerColor = (id: string) => {
  if (id === "p1") return PLAYER_COLOR;
  const index = extractIndex(id);
  return BOT_COLORS[index % BOT_COLORS.length];
};
