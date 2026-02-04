import "./style.css";
import { CONFIG } from "./sim/config";
import { vec2 } from "./sim/math";
import type { PlayerState, WorldState } from "./sim/types";
import { createGameLoop, type LoopHandle } from "./game/loop";
import { createScene } from "./render/scene";
import { createBloomComposer } from "./render/bloom";
import { createBikeRenderer } from "./render/bike";
import { createTrailRenderer } from "./render/trails";
import { createHUD } from "./ui/hud";
import { createMenu, createResult } from "./ui/menu";
import { chooseBotInput } from "./sim/bot";
import { renderGameToText } from "./game/telemetry";
import { advanceWorld } from "./game/time";

const app = document.querySelector<HTMLDivElement>("#app");

const createPlayers = (): PlayerState[] => {
  const players: PlayerState[] = [];
  const radius = CONFIG.arenaSize * 0.3;
  const total = 8;
  for (let i = 0; i < total; i += 1) {
    const angle = (Math.PI * 2 * i) / total;
    players.push({
      id: i === 0 ? "p1" : `b${i}`,
      pos: vec2(Math.cos(angle) * radius, Math.sin(angle) * radius),
      heading: angle + Math.PI,
      turnVel: 0,
      alive: true,
      gapTimer: 0,
      gapOn: true,
      trailId: 0,
    });
  }
  return players;
};

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

  let loop: LoopHandle | null = null;
  let world: WorldState | null = null;
  let input: -1 | 0 | 1 = 0;

  const applyWorld = (next: WorldState) => {
    bikeRenderer.update(next.players);
    trailRenderer.update(next.trails);
    hud.update({
      time: next.time,
      alive: next.players.filter((p) => p.alive).length,
      total: next.players.length,
    });
    composer.render();
  };

  const getInputs = () => {
    if (!world) return { p1: 0 };
    const inputs: Record<string, -1 | 0 | 1> = { p1: input };
    world.players
      .filter((p) => p.id !== "p1")
      .forEach((bot) => {
        inputs[bot.id] = chooseBotInput({
          pos: bot.pos,
          heading: bot.heading,
          arenaHalf: world!.arenaHalf,
          trails: world!.trails,
        });
      });
    return inputs;
  };

  window.render_game_to_text = () => {
    if (!world) {
      return JSON.stringify({ mode: "menu", players: [], trails: { count: 0 } });
    }
    return renderGameToText(world);
  };

  window.advanceTime = (ms: number) => {
    if (!world) return;
    loop?.stop();
    world = advanceWorld(world, getInputs(), ms, 1 / CONFIG.simHz);
    applyWorld(world);
  };

  const startMatch = () => {
    world = {
      time: 0,
      players: createPlayers(),
      trails: [],
      arenaHalf: CONFIG.arenaSize / 2,
      running: true,
    };

    input = 0;

    window.onkeydown = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") input = -1;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") input = 1;
    };

    window.onkeyup = (event) => {
      if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a" ||
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
      ) {
        input = 0;
      }
    };

    loop = createGameLoop(world, getInputs, (next) => {
      world = next;
      applyWorld(next);

      const alive = next.players.filter((p) => p.alive);
      if (alive.length <= 1) {
        loop?.stop();
        const winner = alive[0]?.id ?? "none";
        const hash = `${winner}-${Math.floor(next.time * 1000)}`;
        const result = createResult({
          winner,
          hash,
          payout: winner === "p1" ? 0.45 : 0,
        });
        result.mount(app);
        result.onRestart(() => {
          result.unmount();
          startMatch();
        });
      }
    });
  };

  const menu = createMenu({ entry: 0.25, payout: 0.45 });
  menu.mount(app);
  menu.onStart(() => {
    menu.unmount();
    startMatch();
  });
}
