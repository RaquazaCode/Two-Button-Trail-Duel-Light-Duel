type StatusArgs = { time: number; alive: number; total: number; mode: "LOCAL" | "ONLINE" };

export const formatStatus = (args: StatusArgs) =>
  `t=${args.time.toFixed(2)}s | alive ${args.alive}/${args.total} | ${args.mode}`;

export const createHUD = () => {
  const status = document.querySelector<HTMLParagraphElement>("#status");

  const update = (args: StatusArgs) => {
    if (!status) return;
    status.textContent = formatStatus(args);
  };

  return { update };
};
