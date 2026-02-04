import "./style.css";
import { CONFIG } from "./sim/config";
import { vec2 } from "./sim/math";
import type { WorldState } from "./sim/types";
import { createGameLoop } from "./game/loop";
import { createScene } from "./render/scene";
import { createBloomComposer } from "./render/bloom";
import { createBikeRenderer } from "./render/bike";
import { createTrailRenderer } from "./render/trails";
import { createHUD } from "./ui/hud";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <div id="stage"></div>
    <div class="hud">
      <h1>Light Duel</h1>
      <p id="status">Initializing...</p>
    </div>
  `;

  const stage = document.querySelector<HTMLDivElement>("#stage");

  if (!stage) {
    throw new Error("Stage container not found");
  }

  const { scene, camera, renderer, resize } = createScene(stage);
  const { composer, resize: resizeBloom } = createBloomComposer(renderer, scene, camera);
  const bikeRenderer = createBikeRenderer(scene);
  const trailRenderer = createTrailRenderer(scene);
  const hud = createHUD();

  const onResize = () => {
    resize();
    resizeBloom(stage.clientWidth, stage.clientHeight);
  };

  window.addEventListener("resize", onResize);
  onResize();

  const world: WorldState = {
    time: 0,
    players: [
      {
        id: "p1",
        pos: vec2(0, 0),
        heading: 0,
        turnVel: 0,
        alive: true,
        gapTimer: 0,
        gapOn: true,
        trailId: 0,
      },
    ],
    trails: [],
    arenaHalf: CONFIG.arenaSize / 2,
    running: true,
  };

  let input: -1 | 0 | 1 = 0;

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") input = -1;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") input = 1;
  });

  window.addEventListener("keyup", (event) => {
    if (
      event.key === "ArrowLeft" ||
      event.key.toLowerCase() === "a" ||
      event.key === "ArrowRight" ||
      event.key.toLowerCase() === "d"
    ) {
      input = 0;
    }
  });

  createGameLoop(world, () => ({ p1: input }), (next) => {
    bikeRenderer.update(next.players);
    trailRenderer.update(next.trails);
    hud.update({
      time: next.time,
      alive: next.players.filter((p) => p.alive).length,
      total: next.players.length,
    });
    composer.render();
  });
}
