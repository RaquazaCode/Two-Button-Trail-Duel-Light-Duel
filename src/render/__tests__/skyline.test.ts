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

  expect(skyline).toBeInstanceOf(THREE.Group);
  expect(skyline.children.length).toBe(12);

  skyline.children.forEach((child) => {
    const distance = Math.hypot(child.position.x, child.position.z);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(170);
    expect(child.scale.y).toBeGreaterThanOrEqual(12);
    expect(child.scale.y).toBeLessThanOrEqual(28);
  });
});
