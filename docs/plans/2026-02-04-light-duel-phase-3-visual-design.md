---
title: Light Duel Phase 3 Visual Design
status: approved
owner: Codex + Team
---

# Light Duel Phase 3 Visual Design (Environment Focus)

## Summary
Phase 3 upgrades the environment visuals to reach the North Star aesthetic without external assets. The primary change is a glossy, reflective floor using a cube-map reflection rig (custom shader tweak), plus a procedural skyline, stadium ring, and atmospheric fog.

## Goals
- Replace the wireframe grid with a reflective floor that reads neon trails clearly.
- Add depth via procedural skyline + stadium walls + fog.
- Keep all visuals procedural (no external assets) for speed and flexibility.
- Preserve performance by throttling cube-map updates and keeping geometry simple.

## Non-Goals
- No new gameplay rules or sim changes.
- No external GLTF assets or HDRI downloads.
- No multiplayer features beyond what already exists.

## Design Decisions
- **Reflection strategy:** Cube-map reflections via `WebGLCubeRenderTarget` + `CubeCamera`.
- **Material:** `MeshStandardMaterial` with high metalness, low roughness, and a Fresnel boost via `onBeforeCompile`.
- **Atmosphere:** `FogExp2` with cyan tint to push skyline into haze.
- **Environment geometry:** Procedural skyline (box meshes) + stadium ring (low-poly walls with emissive trim).
- **Performance:** Update cube-map every N frames; disable updates if frame time spikes.

## Components
- `src/render/environment.ts`
  - `createEnvironment(scene)` returns `{ update(dt), floor, skyline, stadium }`.
  - Creates floor mesh, cube-camera, skyline group, stadium ring, and fog.
- `src/render/scene.ts`
  - Wire `createEnvironment` into scene setup.
  - Add a low-intensity hemisphere + cool directional light.
- `src/main.ts`
  - Call `env.update(dt)` in the render loop before bloom.

## Rendering Details
- **Floor**
  - PlaneGeometry centered at origin (size ~ arena * 2.5).
  - `metalness: 1.0`, `roughness: 0.05`, `envMapIntensity: 1.0`.
  - Fresnel boost via shader injection (view angle factor).
  - Exclude floor from cube-camera render pass (avoid feedback).
- **Skyline**
  - Ring of low-poly boxes outside arena bounds.
  - Emissive window strips (simple emissive materials).
- **Stadium**
  - Low wall ring with emissive edge lines (cyan/orange accents).
- **Fog**
  - `FogExp2` with cyan tint and light density.
- **Grid overlay**
  - Subtle emissive line mesh for readability (low alpha).

## Tuning Parameters
- `envMapResolution` (256-512)
- `envMapUpdateStride` (e.g., every 5 frames)
- `envMapIntensity`
- `floorRoughness`
- `fogDensity`

## Validation
- Playwright screenshots show reflections on floor and a visible skyline with haze.
- Trails remain readable under bloom without washing out the floor.
- No severe FPS drop (cube-map update throttled).

## Risks
- Reflection feedback artifacts if the floor is included in cube-map render.
- Over-bright bloom washing out reflective surfaces.
- Fog density too high obscuring gameplay; needs tuning.
