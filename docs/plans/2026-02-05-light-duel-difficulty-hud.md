# Light Duel Difficulty + HUD Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add single-player difficulty selection (easy/medium/hard), improve UI readability, move HUD to top-center, and add a circular minimap with live positions/trails/death marks.

**Architecture:** Keep the deterministic sim intact. Difficulty is a profile passed into the bot decision function. UI changes are isolated to `ui/` and CSS. The minimap is a lightweight canvas overlay updated each frame from the current `WorldState`.

**Tech Stack:** Vite + TypeScript + Three.js + Vitest

---

## Summary

We will:
- Add difficulty profiles (easy/medium/hard) and pass them into bot logic
- Add a single-player setup screen to choose difficulty (after “Single Player”)
- Rename mode labels for clarity (Single Player / Online (Multiplayer))
- Enlarge and improve menu typography for readability
- Move HUD to top-center with seconds-only countdown and ALIVE formatting
- Add a circular minimap showing players, trails, and death marks

---

## Task 1: Difficulty profiles (types + tests)

**Files:**
- Create: `src/sim/difficulty.ts`
- Create: `src/sim/__tests__/difficulty.test.ts`

**Step 1: Write the failing test**
```ts
// src/sim/__tests__/difficulty.test.ts
import { getDifficultyProfile } from "../difficulty";

test("difficulty profiles expose expected levels", () => {
  const easy = getDifficultyProfile("EASY");
  const medium = getDifficultyProfile("MEDIUM");
  const hard = getDifficultyProfile("HARD");

  expect(easy.name).toBe("EASY");
  expect(medium.name).toBe("MEDIUM");
  expect(hard.name).toBe("HARD");

  expect(easy.aggression).toBeLessThan(medium.aggression);
  expect(medium.aggression).toBeLessThan(hard.aggression);
  expect(easy.reactionScale).toBeLessThan(hard.reactionScale);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/sim/__tests__/difficulty.test.ts`
Expected: FAIL (module missing)

**Step 3: Write minimal implementation**
```ts
// src/sim/difficulty.ts
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type DifficultyProfile = {
  name: Difficulty;
  aggression: number;
  pressure: number;
  reactionScale: number;
  riskTolerance: number;
  cooperationChance: number;
};

export const getDifficultyProfile = (difficulty: Difficulty): DifficultyProfile => {
  if (difficulty === "HARD") {
    return {
      name: "HARD",
      aggression: 0.85,
      pressure: 0.9,
      reactionScale: 1.4,
      riskTolerance: 0.35,
      cooperationChance: 0.5,
    };
  }

  if (difficulty === "MEDIUM") {
    return {
      name: "MEDIUM",
      aggression: 0.55,
      pressure: 0.6,
      reactionScale: 1.15,
      riskTolerance: 0.5,
      cooperationChance: 0.2,
    };
  }

  return {
    name: "EASY",
    aggression: 0.35,
    pressure: 0.4,
    reactionScale: 1.0,
    riskTolerance: 0.6,
    cooperationChance: 0.0,
  };
};
```

**Step 4: Run tests to verify they pass**
Run: `npm test -- src/sim/__tests__/difficulty.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/sim/difficulty.ts src/sim/__tests__/difficulty.test.ts
git commit -m "feat: add difficulty profiles"
```

---

## Task 2: Hybrid bot behaviors (TDD)

**Files:**
- Modify: `src/sim/bot.ts`
- Create: `src/sim/__tests__/botDifficulty.test.ts`

**Step 1: Write the failing test**
```ts
// src/sim/__tests__/botDifficulty.test.ts
import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

const trails: any[] = [];

test("hard difficulty prefers aggressive cut-off vs easy", () => {
  const easyInput = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos: vec2(20, 8),
    difficulty: "EASY",
    rng: () => 0.1,
  });

  const hardInput = chooseBotInput({
    id: "b1",
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    arenaHalf: 100,
    trails,
    time: 0,
    playerPos: vec2(20, 8),
    difficulty: "HARD",
    rng: () => 0.1,
  });

  expect(easyInput).toBe(0);
  expect(hardInput).not.toBe(0);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/sim/__tests__/botDifficulty.test.ts`
Expected: FAIL (difficulty not supported)

**Step 3: Implement difficulty-aware hybrid logic**
- Add `difficulty` and optional `rng` params to `chooseBotInput`
- Use `getDifficultyProfile`
- Add a small aggression bias when player is within a forward cone
- Use `reactionScale` to shorten evaluation horizon on harder difficulties

```ts
// src/sim/bot.ts (signature change)
import { getDifficultyProfile, type Difficulty } from "./difficulty";

export const chooseBotInput = (args: {
  id: string;
  pos: Vec2;
  heading: number;
  turnVel: number;
  arenaHalf: number;
  trails: TrailSegment[];
  time: number;
  playerPos?: Vec2;
  difficulty: Difficulty;
  rng?: () => number;
}): -1 | 0 | 1 => {
  const rng = args.rng ?? Math.random;
  const profile = getDifficultyProfile(args.difficulty);
  const lookahead = 0.5 / profile.reactionScale;
  // …keep existing scoring but add aggression bias when player is in front
  // …use profile.riskTolerance to prefer higher safeSteps
  // …use rng + profile.cooperationChance to bias cutoffs
};
```

**Step 4: Run test to verify it passes**
Run: `npm test -- src/sim/__tests__/botDifficulty.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/sim/bot.ts src/sim/__tests__/botDifficulty.test.ts
git commit -m "feat: add difficulty-aware bot behaviors"
```

---

## Task 3: Single-player setup screen + mode labels

**Files:**
- Modify: `src/ui/menu.ts`
- Modify: `src/ui/__tests__/menu.test.ts`
- Modify: `src/main.ts`

**Step 1: Write failing tests**
```ts
// src/ui/__tests__/menu.test.ts
import { formatModeLabel } from "../menu";

test("mode labels are user friendly", () => {
  expect(formatModeLabel("LOCAL")).toBe("Single Player");
  expect(formatModeLabel("ONLINE")).toBe("Online (Multiplayer)");
});
```

**Step 2: Run tests to verify they fail**
Run: `npm test -- src/ui/__tests__/menu.test.ts`
Expected: FAIL (formatter missing)

**Step 3: Implement difficulty selection flow**
- Add `formatModeLabel`
- Add a new `createDifficultyMenu` that renders Easy/Medium/Hard buttons
- In `main.ts`, when Single Player chosen, open difficulty menu instead of starting immediately

```ts
// src/ui/menu.ts (add)
export const formatModeLabel = (mode: ModeOption) =>
  mode === "LOCAL" ? "Single Player" : "Online (Multiplayer)";
```

**Step 4: Run tests to verify they pass**
Run: `npm test -- src/ui/__tests__/menu.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/ui/menu.ts src/ui/__tests__/menu.test.ts src/main.ts
git commit -m "feat: add single-player difficulty menu"
```

---

## Task 4: HUD format + position

**Files:**
- Modify: `src/ui/hud.ts`
- Modify: `src/ui/__tests__/hud.test.ts`
- Modify: `src/style.css`

**Step 1: Write failing test**
```ts
// src/ui/__tests__/hud.test.ts
import { formatStatus } from "../hud";

test("HUD displays seconds-only countdown and ALIVE format", () => {
  const status = formatStatus({
    time: 12,
    alive: 4,
    total: 8,
    mode: "LOCAL",
    roundDuration: 100,
  });
  expect(status).toContain("TIME: 88");
  expect(status).toContain("ALIVE: 4/8");
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/ui/__tests__/hud.test.ts`
Expected: FAIL (format changed)

**Step 3: Implement format + center alignment**
- Update `formatStatus` to `TIME: <seconds>`
- Adjust CSS to center-top, larger font, higher contrast

**Step 4: Run tests to verify they pass**
Run: `npm test -- src/ui/__tests__/hud.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/ui/hud.ts src/ui/__tests__/hud.test.ts src/style.css
git commit -m "feat: update HUD format and positioning"
```

---

## Task 5: Minimap HUD (canvas)

**Files:**
- Create: `src/ui/minimap.ts`
- Create: `src/ui/__tests__/minimap.test.ts`
- Modify: `src/main.ts`
- Modify: `src/style.css`

**Step 1: Write failing tests**
```ts
// src/ui/__tests__/minimap.test.ts
import { worldToMinimap } from "../minimap";

test("worldToMinimap maps positions into unit circle", () => {
  const point = worldToMinimap({ x: 50, y: 0 }, 100);
  expect(point.x).toBeCloseTo(0.5);
  expect(point.y).toBeCloseTo(0);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/ui/__tests__/minimap.test.ts`
Expected: FAIL (module missing)

**Step 3: Implement minimap renderer**
- `createMinimap(container)` returns `{ update(world) }`
- Draw circle border, trails, players, and death marks
- Use palette colors for players/trails

**Step 4: Run tests to verify they pass**
Run: `npm test -- src/ui/__tests__/minimap.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/ui/minimap.ts src/ui/__tests__/minimap.test.ts src/main.ts src/style.css
git commit -m "feat: add minimap HUD"
```

---

## Final Verification

Run:
```bash
npm test
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-02-05-light-duel-difficulty-hud.md`.

Two execution options:
1) **Subagent-Driven (this session)** – I dispatch a fresh subagent per task, with review checkpoints.
2) **Parallel Session** – Open a new session and use `executing-plans` to batch-execute.

Which approach?
