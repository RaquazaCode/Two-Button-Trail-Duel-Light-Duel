Original prompt: Implement the Light Duel plan (Vite + Three.js) and continue into Phase 2.

- 2026-02-04: Repo renamed to remove # from path; tests now pass after enabling Vitest globals.
- 2026-02-04: Added .gitignore entries for .DS_Store and node_modules; committed dependency lockfile.

TODO:
- Add render_game_to_text + advanceTime hooks for automated game testing.
- Run Playwright-based game test loop once dev server is running.
- Begin Phase 2 server scaffolding (Colyseus) and client net adapter.

- 2026-02-04: Added render_game_to_text and advanceTime helpers with tests; wired into main.
- 2026-02-04: Playwright install blocked (registry ENOTFOUND). Pending local install to run web-game test loop.
