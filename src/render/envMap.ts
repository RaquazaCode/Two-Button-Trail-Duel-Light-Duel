import * as THREE from "three";

const buildFace = (color: number) => {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return { data: new Uint8Array([r, g, b, 255]), width: 1, height: 1 };
};

export const createStaticEnvMap = (color: number) => {
  const face = buildFace(color);
  const images = [face, face, face, face, face, face];
  const cube = new THREE.CubeTexture(images);
  cube.needsUpdate = true;
  cube.colorSpace = THREE.SRGBColorSpace;
  return cube;
};
