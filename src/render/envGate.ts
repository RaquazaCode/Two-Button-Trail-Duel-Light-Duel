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

      if (dtMs > args.maxFrameMs) {
        return false;
      }

      if (samples.length === args.sampleSize && average() > args.maxFrameMs) {
        return false;
      }

      return frame % args.stride === 0;
    },
  };
};
