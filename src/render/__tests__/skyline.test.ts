import * as THREE from "three";
import { createSkyline } from "../skyline";

test("createSkyline builds a ring of buildings", () => {
  const skyline = createSkyline({
    radius: 140,
    count: 12,
    minHeight: 12,
    maxHeight: 28,
    color: 0x0b1620,
    emissive: 0x00f5ff,
  });

  expect(skyline).toBeInstanceOf(THREE.InstancedMesh);
  expect(skyline.count).toBe(12);

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  skyline.getMatrixAt(0, matrix);
  matrix.decompose(position, rotation, scale);

  const distance = Math.hypot(position.x, position.z);
  expect(distance).toBeGreaterThan(110);
  expect(distance).toBeLessThan(170);
  expect(scale.y).toBeGreaterThanOrEqual(12);
  expect(scale.y).toBeLessThanOrEqual(28);
});

test("createSkyline keeps billboards from overpowering glare", () => {
  const skyline = createSkyline({
    radius: 60,
    count: 6,
    minHeight: 10,
    maxHeight: 30,
    color: 0x0d1824,
    emissive: 0x3af7ff,
  });

  const material = skyline.material as THREE.MeshStandardMaterial;
  expect(material.emissiveIntensity).toBeLessThanOrEqual(0.9);
});
