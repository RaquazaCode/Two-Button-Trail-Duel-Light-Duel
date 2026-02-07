export type PerfSample = {
  frameMs: number;
  simMs?: number;
  updateMs: number;
  renderMs: number;
  players: number;
  trails: number;
};

export type PerfSnapshot = {
  fps: number;
  frameMs: { avg: number; p95: number; max: number };
  simMs: { avg: number; max: number };
  updateMs: { avg: number; max: number };
  renderMs: { avg: number; max: number };
  players: number;
  trails: number;
};

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const percentile = (values: number[], p: number) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(p * (sorted.length - 1)));
  return sorted[index];
};

export const createPerfTracker = (maxSamples = 180) => {
  const samples: PerfSample[] = [];

  const record = (sample: PerfSample) => {
    samples.push(sample);
    if (samples.length > maxSamples) {
      samples.splice(0, samples.length - maxSamples);
    }
  };

  const snapshot = (): PerfSnapshot => {
    const frame = samples.map((s) => s.frameMs);
    const sim = samples.map((s) => s.simMs ?? 0);
    const update = samples.map((s) => s.updateMs);
    const render = samples.map((s) => s.renderMs);
    const lastSample = samples.length > 0 ? samples[samples.length - 1] : undefined;
    const avgFrame = average(frame);
    const avgSim = average(sim);
    const avgUpdate = average(update);
    const avgRender = average(render);

    return {
      fps: avgFrame > 0 ? 1000 / avgFrame : 0,
      frameMs: {
        avg: avgFrame,
        p95: percentile(frame, 0.95),
        max: frame.length ? Math.max(...frame) : 0,
      },
      simMs: {
        avg: avgSim,
        max: sim.length ? Math.max(...sim) : 0,
      },
      updateMs: {
        avg: avgUpdate,
        max: update.length ? Math.max(...update) : 0,
      },
      renderMs: {
        avg: avgRender,
        max: render.length ? Math.max(...render) : 0,
      },
      players: lastSample?.players ?? 0,
      trails: lastSample?.trails ?? 0,
    };
  };

  return { record, snapshot };
};
