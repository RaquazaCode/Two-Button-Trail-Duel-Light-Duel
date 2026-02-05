export type MenuState = {
  entry: number;
  payout: number;
  mode: ModeOption;
  status: ConnectionStatus;
};

export type ModeOption = "LOCAL" | "ONLINE";
export type DifficultyOption = "EASY" | "MEDIUM" | "HARD";
export type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";
export type ResultStatus = "VICTORY" | "ELIMINATED" | "TIME_UP";

export const formatResultTitle = (status: ResultStatus) => {
  if (status === "VICTORY") return "Victory";
  if (status === "TIME_UP") return "Time Up";
  return "Eliminated";
};

const formatCountdown = (seconds: number) => {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const formatResultSubtitle = (args: { survival: number; payout: number }) =>
  `Survived ${formatCountdown(args.survival)} • Payout ${args.payout.toFixed(2)}`;

export const formatResultCause = (args: {
  status: ResultStatus;
  winner: string;
  eliminatedBy?: string;
  eliminationReason?: "TRAIL" | "WALL";
}) => {
  if (args.status === "VICTORY") return "You outlasted every rival.";
  if (args.status === "TIME_UP") return `Time up. Winner: ${args.winner}`;
  if (args.eliminationReason === "WALL") return "Crashed into the arena wall.";
  if (args.eliminationReason === "TRAIL" && args.eliminatedBy) {
    const label = args.eliminatedBy === "p1" ? "your trail" : `${args.eliminatedBy} (trail)`;
    return `Eliminated by ${label}`;
  }
  return "Eliminated.";
};

export const getResultActions = () => ["Play Again", "Main Menu"] as const;

export const formatModeLabel = (mode: ModeOption) =>
  mode === "LOCAL" ? "Single Player" : "Online (Multiplayer)";

export const coerceMode = (value: string): ModeOption =>
  value === "ONLINE" ? "ONLINE" : "LOCAL";

export const modeToUseServer = (mode: ModeOption) => mode === "ONLINE";

export const formatConnectionStatus = (status: ConnectionStatus) => {
  if (status === "CONNECTING") return "Connecting";
  if (status === "CONNECTED") return "Connected";
  return "Disconnected";
};

export const createMenu = (args: MenuState) => {
  const overlay = document.createElement("div");
  const modeButton = (mode: ModeOption) =>
    `<button type="button" class="mode-button${args.mode === mode ? " active" : ""}" data-mode="${mode}">${formatModeLabel(
      mode
    )}</button>`;

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
      <p class="menu-status" id="menu-status">${formatConnectionStatus(args.status)}</p>
      <button id="start-btn">Start Match</button>
      <button id="diagnostics-btn" class="secondary">Connection Issues / Lag?</button>
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

  const onDiagnostics = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#diagnostics-btn");
    if (btn) btn.onclick = handler;
  };

  const setStatus = (status: ConnectionStatus) => {
    const node = overlay.querySelector<HTMLParagraphElement>("#menu-status");
    if (!node) return;
    node.textContent = formatConnectionStatus(status);
  };

  return { mount, unmount, onStart, onModeChange, onDiagnostics, setStatus };
};

export const createDifficultyMenu = (args: {
  difficulty: DifficultyOption;
}) => {
  const overlay = document.createElement("div");
  const difficultyButton = (difficulty: DifficultyOption) =>
    `<button type=\"button\" class=\"difficulty-button${args.difficulty === difficulty ? " active" : ""}\" data-difficulty=\"${difficulty}\">${difficulty}</button>`;

  overlay.className = "menu";
  overlay.innerHTML = `
    <div class="menu-card">
      <h2>Single Player</h2>
      <p class="menu-sub">Select Difficulty</p>
      <div class="difficulty-row" role="group" aria-label="Difficulty">
        ${difficultyButton("EASY")}
        ${difficultyButton("MEDIUM")}
        ${difficultyButton("HARD")}
      </div>
      <p class="menu-sub difficulty-desc" id="difficulty-desc"></p>
      <button id="difficulty-start">Start Match</button>
      <button id="difficulty-back">Back to Main Menu</button>
    </div>
  `;

  const mount = (container: HTMLElement) => container.appendChild(overlay);
  const unmount = () => overlay.remove();

  const setDescription = (value: DifficultyOption) => {
    const node = overlay.querySelector<HTMLParagraphElement>("#difficulty-desc");
    if (!node) return;
    if (value === "EASY") node.textContent = "Balanced bots with safer paths.";
    if (value === "MEDIUM") node.textContent = "More pressure and cut-offs.";
    if (value === "HARD") node.textContent = "Fast reactions and traps.";
  };

  setDescription(args.difficulty);

  const onDifficultyChange = (handler: (difficulty: DifficultyOption) => void) => {
    const buttons = overlay.querySelectorAll<HTMLButtonElement>(".difficulty-button");
    buttons.forEach((button) => {
      button.onclick = () => {
        const next = button.dataset.difficulty as DifficultyOption;
        buttons.forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
        setDescription(next);
        handler(next);
      };
    });
  };

  const onStart = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#difficulty-start");
    if (btn) btn.onclick = handler;
  };

  const onBack = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#difficulty-back");
    if (btn) btn.onclick = handler;
  };

  return { mount, unmount, onDifficultyChange, onStart, onBack };
};

export const createResult = (args: {
  winner: string;
  hash: string;
  payout: number;
  status: ResultStatus;
  survival: number;
  eliminationReason?: "TRAIL" | "WALL";
  eliminatedBy?: string;
}) => {
  const overlay = document.createElement("div");
  const [playLabel, menuLabel] = getResultActions();
  overlay.className = "menu";
  overlay.innerHTML = `
    <div class="menu-card">
      <h2 class="result-title">${formatResultTitle(args.status)}</h2>
      <p class="menu-sub">${formatResultSubtitle({
        survival: args.survival,
        payout: args.payout,
      })}</p>
      <p class="menu-sub">${formatResultCause({
        status: args.status,
        winner: args.winner,
        eliminatedBy: args.eliminatedBy,
        eliminationReason: args.eliminationReason,
      })}</p>
      <p class="menu-sub">Tap Play Again to start a fresh round.</p>
      <p class="menu-hash">Match hash: ${args.hash}</p>
      <button id="play-again">${playLabel}</button>
      <button id="main-menu">${menuLabel}</button>
    </div>
  `;

  const mount = (container: HTMLElement) => container.appendChild(overlay);
  const unmount = () => overlay.remove();

  const onRestart = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#play-again");
    if (btn) btn.onclick = handler;
  };

  const onMainMenu = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#main-menu");
    if (btn) btn.onclick = handler;
  };

  return { mount, unmount, onRestart, onMainMenu };
};
