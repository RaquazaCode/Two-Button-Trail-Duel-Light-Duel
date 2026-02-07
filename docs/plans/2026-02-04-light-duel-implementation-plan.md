# Light Duel (Vite + Three.js) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Light Duel MVP as a Vite + TypeScript + Three.js client with deterministic core sim, bots, solo UI, and then add a Node + Colyseus authoritative server in Phase 2.

**Architecture:** Client runs a deterministic 2D sim (physics, trails, collisions, shrink) and renders it in 3D. The sim is a pure TS layer that can be reused by the server. Phase 2 adds a Colyseus server that runs the same sim authoritatively and streams snapshots to the client.

**Tech Stack:** Vite + TypeScript + Three.js (vanilla), Vitest, Node.js + Colyseus. Keyboard input only. Bloom via Three post-processing.

---

## Summary

We will:
- Scaffold a Vite + TS + Three.js app at repo root
- Implement a deterministic sim with micro-gaps, slight drift, shrink, collisions
- Add bots and a solo micro-stake UI (no real crypto integration)
- Render in 3D with neon visuals and bloom
- Add a Colyseus authoritative server and network adapter in Phase 2

---

## Important Public APIs / Types

We will define and use these types in `src/sim/`:
- `GameConfig`: all tunables (arena size, speed, turn rate, gap cadence, shrink schedule)
- `PlayerState`: position, heading, alive, gap cycle, trail id
- `TrailSegment`: line segment with timestamps and solidification time
- `WorldState`: time, players, trails, arena bounds, match state
- `InputFrame`: left/right pressed state and timestamp/tick
- `ServerSnapshot`: tick, players, trails, arena bounds

---

## Assumptions / Defaults

- **Execution on `main`** (explicit override to skip worktree usage)
- **Repo layout**: single app at repo root
- **Render stack**: vanilla Three.js, no React
- **Input**: keyboard only (A/D + Arrow Left/Right)
- **Gap mechanic**: automatic micro-gaps (2.0s on / 0.2s off)
- **Sim tuning defaults**:
  - Arena: 100x100 units
  - Speed: 18 units/s
  - Turn rate: 2.4 rad/s
  - Turn inertia: 0.18s
  - Trail width: 0.6 units
  - Solidify delay: 0.2s
  - Shrink starts at 20s, linearly to 40% size by 60s
- **Phase 1** includes bots + solo UI
- **Phase 2** server uses Node + Colyseus (WebSockets)
- **Bloom** enabled in MVP visuals
- **Solo micro-stake UI** is informational only (no wallet integration)

---

## Phase 0 — Housekeeping

### Task 0: Commit research docs and plan file (post-Plan Mode)
**Files:**
- Add: `docs/research/2026-02-03-trail-duel-genre-research.md`
- Add: `docs/research/2026-02-03-lightcycle-duel-competitor-teardown.md`
- Add: `docs/plans/2026-02-04-light-duel-implementation-plan.md` (this file)

**Step 1:** `git add docs/research/2026-02-03-trail-duel-genre-research.md docs/research/2026-02-03-lightcycle-duel-competitor-teardown.md docs/plans/2026-02-04-light-duel-implementation-plan.md`
**Step 2:** `git commit -m "docs: add research references and implementation plan"`
**Step 3:** `git push`

---

## Phase 1 — Client MVP (Core Sim + Bots + Solo UI)

### Task 1: Scaffold Vite + TS + Three + Vitest
**Files:**
- Create: `package.json`, `vite.config.ts`, `src/main.ts`, `src/style.css`, `index.html` (via Vite)
- Modify: `package.json` scripts

**Step 1:** Run `pnpm dlx create-vite@latest . --template vanilla-ts`
**Step 2:** Run `pnpm install`
**Step 3:** Run `pnpm add three`
**Step 4:** Run `pnpm add -D vitest @types/three`
**Step 5:** Add `test` script to `package.json`: `"test": "vitest run"`
**Step 6:** Commit
`git add package.json vite.config.ts src/main.ts src/style.css index.html`
`git commit -m "chore: scaffold vite + three + vitest"`

---

### Task 2: Sim config + math primitives
**Files:**
- Create: `src/sim/config.ts`
- Create: `src/sim/math.ts`
- Create: `src/sim/types.ts`
- Create: `src/sim/__tests__/math.test.ts`

**Step 1: Write failing test**
```ts
// src/sim/__tests__/math.test.ts
import { vec2, add, scale, length } from "../math";

test("vec2 math works", () => {
  const a = vec2(3, 4);
  const b = vec2(1, 2);
  const c = add(a, b);
  expect(c.x).toBe(4);
  expect(c.y).toBe(6);
  expect(length(a)).toBe(5);
  const d = scale(a, 2);
  expect(d.x).toBe(6);
  expect(d.y).toBe(8);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL (math module missing)
**Step 3: Implement minimal code**
```ts
// src/sim/math.ts
export type Vec2 = { x: number; y: number };

export const vec2 = (x: number, y: number): Vec2 => ({ x, y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });
export const length = (a: Vec2): number => Math.hypot(a.x, a.y);
```

```ts
// src/sim/config.ts
export const CONFIG = {
  arenaSize: 100,
  speed: 18,
  turnRate: 2.4,
  turnInertia: 0.18,
  trailWidth: 0.6,
  solidifyDelay: 0.2,
  gapOn: 2.0,
  gapOff: 0.2,
  shrinkStart: 20,
  shrinkEnd: 60,
  shrinkTo: 0.4,
  simHz: 60,
};
```

```ts
// src/sim/types.ts
import type { Vec2 } from "./math";

export type PlayerId = string;

export type PlayerState = {
  id: PlayerId;
  pos: Vec2;
  heading: number;
  turnVel: number;
  alive: boolean;
  gapTimer: number;
  gapOn: boolean;
  trailId: number;
  eliminatedAt?: number;
};

export type TrailSegment = {
  id: number;
  owner: PlayerId;
  start: Vec2;
  end: Vec2;
  createdAt: number;
  solidAt: number;
};

export type WorldState = {
  time: number;
  players: PlayerState[];
  trails: TrailSegment[];
  arenaHalf: number;
  running: boolean;
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/config.ts src/sim/math.ts src/sim/types.ts src/sim/__tests__/math.test.ts`
`git commit -m "feat: add sim config and math primitives"`

---

### Task 3: Physics step (movement + turn inertia)
**Files:**
- Create: `src/sim/physics.ts`
- Create: `src/sim/__tests__/physics.test.ts`

**Step 1: Write failing test**
```ts
import { stepPhysics } from "../physics";
import { vec2 } from "../math";

test("physics updates heading and position with turn inertia", () => {
  const result = stepPhysics({
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    input: 1,
    dt: 1 / 60,
    speed: 18,
    turnRate: 2.4,
    inertia: 0.18,
  });

  expect(result.pos.x).toBeGreaterThan(0);
  expect(result.heading).toBeGreaterThan(0);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/physics.ts
import { vec2, type Vec2 } from "./math";

export type PhysicsInput = {
  pos: Vec2;
  heading: number;
  turnVel: number;
  input: -1 | 0 | 1;
  dt: number;
  speed: number;
  turnRate: number;
  inertia: number;
};

export const stepPhysics = (p: PhysicsInput) => {
  const target = p.input * p.turnRate;
  const alpha = Math.min(1, p.dt / p.inertia);
  const turnVel = p.turnVel + (target - p.turnVel) * alpha;
  const heading = p.heading + turnVel * p.dt;
  const pos = vec2(
    p.pos.x + Math.cos(heading) * p.speed * p.dt,
    p.pos.y + Math.sin(heading) * p.speed * p.dt
  );
  return { pos, heading, turnVel };
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/physics.ts src/sim/__tests__/physics.test.ts`
`git commit -m "feat: add physics step with turn inertia"`

---

### Task 4: Trails + micro-gap cadence
**Files:**
- Create: `src/sim/trails.ts`
- Create: `src/sim/__tests__/trails.test.ts`

**Step 1: Write failing test**
```ts
import { updateTrail } from "../trails";
import { vec2 } from "../math";

test("trail respects gap cadence", () => {
  const res = updateTrail({
    prev: vec2(0, 0),
    next: vec2(1, 0),
    time: 2.05,
    gapOn: 2.0,
    gapOff: 0.2,
    solidifyDelay: 0.2,
    state: { gapTimer: 2.05, gapOnState: true, trailId: 1 },
    owner: "p1",
    trails: [],
  });

  expect(res.trails.length).toBe(0); // in off window
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/trails.ts
import { type Vec2 } from "./math";
import { type TrailSegment } from "./types";

export const updateTrail = (args: {
  prev: Vec2;
  next: Vec2;
  time: number;
  gapOn: number;
  gapOff: number;
  solidifyDelay: number;
  state: { gapTimer: number; gapOnState: boolean; trailId: number };
  owner: string;
  trails: TrailSegment[];
}) => {
  const total = args.gapOn + args.gapOff;
  const mod = args.time % total;
  const gapOnState = mod < args.gapOn;

  if (!gapOnState) {
    return { trails: args.trails, gapOnState, gapTimer: args.time };
  }

  const seg: TrailSegment = {
    id: args.state.trailId + 1,
    owner: args.owner,
    start: args.prev,
    end: args.next,
    createdAt: args.time,
    solidAt: args.time + args.solidifyDelay,
  };

  return {
    trails: [...args.trails, seg],
    gapOnState,
    gapTimer: args.time,
    trailId: seg.id,
  };
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/trails.ts src/sim/__tests__/trails.test.ts`
`git commit -m "feat: add trail segments with micro-gap cadence"`

---

### Task 5: Collision detection (segments + bounds)
**Files:**
- Create: `src/sim/collision.ts`
- Create: `src/sim/__tests__/collision.test.ts`

**Step 1: Write failing test**
```ts
import { intersectsAny, outOfBounds } from "../collision";
import { vec2 } from "../math";

test("collision detects segment intersection", () => {
  const hit = intersectsAny(
    vec2(0, 0),
    vec2(2, 0),
    [{ start: vec2(1, -1), end: vec2(1, 1), solidAt: 0, owner: "p2", id: 1 }],
    1
  );
  expect(hit).toBe(true);
});

test("bounds detect out of arena", () => {
  expect(outOfBounds(vec2(6, 0), 5)).toBe(true);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/collision.ts
import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";

const cross = (a: Vec2, b: Vec2) => a.x * b.y - a.y * b.x;

const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });

export const segmentsIntersect = (p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2) => {
  const r = sub(p2, p1);
  const s = sub(q2, q1);
  const denom = cross(r, s);
  if (denom === 0) return false;
  const t = cross(sub(q1, p1), s) / denom;
  const u = cross(sub(q1, p1), r) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

export const intersectsAny = (
  prev: Vec2,
  next: Vec2,
  trails: TrailSegment[],
  time: number
) => {
  return trails.some((t) => time >= t.solidAt && segmentsIntersect(prev, next, t.start, t.end));
};

export const outOfBounds = (pos: Vec2, arenaHalf: number) =>
  Math.abs(pos.x) > arenaHalf || Math.abs(pos.y) > arenaHalf;
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/collision.ts src/sim/__tests__/collision.test.ts`
`git commit -m "feat: add collision detection for trails and bounds"`

---

### Task 6: Elimination + match state
**Files:**
- Create: `src/sim/match.ts`
- Create: `src/sim/__tests__/match.test.ts`

**Step 1: Write failing test**
```ts
import { resolveElimination } from "../match";
import { vec2 } from "../math";

test("player marked eliminated on collision", () => {
  const res = resolveElimination({
    player: { id: "p1", pos: vec2(0,0), heading: 0, turnVel: 0, alive: true, gapTimer: 0, gapOn: true, trailId: 0 },
    hit: true,
    time: 10,
  });
  expect(res.alive).toBe(false);
  expect(res.eliminatedAt).toBe(10);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/match.ts
import type { PlayerState } from "./types";

export const resolveElimination = (args: { player: PlayerState; hit: boolean; time: number }) => {
  if (!args.hit) return args.player;
  return { ...args.player, alive: false, eliminatedAt: args.time };
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/match.ts src/sim/__tests__/match.test.ts`
`git commit -m "feat: add elimination resolution"`

---

### Task 7: Arena shrink schedule
**Files:**
- Create: `src/sim/shrink.ts`
- Create: `src/sim/__tests__/shrink.test.ts`

**Step 1: Write failing test**
```ts
import { arenaHalfAt } from "../shrink";

test("arena shrinks over time", () => {
  const start = arenaHalfAt(0, 50, 20, 60, 0.4);
  const mid = arenaHalfAt(40, 50, 20, 60, 0.4);
  const end = arenaHalfAt(60, 50, 20, 60, 0.4);
  expect(start).toBe(50);
  expect(mid).toBeLessThan(50);
  expect(end).toBeCloseTo(20);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/shrink.ts
export const arenaHalfAt = (
  time: number,
  half: number,
  start: number,
  end: number,
  shrinkTo: number
) => {
  if (time <= start) return half;
  if (time >= end) return half * shrinkTo;
  const t = (time - start) / (end - start);
  return half + (half * shrinkTo - half) * t;
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/shrink.ts src/sim/__tests__/shrink.test.ts`
`git commit -m "feat: add arena shrink schedule"`

---

### Task 8: Bot AI (deterministic heuristic)
**Files:**
- Create: `src/sim/bot.ts`
- Create: `src/sim/__tests__/bot.test.ts`

**Step 1: Write failing test**
```ts
import { chooseBotInput } from "../bot";
import { vec2 } from "../math";

test("bot chooses a safe direction", () => {
  const input = chooseBotInput({
    pos: vec2(0,0),
    heading: 0,
    arenaHalf: 10,
    trails: [],
  });
  expect([-1,0,1]).toContain(input);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/bot.ts
import type { Vec2 } from "./math";
import type { TrailSegment } from "./types";

export const chooseBotInput = (args: {
  pos: Vec2;
  heading: number;
  arenaHalf: number;
  trails: TrailSegment[];
}): -1 | 0 | 1 => {
  // MVP: deterministic "go straight" with simple boundary steer
  if (Math.abs(args.pos.x) > args.arenaHalf * 0.8) return args.pos.x > 0 ? -1 : 1;
  if (Math.abs(args.pos.y) > args.arenaHalf * 0.8) return args.pos.y > 0 ? -1 : 1;
  return 0;
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/sim/bot.ts src/sim/__tests__/bot.test.ts`
`git commit -m "feat: add deterministic bot steering heuristic"`

---

### Task 9: Fixed-timestep sim loop + input handling
**Files:**
- Create: `src/game/loop.ts`
- Modify: `src/main.ts`
- Create: `src/sim/step.ts`
- Create: `src/sim/__tests__/step.test.ts`

**Step 1: Write failing test**
```ts
import { stepWorld } from "../step";
import { vec2 } from "../math";

test("stepWorld advances time", () => {
  const world = {
    time: 0,
    players: [{ id: "p1", pos: vec2(0,0), heading: 0, turnVel: 0, alive: true, gapTimer: 0, gapOn: true, trailId: 0 }],
    trails: [],
    arenaHalf: 50,
    running: true
  };
  const next = stepWorld(world, { p1: 0 }, 1/60);
  expect(next.time).toBeGreaterThan(0);
});
```

**Step 2:** Run `pnpm test` and confirm FAIL
**Step 3: Implement minimal code**
```ts
// src/sim/step.ts
import { CONFIG } from "./config";
import { stepPhysics } from "./physics";
import { updateTrail } from "./trails";
import { intersectsAny, outOfBounds } from "./collision";
import { arenaHalfAt } from "./shrink";
import { resolveElimination } from "./match";

export const stepWorld = (world: any, inputs: Record<string, -1|0|1>, dt: number) => {
  const time = world.time + dt;
  const arenaHalf = arenaHalfAt(time, CONFIG.arenaSize/2, CONFIG.shrinkStart, CONFIG.shrinkEnd, CONFIG.shrinkTo);
  const trails = [...world.trails];
  const players = world.players.map((p: any) => {
    if (!p.alive) return p;
    const input = inputs[p.id] ?? 0;
    const phys = stepPhysics({ pos: p.pos, heading: p.heading, turnVel: p.turnVel, input, dt, speed: CONFIG.speed, turnRate: CONFIG.turnRate, inertia: CONFIG.turnInertia });
    const trailRes = updateTrail({
      prev: p.pos, next: phys.pos, time,
      gapOn: CONFIG.gapOn, gapOff: CONFIG.gapOff, solidifyDelay: CONFIG.solidifyDelay,
      state: { gapTimer: p.gapTimer, gapOnState: p.gapOn, trailId: p.trailId },
      owner: p.id, trails
    });
    const hit = outOfBounds(phys.pos, arenaHalf) || intersectsAny(p.pos, phys.pos, trails, time);
    const nextPlayer = resolveElimination({
      player: { ...p, pos: phys.pos, heading: phys.heading, turnVel: phys.turnVel, gapTimer: trailRes.gapTimer, gapOn: trailRes.gapOnState, trailId: trailRes.trailId ?? p.trailId },
      hit, time
    });
    return nextPlayer;
  });
  return { ...world, time, arenaHalf, players, trails };
};
```

**Step 4:** Run `pnpm test` and confirm PASS
**Step 5:** Commit
`git add src/game/loop.ts src/sim/step.ts src/sim/__tests__/step.test.ts src/main.ts`
`git commit -m "feat: add fixed-step world update with inputs"`

---

### Task 10: Three.js scene + bloom
**Files:**
- Modify: `src/main.ts`
- Create: `src/render/scene.ts`
- Create: `src/render/bloom.ts`

**Step 1:** Implement scene creation with camera, renderer, grid, lights
**Step 2:** Add bloom composer with `UnrealBloomPass`
**Step 3:** Manual verify: `pnpm dev` and confirm neon grid renders
**Step 4:** Commit
`git add src/render/scene.ts src/render/bloom.ts src/main.ts`
`git commit -m "feat: add Three.js scene and bloom"`

---

### Task 11: Bike + trail rendering
**Files:**
- Create: `src/render/bike.ts`
- Create: `src/render/trails.ts`
- Modify: `src/main.ts`

**Step 1:** Render bikes as emissive capsules or boxes in 3D
**Step 2:** Render trails as line segments or thin boxes (emissive)
**Step 3:** Wire renderer to `WorldState` each frame
**Step 4:** Manual verify bikes move and trails appear
**Step 5:** Commit
`git add src/render/bike.ts src/render/trails.ts src/main.ts`
`git commit -m "feat: render bikes and trails from sim state"`

---

### Task 12: HUD (timer, alive count, gap indicator)
**Files:**
- Modify: `src/style.css`
- Modify: `index.html`
- Create: `src/ui/hud.ts`

**Step 1:** Add fixed HUD overlay
**Step 2:** Update HUD from sim time and alive count
**Step 3:** Commit
`git add src/ui/hud.ts src/style.css index.html`
`git commit -m "feat: add minimal HUD"`

---

### Task 13: Solo mode UI and flow
**Files:**
- Create: `src/ui/menu.ts`
- Modify: `src/main.ts`

**Step 1:** Add start screen with “Solo Micro-Stake” button (display entry/payout)
**Step 2:** Start match with 1 player + 7 bots
**Step 3:** End screen with winner and match hash (config hash)
**Step 4:** Commit
`git add src/ui/menu.ts src/main.ts`
`git commit -m "feat: add solo mode flow and results screen"`

---

## Phase 2 — Server (Authoritative Netcode)

### Task 14: Server scaffolding
**Files:**
- Create: `server/index.ts`
- Modify: `package.json`

**Step 1:** Install `colyseus` and `@colyseus/schema`
**Step 2:** Add `server:dev` script: `tsx watch server/index.ts`
**Step 3:** Commit
`git add server/index.ts package.json`
`git commit -m "chore: scaffold colyseus server"`

---

### Task 15: Authoritative room simulation
**Files:**
- Create: `server/rooms/LightDuelRoom.ts`
- Modify: `server/index.ts`

**Step 1:** Create room with `onCreate`, `onJoin`, `onMessage`
**Step 2:** Run sim at fixed tick (60 Hz), broadcast snapshots at 20 Hz
**Step 3:** Reuse `src/sim` logic for authoritative state
**Step 4:** Commit
`git add server/rooms/LightDuelRoom.ts server/index.ts`
`git commit -m "feat: add authoritative Light Duel room"`

---

### Task 16: Client network adapter
**Files:**
- Create: `src/net/colyseus.ts`
- Modify: `src/main.ts`

**Step 1:** Connect to server, send input messages
**Step 2:** Apply server snapshots to renderer
**Step 3:** Add local/online toggle (flag in config)
**Step 4:** Commit
`git add src/net/colyseus.ts src/main.ts`
`git commit -m "feat: add colyseus client adapter"`

---

## Test Cases and Scenarios

- Physics updates heading and position with drift/inertia
- Trails respect micro-gap cadence
- Collision detection catches segment intersections
- Out-of-bounds detection when arena shrinks
- Elimination flags player and ends round when one remains
- Bot steering stays within bounds and returns valid inputs
- Render loop shows bikes and trails without errors
- HUD updates time and alive count correctly
- Solo mode flow starts and ends correctly

---

## Acceptance Criteria

- `pnpm test` passes after each sim task
- `pnpm dev` shows playable solo loop with 1 player + 7 bots
- Trails draw with micro-gaps and collisions eliminate immediately
- Arena shrinks on schedule
- Bloom makes neon visuals readable without heavy performance hit
- Phase 2 server runs with Colyseus and accepts inputs
