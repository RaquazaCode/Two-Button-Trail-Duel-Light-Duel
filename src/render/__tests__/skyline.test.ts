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
    stripCount: 2,
    billboardCount: 2,
  });

  expect(skyline).toBeInstanceOf(THREE.Group);
  expect(skyline.children.length).toBe(12);

  skyline.children.forEach((child) => {
    const distance = Math.hypot(child.position.x, child.position.z);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(170);

    const bounds = new THREE.Box3().setFromObject(child);
    const size = new THREE.Vector3();
    bounds.getSize(size);
    expect(size.y).toBeGreaterThanOrEqual(12);
    expect(size.y).toBeLessThanOrEqual(28);

    const emissiveCount = child.children.filter((mesh) => {
      if (!(mesh instanceof THREE.Mesh)) return false;
      const material = mesh.material as THREE.MeshStandardMaterial;
      return material.emissiveIntensity != null && material.emissiveIntensity > 0.5;
    });
    expect(emissiveCount.length).toBeGreaterThan(0);

    const billboardMeshes = child.children.filter(
      (mesh) => mesh instanceof THREE.Mesh && mesh.geometry.type === "PlaneGeometry"
    );
    expect(billboardMeshes.length).toBeGreaterThanOrEqual(2);
  });
});
