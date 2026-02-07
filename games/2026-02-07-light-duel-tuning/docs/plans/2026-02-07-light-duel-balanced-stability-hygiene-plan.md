# Light Duel Balanced Stability + Hygiene Plan (2026-02-07)

## Goal
Stabilize local solo gameplay and repository hygiene in one pass by locking player count, reducing bot collapse patterns, cleaning package-manager/test configuration drift, and migrating daily-run artifacts into the required `games/YYYY-MM-DD-<slug>/` structure.

## Scope
- Local mode only (online path unchanged except shared-code safety).
- 8 total participants (`1 human + 7 bots`).
- No repeating click-loop behavior for elimination sound.
- Stronger deterministic bot behavior quality checks.
- Vitest excludes `.worktrees/**` mirror paths.
- `pnpm` lockfile and command normalization.
- Progress and diagnostics artifacts under `games/2026-02-07-light-duel-tuning/`.

## Implementation Summary
1. Baseline commit created before new changes.
2. `pnpm-lock.yaml` generated and `package-lock.json` removed.
3. Root `progress.md` migrated to this game folder.
4. Shared player contract constants added and wired into runtime/tests.
5. Sim trail lifetime pruning added to reduce clutter and preserve collision/render parity.
6. Bot decision cadence and difficulty weighting tuned.
7. Elimination audio simplified to single pulse with stricter cooldown.
8. Bot quality tests upgraded with 10s and 30s checkpoint thresholds.
9. Diagnostics captured to `games/2026-02-07-light-duel-tuning/diagnostics-2026-02-07.md`.

## Acceptance Checklist
- [x] Branch `codex/light-duel-tuning` used.
- [x] Baseline WIP commit exists before additional edits.
- [x] `.codex/` remains untracked.
- [x] `pnpm-lock.yaml` tracked.
- [x] `pnpm test` output excludes `.worktrees/**` paths.
- [x] No `count: 9` hardcoding remains in `src/`.
- [x] Strengthened bot tests pass deterministically.
- [x] Full `pnpm test` pass confirmed.
- [x] Diagnostics snapshots written under game folder.
