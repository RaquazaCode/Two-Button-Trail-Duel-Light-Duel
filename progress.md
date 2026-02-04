Original prompt: Implement the Light Duel plan (Vite + Three.js) and continue into Phase 2.

- 2026-02-04: Repo renamed to remove # from path; tests now pass after enabling Vitest globals.
- 2026-02-04: Added .gitignore entries for .DS_Store and node_modules; committed dependency lockfile.

TODO:
- Run Playwright-based game test loop once dev server is running.
- Start Colyseus server and exercise online mode with CONFIG.useServer.

- 2026-02-04: Added render_game_to_text and advanceTime helpers with tests; wired into main.
- 2026-02-04: Playwright install blocked (registry ENOTFOUND). Pending local install to run web-game test loop.
- 2026-02-04: Added Colyseus server scaffolding + LightDuelRoom sim loop with input/snapshot helpers and tests.
- 2026-02-04: Added client net adapter (snapshot mapping, input message mapping) plus ServerSnapshot type and config toggle.
- 2026-02-04: HUD now shows mode (LOCAL/ONLINE) with formatStatus helper + test. Playwright run captured screenshots in /private/tmp/light-duel-web-game-mode.
- 2026-02-04: Added menu mode toggle (LOCAL/ONLINE) with mode helpers + test. Playwright captures in /private/tmp/light-duel-web-game-toggle-menu and /private/tmp/light-duel-web-game-toggle-online.
