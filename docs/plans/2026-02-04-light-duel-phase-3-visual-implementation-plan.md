# Light Duel Phase 3 Visual Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Phase 3 visual overhaul with a cube‑map reflective floor, procedural skyline, stadium ring, and fog while keeping everything procedural and performant.

**Architecture:** Add a dedicated environment renderer module that owns the floor, skyline, stadium, fog, and cube‑map update cadence. The sim remains unchanged; rendering is layered on top and updated in the existing render loop.

**Tech Stack:** Vite + TypeScript + Three.js, Vitest.

---

## Assumptions / Defaults
- Work is performed on `main` (explicit user override to skip worktrees).
- No external assets (pure procedural meshes/materials).
- Performance: cube‑map updates throttled (default every 5 frames) and paused if frame time spikes.

---

### Task 1: Env update gate helper (performance throttle)
**Files:**
- Create: `src/render/envGate.ts`
- Create: `src/render/__tests__/envGate.test.ts`

**Step 1: Write the failing test**
```ts
import { createEnvUpdateGate } from "../envGate";

test("env update gate throttles by stride", () => {
  const gate = createEnvUpdateGate({ stride: 3, maxFrameMs: 40, sampleSize: 3 });
  expect(gate.shouldUpdate(16)).toBe(false);
  expect(gate.shouldUpdate(16)).toBe(false);
  expect(gate.shouldUpdate(16)).toBe(true);
});

test("env update gate disables when frame time spikes", () => {
  const gate = createEnvUpdateGate({ stride: 1, maxFrameMs: 30, sampleSize: 3 });
  expect(gate.shouldUpdate(20)).toBe(true);
  expect(gate.shouldUpdate(50)).toBe(false);
  expect(gate.shouldUpdate(50)).toBe(false);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/render/__tests__/envGate.test.ts`
Expected: FAIL (module not found)

**Step 3: Write minimal implementation**
```ts
export const createEnvUpdateGate = (args: {
  stride: number;
  maxFrameMs: number;
  sampleSize: number;
}) => {
  let frame = 0;
  const samples: number[] = [];

  const average = () => samples.reduce((sum, value) => sum + value, 0) / samples.length;

  return {
    shouldUpdate: (dtMs: number) => {
      frame += 1;
      samples.push(dtMs);
      if (samples.length > args.sampleSize) samples.shift();

      if (samples.length === args.sampleSize && average() > args.maxFrameMs) {
        return false;
      }

      return frame % args.stride === 0;
    },
  };
};
```

**Step 4: Run test to verify it passes**
Run: `npm test -- src/render/__tests__/envGate.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/render/envGate.ts src/render/__tests__/envGate.test.ts
git commit -m "feat: add env update gate helper"
```

---

### Task 2: Procedural skyline builder
**Files:**
- Create: `src/render/skyline.ts`
- Create: `src/render/__tests__/skyline.test.ts`

**Step 1: Write the failing test**
```ts
import * as THREE from "three";
import { createSkyline } from "../skyline";

test("createSkyline builds a ring of buildings", () => {
  const skyline = createSkyline({
    radius: 140,
    count: 12,
    minHeight: 12,
    maxHeight: 28,
    color: 0x0b1620,
    emissive: 0x00f5ff,
  });

  expect(skyline).toBeInstanceOf(THREE.Group);
  expect(skyline.children.length).toBe(12);

  skyline.children.forEach((child) => {
    const distance = Math.hypot(child.position.x, child.position.z);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(170);
    expect(child.scale.y).toBeGreaterThanOrEqual(12);
    expect(child.scale.y).toBeLessThanOrEqual(28);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/render/__tests__/skyline.test.ts`
Expected: FAIL (module not found)

**Step 3: Write minimal implementation**
```ts
import * as THREE from "three";

type SkylineArgs = {
  radius: number;
  count: number;
  minHeight: number;
  maxHeight: number;
  color: number;
  emissive: number;
};

const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const createSkyline = (args: SkylineArgs) => {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(8, 1, 8);

  for (let i = 0; i < args.count; i += 1) {
    const angle = (i / args.count) * Math.PI * 2;
    const jitter = (noise(i + 1) - 0.5) * 18;
    const radius = args.radius + jitter;
    const height = args.minHeight + noise(i + 7) * (args.maxHeight - args.minHeight);

    const material = new THREE.MeshStandardMaterial({
      color: args.color,
      emissive: args.emissive,
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
    mesh.scale.y = height;
    group.add(mesh);
  }

  return group;
};
```

**Step 4: Run test to verify it passes**
Run: `npm test -- src/render/__tests__/skyline.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/render/skyline.ts src/render/__tests__/skyline.test.ts
git commit -m "feat: add procedural skyline"
```

---

### Task 3: Reflective floor material builder
**Files:**
- Create: `src/render/floor.ts`
- Create: `src/render/__tests__/floor.test.ts`

**Step 1: Write the failing test**
```ts
import * as THREE from "three";
import { createReflectiveFloor } from "../floor";

test("createReflectiveFloor configures a reflective material", () => {
  const envMap = new THREE.Texture();
  const floor = createReflectiveFloor({
    size: 240,
    envMap,
    roughness: 0.08,
    envMapIntensity: 1.1,
    color: 0x040b12,
  });

  const material = floor.material as THREE.MeshStandardMaterial;
  expect(material.metalness).toBe(1);
  expect(material.roughness).toBeCloseTo(0.08);
  expect(material.envMapIntensity).toBeCloseTo(1.1);
  expect(typeof material.onBeforeCompile).toBe("function");
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- src/render/__tests__/floor.test.ts`
Expected: FAIL (module not found)

**Step 3: Write minimal implementation**
```ts
import * as THREE from "three";

type FloorArgs = {
  size: number;
  envMap: THREE.Texture;
  roughness: number;
  envMapIntensity: number;
  color: number;
};

export const createReflectiveFloor = (args: FloorArgs) => {
  const geometry = new THREE.PlaneGeometry(args.size, args.size);
  const material = new THREE.MeshStandardMaterial({
    color: args.color,
    metalness: 1,
    roughness: args.roughness,
    envMap: args.envMap,
    envMapIntensity: args.envMapIntensity,
  });

  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <envmap_fragment>",
      `#include <envmap_fragment>\n        float fresnel = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);\n        outgoingLight += envMapColor * fresnel * 0.35;`
    );
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
};
```

**Step 4: Run test to verify it passes**
Run: `npm test -- src/render/__tests__/floor.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/render/floor.ts src/render/__tests__/floor.test.ts
git commit -m "feat: add reflective floor builder"
```

---

### Task 4: Environment module (floor + skyline + stadium + fog)
**Files:**
- Create: `src/render/environment.ts`
- Modify: `src/render/scene.ts`

**Step 1: Write the failing test**
```ts
import { createEnvUpdateGate } from "../envGate";

test("env gate can be reused for environment updates", () => {
  const gate = createEnvUpdateGate({ stride: 2, maxFrameMs: 40, sampleSize: 2 });
  expect(gate.shouldUpdate(16)).toBe(false);
  expect(gate.shouldUpdate(16)).toBe(true);
});
```
(Use this as a quick regression check; env module itself is visual.)

**Step 2: Run test to verify it fails**
Run: `npm test -- src/render/__tests__/envGate.test.ts`
Expected: PASS (already covered). Proceed to implementation.

**Step 3: Implement environment module**
```ts
import * as THREE from "three";
import { createEnvUpdateGate } from "./envGate";
import { createReflectiveFloor } from "./floor";
import { createSkyline } from "./skyline";

export const createEnvironment = (scene: THREE.Scene, renderer: THREE.WebGLRenderer) => {
  scene.fog = new THREE.FogExp2(0x05080d, 0.018);

  const envTarget = new THREE.WebGLCubeRenderTarget(512, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCamera = new THREE.CubeCamera(1, 600, envTarget);
  scene.add(cubeCamera);

  const floor = createReflectiveFloor({
    size: 260,
    envMap: envTarget.texture,
    roughness: 0.08,
    envMapIntensity: 1.1,
    color: 0x050b12,
  });
  scene.add(floor);

  const skyline = createSkyline({
    radius: 140,
    count: 28,
    minHeight: 14,
    maxHeight: 36,
    color: 0x0b1620,
    emissive: 0x00f5ff,
  });
  scene.add(skyline);

  const stadium = new THREE.Mesh(
    new THREE.TorusGeometry(95, 2.5, 12, 48),
    new THREE.MeshStandardMaterial({
      color: 0x07131d,
      emissive: 0xff6a00,
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.5,
    })
  );
  stadium.rotation.x = Math.PI / 2;
  scene.add(stadium);

  const gate = createEnvUpdateGate({ stride: 5, maxFrameMs: 40, sampleSize: 5 });

  const update = (dtMs: number) => {
    if (!gate.shouldUpdate(dtMs)) return;
    floor.visible = false;
    cubeCamera.update(renderer, scene);
    floor.visible = true;
  };

  return { update };
};
```

**Step 4: Modify scene setup to use environment**
```ts
// in src/render/scene.ts
import { createEnvironment } from "./environment";

// remove GridHelper + PlaneGeometry
// add softer ambient + directional lights
const ambient = new THREE.HemisphereLight(0x66ccff, 0x070b12, 0.65);
const key = new THREE.DirectionalLight(0xb7e6ff, 0.5);
key.position.set(40, 80, 30);
scene.add(ambient, key);

const environment = createEnvironment(scene, renderer);

return { scene, camera, renderer, resize, environment };
```

**Step 5: Commit**
```bash
git add src/render/environment.ts src/render/scene.ts
git commit -m "feat: add environment renderer"
```

---

### Task 5: Wire environment updates into main loop
**Files:**
- Modify: `src/main.ts`

**Step 1: Write the failing test**
(Visual integration; no unit test required. Use Playwright verification below.)

**Step 2: Implement**
```ts
// after createScene(...)
const { scene, camera, renderer, resize, environment } = createScene(stage);

let lastFrame = performance.now();
const applyWorld = (next: WorldState) => {
  const now = performance.now();
  const dtMs = Math.max(1, now - lastFrame);
  lastFrame = now;
  environment.update(dtMs);
  // existing bike/trail/hud updates...
};
```

**Step 3: Playwright verification**
Run Playwright client and capture screenshots:
```bash
node ~/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url http://127.0.0.1:5175 \
  --actions-file ~/.codex/skills/develop-web-game/references/action_payloads.json \
  --iterations 2 --pause-ms 250 \
  --screenshot-dir /private/tmp/light-duel-web-game-phase3-env
```
Expected: floor shows reflections; skyline visible with fog.

**Step 4: Commit**
```bash
git add src/main.ts
git commit -m "feat: update environment each frame"
```

---

### Task 6: Documentation update
**Files:**
- Modify: `progress.md`

**Step 1:** Append Phase 3 implementation progress and screenshot paths.

**Step 2:** Commit
```bash
git add progress.md
git commit -m "docs: track phase 3 environment progress"
```

---

## Test Cases and Scenarios
- Env update gate throttles by stride and disables on frame spikes.
- Skyline builder creates deterministic ring of buildings.
- Reflective floor material is configured with envMap + Fresnel hook.
- Playwright screenshots show glossy floor + skyline + fog.

## Acceptance Criteria
- Visual environment no longer looks like a flat grid; reflections are visible.
- Skyline and stadium ring add depth without obscuring gameplay.
- Performance remains stable (cube‑map updates throttled).

