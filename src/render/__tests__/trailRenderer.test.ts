import * as THREE from "three";
import { vec2 } from "../../sim/math";
import { createTrailRenderer } from "../trails";
import { getPlayerColor } from "../palette";

test("trail renderer colors segments per player and can reset", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 1,
      owner: "b1",
      start: vec2(0, 0),
      end: vec2(2, 0),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  const mesh = scene.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh;
  const material = mesh.material as THREE.MeshStandardMaterial;
  expect(material.color.getHex()).toBe(getPlayerColor("b1"));

  renderer.reset();
  expect(scene.children.length).toBe(0);
});
