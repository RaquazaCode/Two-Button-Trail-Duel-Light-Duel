export const PLAYER_COLOR = 0x00f5ff;

const BOT_COLORS = [
  0xff2dfb,
  0x39ff14,
  0xff7a00,
  0xffe600,
  0x9b00ff,
  0xff003c,
  0x007bff,
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
