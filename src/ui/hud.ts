type StatusArgs = {
  time: number;
  alive: number;
  total: number;
  mode: "LOCAL" | "ONLINE";
  roundDuration: number;
};

const formatCountdown = (seconds: number) => {
  const clamped = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const formatStatus = (args: StatusArgs) => {
  const remaining = args.roundDuration - args.time;
  return `round ${formatCountdown(remaining)} | alive ${args.alive}/${args.total} | ${args.mode}`;
};

export const createHUD = () => {
  const status = document.querySelector<HTMLParagraphElement>("#status");

  const update = (args: StatusArgs) => {
    if (!status) return;
    status.textContent = formatStatus(args);
  };

  return { update };
};
