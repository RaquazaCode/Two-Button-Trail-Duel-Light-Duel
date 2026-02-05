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
- 2026-02-04: Added menu connection status line (Disconnected/Connecting/Connected). Playwright captures in /private/tmp/light-duel-web-game-status and /private/tmp/light-duel-web-game-status-online.
- 2026-02-04: Phase 3 environment design doc added at docs/plans/2026-02-04-light-duel-phase-3-visual-design.md (cube-map reflective floor + skyline + fog).
- 2026-02-04: Phase 3 env modules added (envGate, skyline, reflective floor, environment scene + main loop update). Playwright captures: /private/tmp/light-duel-web-game-phase3-env and /private/tmp/light-duel-web-game-phase3-play (scene currently too dark; needs lighting/fog tuning).
- 2026-02-04: Brightness pass applied (brighter skyline emissive, stronger grid, warmer stadium ring, higher lights + adjusted camera). Playwright captures: /private/tmp/light-duel-web-game-phase3-bright.
- 2026-02-04: Added spring-smoothed chase camera controller (over-the-shoulder). Playwright captures: /private/tmp/light-duel-web-game-chase.
- 2026-02-04: Updated sim tuning to Balanced preset (arena 250, speed 16, shrink 50–150s), added shader-based grid overlay + environment layout scaling, and added camera roll + narrower FOV. Playwright captures: output/web-game/shot-0.png to shot-2.png.
- 2026-02-04: Added aerodynamic bike model, skyline building accents, thicker/brighter danger ring, and gentler camera roll. Playwright captures: output/web-game-bike-skyline/shot-0.png to shot-2.png.
- 2026-02-04: Rebuilt bike into Tron-style long profile with neon rims, added per-player palette for bikes/trails, added round countdown HUD + match-end reasons, layered skyline with billboards/strips, thicker danger wall/rim, and tuned camera roll down. Playwright captures: output/web-game-fixes/shot-0.png to shot-2.png.
- 2026-02-04: Fixed invisible trails/random deaths by keying trail meshes per owner+id, adding per-player trail colors, and skipping abnormal long segments in sim/render; added elimination reasons + outcome evaluation (ends on player death), short bike fade, and clearer result overlay copy; restored round countdown HUD.
- 2026-02-04: Beefed up Tron-style bike silhouette (longer body + big wheels), tuned gentler camera roll, thickened/brightened danger ring, and added autostart query flag for Playwright.
- 2026-02-04: Playwright autostart captures in output/web-game-visual-pass-autostart (shots 0-1) showing gameplay with colored bikes and HUD.
- 2026-02-04: Set trails to continuous (gapOff=0), split long segments in sim to avoid flashes, and use trailWidth for render geometry. Arena size 10x (2500) and bike speed increased (24).
- 2026-02-04: Performance pass: clamp renderer pixel ratio, reuse trail geometry, cap skyline counts, and add camera far scaling. Reduced billboard glare and bloom intensity; moved stadium material to config.
- 2026-02-04: Autostart Playwright captures in output/web-game-visual-pass-autostart-3 and output/web-game-visual-pass-autostart-4 (gameplay shots).
- 2026-02-04: Reduced arena size to 3.5x (arenaSize 875), added self-trail grace window to prevent immediate elimination, and randomized spawn positions/headings with minimum spacing. Playwright captures: output/web-game-visual-pass-autostart-5 (shots 0-2).
- 2026-02-04: Doubled bike speed (48), switched collision to circular arena boundary, rendered circular floor/grid clipped to ring, added 3D ribbon trails (70% bike height), and added result overlay Main Menu button. Playwright captures: output/web-game-visual-pass-autostart-6 (shots 0-2).
- 2026-02-04: Added stacked stadium band with gradient (base + top + rim), boosted skyline heights/strips with low-glare billboards, softened fog for deeper skyline, tightened turn radius, and upgraded bots to predictive steering. Playwright captures: output/web-game-visual-pass-autostart-7 (shots 0-2).
- 2026-02-04: Added near-ring skyline layer (1.8x), raised skyline heights, made stadium band fully vertical (no gap), and optimized bot lookahead with spatial filtering for smoother performance. Playwright captures: output/web-game-visual-pass-autostart-8 (shots 0-2).
- 2026-02-05: Rebuilt skyline as InstancedMesh silhouettes (single geometry/material) with procedural emissive striping and raised base heights; reduced skyline counts for performance.
- 2026-02-05: Replaced realtime cube reflections with a static env map for the floor.
- 2026-02-05: Trail renderer now splits long segments to prevent invisible collisions.
