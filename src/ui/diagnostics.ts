export const createDiagnosticsPanel = (args: { getText: () => string }) => {
  const overlay = document.createElement("div");
  overlay.className = "menu diagnostics";
  overlay.innerHTML = `
    <div class="menu-card diagnostics-card">
      <h2>Connection Issues / Lag?</h2>
      <p class="menu-sub">Diagnostics snapshot from the most recent session.</p>
      <pre class="diagnostics-text" id="diagnostics-text"></pre>
      <div class="diagnostics-actions">
        <button id="diagnostics-copy">Copy Report</button>
        <button id="diagnostics-refresh">Refresh</button>
        <button id="diagnostics-close">Close</button>
      </div>
    </div>
  `;

  const textNode = overlay.querySelector<HTMLPreElement>("#diagnostics-text");
  const refresh = () => {
    if (textNode) textNode.textContent = args.getText();
  };

  const mount = (container: HTMLElement) => {
    refresh();
    container.appendChild(overlay);
  };

  const unmount = () => overlay.remove();

  const onClose = (handler: () => void) => {
    const btn = overlay.querySelector<HTMLButtonElement>("#diagnostics-close");
    if (btn) btn.onclick = handler;
  };

  const onRefresh = () => {
    const btn = overlay.querySelector<HTMLButtonElement>("#diagnostics-refresh");
    if (btn) btn.onclick = () => refresh();
  };

  const onCopy = () => {
    const btn = overlay.querySelector<HTMLButtonElement>("#diagnostics-copy");
    if (!btn) return;
    btn.onclick = async () => {
      const text = args.getText();
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied";
          setTimeout(() => {
            btn.textContent = "Copy Report";
          }, 1200);
          return;
        } catch {
          // fallthrough to manual copy
        }
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = "Copy Report";
      }, 1200);
    };
  };

  onRefresh();
  onCopy();

  return { mount, unmount, onClose, refresh };
};
