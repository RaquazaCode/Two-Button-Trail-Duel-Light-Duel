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
    {
      id: 1,
      owner: "b2",
      start: vec2(0, 1),
      end: vec2(2, 1),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  const meshes = scene.children.filter((child) => child instanceof THREE.Mesh) as THREE.Mesh[];
  expect(meshes.length).toBe(2);
  const colors = meshes.map((mesh) => (mesh.material as THREE.MeshStandardMaterial).color.getHex());
  expect(colors).toContain(getPlayerColor("b1"));
  expect(colors).toContain(getPlayerColor("b2"));

  renderer.reset();
  expect(scene.children.length).toBe(0);
});

test("trail renderer skips abnormal long segments", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 9,
      owner: "p1",
      start: vec2(0, 0),
      end: vec2(100, 0),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  expect(scene.children.length).toBe(0);
});
