export type PerfStats = {
  fps: number;
  frameMs: { avg: number; p95: number; max: number };
  simMs: { avg: number; max: number };
  updateMs: { avg: number; max: number };
  renderMs: { avg: number; max: number };
};

export type DiagnosticsSnapshot = {
  timestamp: string;
  perf: PerfStats;
  game: {
    mode: string;
    difficulty: string;
    players: number;
    trails: number;
    arenaSize: number;
  };
  system: {
    userAgent: string;
    hardwareConcurrency: number | null;
    deviceMemory: number | null;
    language: string;
    platform: string;
  };
  display?: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  memory?: {
    geometries: number;
    textures: number;
  };
  connection: {
    status: string;
    serverUrl: string;
    rttMs: number | null;
  };
  renderer: {
    vendor: string;
    renderer: string;
    glVersion: string;
    maxTextureSize: number;
    drawCalls: number;
    triangles: number;
  };
  lastMatch: {
    survival: number;
    status: string;
    eliminationReason: string | null;
  };
};

const formatMs = (value: number) => `${value.toFixed(2)}ms`;

export const formatDiagnostics = (snapshot: DiagnosticsSnapshot) => {
  const lines = [
    `Timestamp: ${snapshot.timestamp}`,
    "",
    "Performance",
    `FPS: ${snapshot.perf.fps.toFixed(1)}`,
    `Frame: avg ${formatMs(snapshot.perf.frameMs.avg)} | p95 ${formatMs(
      snapshot.perf.frameMs.p95
    )} | max ${formatMs(snapshot.perf.frameMs.max)}`,
    `Simulation: avg ${formatMs(snapshot.perf.simMs.avg)} | max ${formatMs(
      snapshot.perf.simMs.max
    )}`,
    `Update: avg ${formatMs(snapshot.perf.updateMs.avg)} | max ${formatMs(
      snapshot.perf.updateMs.max
    )}`,
    `Render: avg ${formatMs(snapshot.perf.renderMs.avg)} | max ${formatMs(
      snapshot.perf.renderMs.max
    )}`,
    "",
    "Game",
    `Mode: ${snapshot.game.mode}`,
    `Difficulty: ${snapshot.game.difficulty}`,
    `Players: ${snapshot.game.players}`,
    `Trails: ${snapshot.game.trails}`,
    `Arena Size: ${snapshot.game.arenaSize}`,
    "",
    "Renderer",
    `Vendor: ${snapshot.renderer.vendor}`,
    `Renderer: ${snapshot.renderer.renderer}`,
    `WebGL: ${snapshot.renderer.glVersion}`,
    `Max Texture Size: ${snapshot.renderer.maxTextureSize}`,
    `Draw Calls: ${snapshot.renderer.drawCalls}`,
    `Triangles: ${snapshot.renderer.triangles}`,
    "",
    "System",
    `User Agent: ${snapshot.system.userAgent}`,
    `CPU Cores: ${snapshot.system.hardwareConcurrency ?? "unknown"}`,
    `Device Memory: ${snapshot.system.deviceMemory ?? "unknown"} GB`,
    `Language: ${snapshot.system.language}`,
    `Platform: ${snapshot.system.platform}`,
    snapshot.display
      ? `Display: ${snapshot.display.width}x${snapshot.display.height} @ ${snapshot.display.pixelRatio.toFixed(
          2
        )} DPR`
      : null,
    snapshot.memory
      ? `WebGL Memory: ${snapshot.memory.geometries} geometries, ${snapshot.memory.textures} textures`
      : null,
    "",
    "Connection",
    `Status: ${snapshot.connection.status}`,
    `Server URL: ${snapshot.connection.serverUrl}`,
    `RTT (ms): ${snapshot.connection.rttMs ?? "n/a"}`,
    "",
    "Last Match",
    `Status: ${snapshot.lastMatch.status}`,
    `Survival: ${snapshot.lastMatch.survival.toFixed(1)}s`,
    `Elimination: ${snapshot.lastMatch.eliminationReason ?? "n/a"}`,
  ];

  return lines.join("\n");
};
