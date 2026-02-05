type StatusArgs = {
  time: number;
  alive: number;
  total: number;
  mode: "LOCAL" | "ONLINE";
  roundDuration: number;
};

const formatMode = (mode: StatusArgs["mode"]) =>
  mode === "LOCAL" ? "SINGLE PLAYER" : "MULTIPLAYER";

export const formatStatus = (args: StatusArgs) => {
  const remaining = Math.max(0, Math.ceil(args.roundDuration - args.time));
  return `TIME: ${remaining} | ALIVE: ${args.alive}/${args.total} | ${formatMode(args.mode)}`;
};

export const createHUD = () => {
  const status = document.querySelector<HTMLParagraphElement>("#status");

  const update = (args: StatusArgs) => {
    if (!status) return;
    status.textContent = formatStatus(args);
  };

  return { update };
};
