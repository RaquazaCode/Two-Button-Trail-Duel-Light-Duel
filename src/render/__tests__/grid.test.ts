import * as THREE from "three";
import { createGridOverlay } from "../grid";

test("createGridOverlay builds a repeatable grid plane", () => {
  const grid = createGridOverlay({
    size: 300,
    cellSize: 10,
    majorEvery: 5,
    minorLine: 0.08,
    majorLine: 0.2,
    minorColor: 0x3af7ff,
    majorColor: 0xffffff,
    opacity: 0.85,
  });

  expect(grid).toBeInstanceOf(THREE.Mesh);
  expect(grid.rotation.x).toBeCloseTo(-Math.PI / 2);
  const material = grid.material as THREE.ShaderMaterial;
  expect(material).toBeInstanceOf(THREE.ShaderMaterial);
  expect(material.transparent).toBe(true);
  expect(material.blending).toBe(THREE.AdditiveBlending);
  expect(material.depthWrite).toBe(false);
  expect(material.uniforms.uCellSize.value).toBe(10);
  expect(material.uniforms.uMajorEvery.value).toBe(5);
});
