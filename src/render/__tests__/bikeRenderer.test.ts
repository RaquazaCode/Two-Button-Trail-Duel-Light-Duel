import * as THREE from "three";
import { createBikeRenderer } from "../bike";
import { vec2 } from "../../sim/math";

test("bike renderer can reset and clear meshes", () => {
  const scene = new THREE.Scene();
  const renderer = createBikeRenderer(scene);
  renderer.update([
    {
      id: "p1",
      pos: vec2(0, 0),
      heading: 0,
      turnVel: 0,
      alive: true,
      gapTimer: 0,
      gapOn: true,
      trailId: 0,
    },
  ]);

  expect(scene.children.length).toBe(1);
  renderer.reset();
  expect(scene.children.length).toBe(0);
});
