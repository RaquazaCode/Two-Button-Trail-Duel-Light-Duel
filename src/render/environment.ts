import * as THREE from "three";
import { createEnvUpdateGate } from "./envGate";
import { createReflectiveFloor } from "./floor";
import { createSkyline } from "./skyline";

export const createEnvironment = (scene: THREE.Scene, renderer: THREE.WebGLRenderer) => {
  scene.fog = new THREE.FogExp2(0x05080d, 0.01);

  const envTarget = new THREE.WebGLCubeRenderTarget(512, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCamera = new THREE.CubeCamera(1, 600, envTarget);
  scene.add(cubeCamera);

  const floor = createReflectiveFloor({
    size: 260,
    envMap: envTarget.texture,
    roughness: 0.08,
    envMapIntensity: 1.6,
    color: 0x0a121c,
  });
  scene.add(floor);

  const grid = new THREE.GridHelper(220, 24, 0x3af7ff, 0x1a4b5d);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  grid.position.y = 0.02;
  scene.add(grid);

  const skyline = createSkyline({
    radius: 140,
    count: 28,
    minHeight: 14,
    maxHeight: 36,
    color: 0x101e2a,
    emissive: 0x3af7ff,
  });
  skyline.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity != null) {
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55;
    }
  });
  scene.add(skyline);

  const stadium = new THREE.Mesh(
    new THREE.TorusGeometry(95, 2.5, 12, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a0d08,
      emissive: 0xff8a1f,
      emissiveIntensity: 0.75,
      metalness: 0.4,
      roughness: 0.45,
    })
  );
  stadium.rotation.x = Math.PI / 2;
  scene.add(stadium);

  const gate = createEnvUpdateGate({ stride: 5, maxFrameMs: 40, sampleSize: 5 });

  const update = (dtMs: number) => {
    if (!gate.shouldUpdate(dtMs)) return;
    floor.visible = false;
    cubeCamera.update(renderer, scene);
    floor.visible = true;
  };

  return { update };
};
