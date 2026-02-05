import * as THREE from "three";
import { createStaticEnvMap } from "../envMap";

test("createStaticEnvMap returns a cube texture with 6 faces", () => {
  const env = createStaticEnvMap(0x0b141f);
  expect(env).toBeInstanceOf(THREE.CubeTexture);

  const images = Array.isArray((env as unknown as { images?: unknown[] }).images)
    ? (env as unknown as { images: unknown[] }).images
    : (env.image as unknown as unknown[]);

  expect(images).toHaveLength(6);
  expect(env.version).toBeGreaterThan(0);
});
