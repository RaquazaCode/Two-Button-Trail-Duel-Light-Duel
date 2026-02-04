# Light Duel Design (MVP)

## Vision
Light Duel is a neon, Tron-inspired trail duel with short, high-skill rounds. It is 3D-rendered for spectacle but strictly 2D-simulated for fairness and determinism. The core promise is simple controls, instant readability, and strong trust optics for competitive play and micro-stakes.

## Core Loop
- 8 players, 60-second rounds
- Constant forward motion; only inputs are left and right steering
- Lethal trails: touching any trail or arena boundary eliminates you
- Deterministic arena shrink to prevent stalling
- Fixed gap cadence on trails (micro-gaps) + slight drift/inertia for feel

## World & Camera
- 3D arena, 2D physics plane
- Top-down camera with slight tilt for readability
- Neon bikes, emissive trails, glossy grid floor, stadium ring backdrop
- Minimal HUD: timer, players alive, trail cadence indicator

## Fairness & Determinism
- Symmetric spawns with global map rotation per round
- No items, no growth, no RNG
- Inputs are the only client signals; server runs authoritative simulation
- Replayable via input logs + round config hash

## Solo Micro-Stake Mode
- 1 player vs 7 bots
- Fixed entry fee and fixed payout if the player wins
- Bots use the same physics and constraints with deterministic behavior
- Clear pre-match disclosure and post-match verification hash

## Architecture Overview
- Client: Three.js rendering with a deterministic 2D simulation layer
- Server: authoritative simulation, collision checks, elimination events
- Networking: input events upstream, snapshot stream downstream
- Replay: store input log + round config for dispute resolution

## MVP Scope
- Core sim: physics, trails, collisions, elimination, shrink
- Visuals: neon arena, bikes, trails, HUD
- Solo bot mode: deterministic AI, match flow
- Trust optics: match hash, rules disclosure

## Out of Scope (v1)
- Multiplayer wagering
- Cosmetic systems
- Advanced matchmaking
- Account system
