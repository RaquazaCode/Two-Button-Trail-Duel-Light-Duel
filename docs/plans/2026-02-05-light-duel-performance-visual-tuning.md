# Light Duel Performance + Visual Tuning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve performance and visual fidelity by optimizing reflections/skyline, fixing trail visibility, and making the arena wall truly continuous.

**Architecture:** Keep the deterministic sim intact. Apply targeted renderer optimizations (reflection budget + skyline density), add a small trail-segmentation helper to guarantee render continuity, and adjust environment layout metadata for skyline base height.

**Tech Stack:** Vite + TypeScript + Three.js + Vitest

---

## Summary

We will:
- Add tests for trail segmentation + skyline layout base height
- Implement trail segment splitting so long steps still render
- Reduce reflection cost (lower cube map size + update stride)
- Reduce skyline density ~25% while preserving silhouette density
- Raise skyline base height and keep near-ring layer (~1.8× arenaHalf)
- Ensure arena wall is visually continuous from ground to rim

---

## Task 1: Add failing tests (trail segmentation + skyline base height)

**Files:**
- Create: `src/render/__tests__/trailSegments.test.ts`
- Modify: `src/render/__tests__/environmentLayout.test.ts`

**Step 1: Write failing test for trail segmentation**

```ts
// src/render/__tests__/trailSegments.test.ts
import { splitTrailSegment } from "../trailSegments";

test("splits long trail segments into smaller pieces", () => {
  const pieces = splitTrailSegment({
    start: { x: 0, y: 0 },
    end: { x: 30, y: 0 },
    maxLength: 8,
  });

  expect(pieces.length).toBeGreaterThan(1);
  pieces.forEach((piece) => {
    const dx = piece.end.x - piece.start.x;
    const dy = piece.end.y - piece.start.y;
    expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(8);
  });
});
```

**Step 2: Update environment layout test to assert skyline base height**

```ts
// src/render/__tests__/environmentLayout.test.ts
import { computeEnvironmentLayout } from "../environmentLayout";

test("environment layout includes skyline base heights", () => {
  const layout = computeEnvironmentLayout(500);
  layout.skylineLayers.forEach((layer) => {
    expect(layer.baseHeight).toBeGreaterThan(0);
  });
});
```

**Step 3: Run tests to confirm they fail**

Run: `npm test`
Expected: FAIL for missing `splitTrailSegment` and `baseHeight`.

**Step 4: Commit**

```bash
git add src/render/__tests__/trailSegments.test.ts src/render/__tests__/environmentLayout.test.ts
git commit -m "test: add trail segmentation and skyline base height coverage"
```

---

## Task 2: Implement trail segmentation helper + wire into renderer

**Files:**
- Create: `src/render/trailSegments.ts`
- Modify: `src/render/trails.ts`

**Step 1: Implement minimal `splitTrailSegment`**

```ts
// src/render/trailSegments.ts
import type { TrailSegment } from "../sim/types";

type SplitArgs = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  maxLength: number;
};

export const splitTrailSegment = (args: SplitArgs): Array<{ start: SplitArgs["start"]; end: SplitArgs["end"] }> => {
  const dx = args.end.x - args.start.x;
  const dy = args.end.y - args.start.y;
  const length = Math.hypot(dx, dy);
  if (length <= args.maxLength) return [{ start: args.start, end: args.end }];

  const steps = Math.ceil(length / args.maxLength);
  const pieces = [];
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    pieces.push({
      start: { x: args.start.x + dx * t0, y: args.start.y + dy * t0 },
      end: { x: args.start.x + dx * t1, y: args.start.y + dy * t1 },
    });
  }
  return pieces;
};

export const splitTrailForRender = (segment: TrailSegment, maxLength: number) =>
  splitTrailSegment({ start: segment.start, end: segment.end, maxLength });
```

**Step 2: Wire into trail renderer (remove length > 8 skip)**

```ts
// src/render/trails.ts
import { splitTrailForRender } from "./trailSegments";
// ...
const pieces = splitTrailForRender(seg, 8);
pieces.forEach((piece, index) => {
  const key = `${seg.owner}-${seg.id}-${index}`;
  // create mesh per piece (same material)
});
```

**Step 3: Run tests**

Run: `npm test`
Expected: PASS for trail segmentation test.

**Step 4: Commit**

```bash
git add src/render/trailSegments.ts src/render/trails.ts
git commit -m "feat: split long trail segments for consistent rendering"
```

---

## Task 3: Skyline base height + near-ring visibility

**Files:**
- Modify: `src/render/environmentLayout.ts`
- Modify: `src/render/skyline.ts`

**Step 1: Add `baseHeight` to skyline layer definitions**

```ts
// src/render/environmentLayout.ts (within skylineLayers)
{
  radius: arenaHalf * 1.8,
  count: capCount(Math.round(arenaSize / 10)),
  minHeight: 60,
  maxHeight: 150,
  opacity: 0.95,
  stripCount: 4,
  billboardCount: 1,
  baseHeight: 10,
},
```

Use ~25% fewer counts across layers (e.g., divide counts by ~1.3 or increase divisor).

**Step 2: Apply `baseHeight` in skyline**

```ts
// src/render/skyline.ts
type SkylineArgs = { /* ... */ baseHeight?: number };
// ...
const baseHeight = args.baseHeight ?? 0;
building.position.set(Math.cos(angle) * radius, baseHeight, Math.sin(angle) * radius);
```

**Step 3: Run tests**

Run: `npm test`
Expected: PASS for skyline base height test.

**Step 4: Commit**

```bash
git add src/render/environmentLayout.ts src/render/skyline.ts
git commit -m "feat: raise skyline base height and rebalance layer density"
```

---

## Task 4: Reflection budget + continuous wall materials

**Files:**
- Modify: `src/render/environment.ts`

**Step 1: Reduce cube map size + update stride**

Change:
- Cube render target size: `512` → `256`
- `createEnvUpdateGate({ stride: 5 })` → `stride: 10`

**Step 2: Make wall materials double-sided (continuous from ground to rim)**

Add `side: THREE.DoubleSide` to `baseMaterial` + `topMaterial`.

**Step 3: Run tests**

Run: `npm test`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/render/environment.ts
git commit -m "perf: reduce reflection cost and enforce continuous wall"
```

---

## Verification

Run: `npm test`

Then run the Playwright visual pass and store screenshots in a new output folder.

