import "./style.css";
import { CONFIG } from "./sim/config";
import { vec2 } from "./sim/math";
import type { PlayerState, WorldState } from "./sim/types";
import { createGameLoop, type LoopHandle } from "./game/loop";
import { createScene } from "./render/scene";
import { createBloomComposer } from "./render/bloom";
import { createBikeRenderer } from "./render/bike";
import { createTrailRenderer } from "./render/trails";
import { createChaseCameraController } from "./render/chaseCamera";
import { CHASE_CONFIG } from "./render/chaseConfig";
import { createHUD } from "./ui/hud";
import { createMinimap } from "./ui/minimap";
import { createEliminationEffects } from "./render/elimination";
import { createDiagnosticsPanel } from "./ui/diagnostics";
import {
  createMenu,
  createResult,
  createDifficultyMenu,
  modeToUseServer,
  type ConnectionStatus,
  type DifficultyOption,
  type ModeOption,
} from "./ui/menu";
import { chooseBotInput } from "./sim/bot";
import { assignBotRoles, type BotRole } from "./sim/botRoles";
import { renderGameToText } from "./game/telemetry";
import { advanceWorld } from "./game/time";
import { evaluateOutcome } from "./game/outcome";
import { shouldAutoStart } from "./game/autostart";
import { connectLightDuel, type LightDuelConnection } from "./net/colyseus";
import { snapshotToWorld } from "./net/snapshot";
import { generateSpawnPoints } from "./game/spawn";
import { createPerfTracker } from "./game/perf";
import { formatDiagnostics, type DiagnosticsSnapshot } from "./game/diagnostics";

const app = document.querySelector<HTMLDivElement>("#app");

const createPlayers = (): PlayerState[] => {
  const total = 8;
  const spawns = generateSpawnPoints({
    count: total,
    arenaHalf: CONFIG.arenaSize / 2,
    minDistance: CONFIG.speed * 5,
    margin: CONFIG.speed * 2,
  });

  return spawns.map((spawn, index) => ({
    id: index === 0 ? "p1" : `b${index}`,
    pos: vec2(spawn.pos.x, spawn.pos.y),
    heading: spawn.heading,
    turnVel: 0,
    alive: true,
    gapTimer: 0,
    gapOn: true,
    trailId: 0,
  }));
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

  const { scene, camera, renderer, resize, environment } = createScene(stage, {
    arenaSize: CONFIG.arenaSize,
  });
  const { composer, resize: resizeBloom } = createBloomComposer(renderer, scene, camera);
  const bikeRenderer = createBikeRenderer(scene);
  const trailRenderer = createTrailRenderer(scene);
  const eliminationEffects = createEliminationEffects(scene);
  const hud = createHUD();
  const minimap = createMinimap(app);
  const chaseCamera = createChaseCameraController(camera, CHASE_CONFIG);
  const perfTracker = createPerfTracker();
  const lastMatch = { survival: 0, status: "N/A", eliminationReason: null as string | null };
  const gl = renderer.getContext();
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const rendererInfo = {
    vendor: debugInfo ? (gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string) : "unknown",
    renderer: debugInfo ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) : "unknown",
    glVersion: gl.getParameter(gl.VERSION) as string,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
  };

  const onResize = () => {
    resize();
    resizeBloom(stage.clientWidth, stage.clientHeight);
  };

  window.addEventListener("resize", onResize);
  onResize();

  let loop: LoopHandle | null = null;
  let world: WorldState | null = null;
  let input: -1 | 0 | 1 = 0;
  let connection: LightDuelConnection | null = null;
  let mode: ModeOption = CONFIG.useServer ? "ONLINE" : "LOCAL";
  let difficulty: DifficultyOption = "EASY";
  let botRoles = new Map<string, BotRole>();
  let connectionStatus: ConnectionStatus = "DISCONNECTED";
  let lastFrame = performance.now();
  let menu: ReturnType<typeof createMenu>;
  let difficultyMenu: ReturnType<typeof createDifficultyMenu> | null = null;

  const buildDiagnosticsSnapshot = (): DiagnosticsSnapshot => {
    const perf = perfTracker.snapshot();
    const connectionInfo = (navigator as Navigator & { connection?: { rtt?: number } })
      .connection;
    return {
      timestamp: new Date().toISOString(),
      perf: {
        fps: perf.fps,
        frameMs: perf.frameMs,
        updateMs: perf.updateMs,
        renderMs: perf.renderMs,
      },
      game: {
        mode,
        difficulty,
        players: perf.players,
        trails: perf.trails,
        arenaSize: CONFIG.arenaSize,
      },
      system: {
        userAgent: navigator.userAgent,
        hardwareConcurrency: navigator.hardwareConcurrency ?? null,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
        language: navigator.language,
        platform: navigator.platform,
      },
      display: {
        width: renderer.domElement.width,
        height: renderer.domElement.height,
        pixelRatio: window.devicePixelRatio || 1,
      },
      memory: {
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
      },
      connection: {
        status: connectionStatus,
        serverUrl: CONFIG.serverUrl,
        rttMs: connectionInfo?.rtt ?? null,
      },
      renderer: {
        vendor: rendererInfo.vendor,
        renderer: rendererInfo.renderer,
        glVersion: rendererInfo.glVersion,
        maxTextureSize: rendererInfo.maxTextureSize,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
      },
      lastMatch: {
        survival: lastMatch.survival,
        status: lastMatch.status,
        eliminationReason: lastMatch.eliminationReason,
      },
    };
  };

  const diagnosticsPanel = createDiagnosticsPanel({
    getText: () => formatDiagnostics(buildDiagnosticsSnapshot()),
  });

  const applyWorld = (next: WorldState) => {
    const frameStart = performance.now();
    const dtMs = Math.max(1, frameStart - lastFrame);
    lastFrame = frameStart;
    chaseCamera.update(next, dtMs / 1000);
    environment.update(dtMs);
    bikeRenderer.update(next.players, next.time);
    trailRenderer.update(next.trails, next.players, next.time);
    eliminationEffects.update(next.players, next.time);
    hud.update({
      time: next.time,
      alive: next.players.filter((p) => p.alive).length,
      total: next.players.length,
      mode,
      roundDuration: CONFIG.roundDuration,
    });
    minimap.update(next);
    const renderStart = performance.now();
    composer.render();
    const frameEnd = performance.now();
    perfTracker.record({
      frameMs: dtMs,
      updateMs: renderStart - frameStart,
      renderMs: frameEnd - renderStart,
      players: next.players.length,
      trails: next.trails.length,
    });
  };

  const getInputs = () => {
    if (!world) return { p1: 0 };
    const inputs: Record<string, -1 | 0 | 1> = { p1: input };
    const player = world.players.find((p) => p.id === "p1");
    world.players
      .filter((p) => p.id !== "p1")
      .forEach((bot) => {
        inputs[bot.id] = chooseBotInput({
          id: bot.id,
          pos: bot.pos,
          heading: bot.heading,
          turnVel: bot.turnVel,
          arenaHalf: world!.arenaHalf,
          trails: world!.trails,
          time: world!.time,
          playerPos: player?.pos,
          difficulty,
          role: botRoles.get(bot.id),
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
    if (modeToUseServer(mode)) return;
    if (!world) return;
    loop?.stop();
    world = advanceWorld(world, getInputs(), ms, 1 / CONFIG.simHz);
    applyWorld(world);
  };

  const setInput = (value: -1 | 0 | 1) => {
    input = value;
    connection?.sendInput(value);
  };

  const bindInputHandlers = () => {
    window.onkeydown = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        setInput(-1);
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        setInput(1);
      }
    };

    window.onkeyup = (event) => {
      if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a" ||
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
      ) {
        setInput(0);
      }
    };
  };

  const finishMatch = (next: WorldState) => {
    const outcome = evaluateOutcome(next, "p1", CONFIG.roundDuration);
    if (!outcome.finished) return;

    loop?.stop();
    loop = null;
    void connection?.leave();
    connection = null;

    const hash = `${outcome.winner}-${Math.floor(next.time * 1000)}`;
    const result = createResult({
      winner: outcome.winner,
      hash,
      payout: outcome.status === "VICTORY" ? 0.45 : 0,
      status: outcome.status,
      survival: outcome.survival,
      eliminationReason: outcome.eliminationReason,
      eliminatedBy: outcome.eliminatedBy,
    });
    lastMatch.survival = outcome.survival;
    lastMatch.status = outcome.status;
    lastMatch.eliminationReason = outcome.eliminationReason ?? null;
    result.mount(app);
    result.onRestart(() => {
      result.unmount();
      startMatch();
    });
    result.onMainMenu(() => {
      result.unmount();
      connectionStatus = "DISCONNECTED";
      menu.setStatus(connectionStatus);
      menu.mount(app);
    });
  };

  const startMatch = () => {
    loop?.stop();
    loop = null;
    void connection?.leave();
    connection = null;
    difficultyMenu?.unmount();
    difficultyMenu = null;
    lastFrame = performance.now();
    trailRenderer.reset();
    bikeRenderer.reset();
    eliminationEffects.reset();

    input = 0;
    bindInputHandlers();

    if (modeToUseServer(mode)) {
      world = null;
      connectionStatus = "CONNECTING";
      menu.setStatus(connectionStatus);
      void (async () => {
        try {
          connection = await connectLightDuel({
            url: CONFIG.serverUrl,
            onSnapshot: (snapshot) => {
              if (connectionStatus !== "CONNECTED") {
                connectionStatus = "CONNECTED";
                menu.setStatus(connectionStatus);
                menu.unmount();
              }
              world = snapshotToWorld(snapshot);
              applyWorld(world);
              finishMatch(world);
            },
            onLeave: () => {
              connectionStatus = "DISCONNECTED";
              menu.setStatus(connectionStatus);
            },
          });
        } catch (err) {
          connectionStatus = "DISCONNECTED";
          menu.setStatus(connectionStatus);
        }
      })();
      return;
    }

    connectionStatus = "DISCONNECTED";
    menu.setStatus(connectionStatus);
    menu.unmount();

    world = {
      time: 0,
      players: createPlayers(),
      trails: [],
      arenaHalf: CONFIG.arenaSize / 2,
      running: true,
    };
    botRoles = assignBotRoles(
      world.players.filter((player) => player.id !== "p1").map((player) => player.id),
      difficulty
    );

    loop = createGameLoop(world, getInputs, (next) => {
      world = next;
      applyWorld(next);
      finishMatch(next);
    });
  };

  menu = createMenu({ entry: 0.25, payout: 0.45, mode, status: connectionStatus });
  menu.onModeChange((nextMode) => {
    mode = nextMode;
    connectionStatus = "DISCONNECTED";
    menu.setStatus(connectionStatus);
  });
  menu.mount(app);
  menu.onDiagnostics(() => {
    diagnosticsPanel.mount(app);
    diagnosticsPanel.onClose(() => diagnosticsPanel.unmount());
  });
  menu.onStart(() => {
    if (mode === "LOCAL") {
      menu.unmount();
      difficultyMenu?.unmount();
      difficultyMenu = createDifficultyMenu({ difficulty });
      difficultyMenu.mount(app);
      difficultyMenu.onDifficultyChange((next) => {
        difficulty = next;
      });
      difficultyMenu.onStart(() => {
        difficultyMenu?.unmount();
        difficultyMenu = null;
        startMatch();
      });
      difficultyMenu.onBack(() => {
        difficultyMenu?.unmount();
        difficultyMenu = null;
        menu.mount(app);
      });
      return;
    }
    startMatch();
  });
  if (shouldAutoStart(window.location.search)) {
    startMatch();
  }
}
