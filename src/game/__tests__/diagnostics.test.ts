import { formatDiagnostics } from "../diagnostics";

test("formatDiagnostics includes key performance and system info", () => {
  const text = formatDiagnostics({
    timestamp: "2026-02-05T12:00:00Z",
    perf: {
      fps: 60,
      frameMs: { avg: 16.6, p95: 21.2, max: 30.5 },
      simMs: { avg: 5.8, max: 12.2 },
      updateMs: { avg: 3.2, max: 6.1 },
      renderMs: { avg: 5.1, max: 9.4 },
    },
    game: {
      mode: "LOCAL",
      difficulty: "EASY",
      players: 8,
      trails: 120,
      arenaSize: 875,
    },
    system: {
      userAgent: "TestAgent",
      hardwareConcurrency: 8,
      deviceMemory: 16,
      language: "en-US",
      platform: "MacIntel",
    },
    connection: {
      status: "DISCONNECTED",
      serverUrl: "ws://localhost:2567",
      rttMs: null,
    },
    renderer: {
      vendor: "TestVendor",
      renderer: "TestRenderer",
      glVersion: "WebGL 2.0",
      maxTextureSize: 4096,
      drawCalls: 120,
      triangles: 12000,
    },
    lastMatch: {
      survival: 42,
      status: "VICTORY",
      eliminationReason: null,
    },
  });

  expect(text).toContain("FPS");
  expect(text).toContain("Simulation");
  expect(text).toContain("TestAgent");
  expect(text).toContain("Draw Calls");
  expect(text).toContain("Last Match");
});
