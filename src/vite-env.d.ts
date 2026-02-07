/// <reference types="vite/client" />

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    get_diagnostics_text?: () => string;
  }
}

export {};
