import * as THREE from "three";
import { createBikeModel } from "../bike";

test("createBikeModel builds a long, aerodynamic bike silhouette", () => {
  const bike = createBikeModel(0x00f5ff);
  expect(bike).toBeInstanceOf(THREE.Group);

  const bounds = new THREE.Box3().setFromObject(bike);
  const size = new THREE.Vector3();
  bounds.getSize(size);

  expect(size.z).toBeGreaterThan(size.x * 2);
  expect(size.y).toBeLessThan(size.z);

  const emissiveMeshes = bike.children.filter((child) => {
    if (!(child instanceof THREE.Mesh)) return false;
    const material = child.material as THREE.MeshStandardMaterial;
    return material.emissiveIntensity != null && material.emissiveIntensity > 0.5;
  });
  expect(emissiveMeshes.length).toBeGreaterThan(0);
});
