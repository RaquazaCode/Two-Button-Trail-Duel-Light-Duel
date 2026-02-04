export type MenuState = {
  entry: number;
  payout: number;
  mode: ModeOption;
};

export type ModeOption = "LOCAL" | "ONLINE";

export const coerceMode = (value: string): ModeOption =>
  value === "ONLINE" ? "ONLINE" : "LOCAL";

export const modeToUseServer = (mode: ModeOption) => mode === "ONLINE";

export const createMenu = (args: MenuState) => {
  const overlay = document.createElement("div");
  const modeButton = (mode: ModeOption) =>
    `<button type="button" class="mode-button${args.mode === mode ? " active" : ""}" data-mode="${mode}">${mode}</button>`;

  overlay.className = "menu";
  overlay.innerHTML = `
    <div class="menu-card">
      <h2>Light Duel</h2>
      <p class="menu-sub">Solo Micro-Stake</p>
      <div class="menu-row">
        <span>Entry</span>
        <strong>${args.entry.toFixed(2)}</strong>
      </div>
      <div class="menu-row">
        <span>Payout</span>
        <strong>${args.payout.toFixed(2)}</strong>
      </div>
      <div class="menu-row menu-mode">
        <span>Mode</span>
        <div class="mode-toggle" role="group" aria-label="Mode">
          ${modeButton("LOCAL")}
          ${modeButton("ONLINE")}
        </div>
      </div>
      <button id="start-btn">Start Match</button>
    </div>
  `;

  const mount = (container: HTMLElement) => container.appendChild(overlay);
  const unmount = () => overlay.remove();

  const onStart = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#start-btn");
    if (btn) btn.onclick = handler;
  };

  const onModeChange = (handler: (mode: ModeOption) => void) => {
    const buttons = overlay.querySelectorAll<HTMLButtonElement>(".mode-button");
    buttons.forEach((button) => {
      button.onclick = () => {
        const nextMode = coerceMode(button.dataset.mode ?? "");
        buttons.forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
        handler(nextMode);
      };
    });
  };

  return { mount, unmount, onStart, onModeChange };
};

export const createResult = (args: { winner: string; hash: string; payout: number }) => {
  const overlay = document.createElement("div");
  overlay.className = "menu";
  overlay.innerHTML = `
    <div class="menu-card">
      <h2>${args.winner} wins</h2>
      <p class="menu-sub">Payout: ${args.payout.toFixed(2)}</p>
      <p class="menu-hash">Match hash: ${args.hash}</p>
      <button id="play-again">Play Again</button>
    </div>
  `;

  const mount = (container: HTMLElement) => container.appendChild(overlay);
  const unmount = () => overlay.remove();

  const onRestart = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#play-again");
    if (btn) btn.onclick = handler;
  };

  return { mount, unmount, onRestart };
};
