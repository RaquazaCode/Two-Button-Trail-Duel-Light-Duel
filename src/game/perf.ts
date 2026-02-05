export type PerfSample = {
  frameMs: number;
  updateMs: number;
  renderMs: number;
  players: number;
  trails: number;
};

export type PerfSnapshot = {
  fps: number;
  frameMs: { avg: number; p95: number; max: number };
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
    const update = samples.map((s) => s.updateMs);
    const render = samples.map((s) => s.renderMs);
    const avgFrame = average(frame);
    const avgUpdate = average(update);
    const avgRender = average(render);

    return {
      fps: avgFrame > 0 ? 1000 / avgFrame : 0,
      frameMs: {
        avg: avgFrame,
        p95: percentile(frame, 0.95),
        max: frame.length ? Math.max(...frame) : 0,
      },
      updateMs: {
        avg: avgUpdate,
        max: update.length ? Math.max(...update) : 0,
      },
      renderMs: {
        avg: avgRender,
        max: render.length ? Math.max(...render) : 0,
      },
      players: samples.at(-1)?.players ?? 0,
      trails: samples.at(-1)?.trails ?? 0,
    };
  };

  return { record, snapshot };
};
