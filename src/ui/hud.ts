export const createHUD = () => {
  const status = document.querySelector<HTMLParagraphElement>("#status");

  const update = (args: { time: number; alive: number; total: number }) => {
    if (!status) return;
    status.textContent = `t=${args.time.toFixed(2)}s | alive ${args.alive}/${args.total}`;
  };

  return { update };
};
