import * as THREE from "three";
import { createEnvUpdateGate } from "./envGate";
import { createReflectiveFloor } from "./floor";
import { createGridOverlay } from "./grid";
import { computeEnvironmentLayout } from "./environmentLayout";
import { createSkyline } from "./skyline";

export const createEnvironment = (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  arenaSize: number
) => {
  const layout = computeEnvironmentLayout(arenaSize);
  scene.fog = new THREE.FogExp2(0x05080d, 0.006);

  const envTarget = new THREE.WebGLCubeRenderTarget(512, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCamera = new THREE.CubeCamera(1, 600, envTarget);
  scene.add(cubeCamera);

  const floor = createReflectiveFloor({
    size: layout.floorSize,
    envMap: envTarget.texture,
    roughness: 0.06,
    envMapIntensity: 1.8,
    color: 0x0b141f,
  });
  scene.add(floor);

  const grid = createGridOverlay({
    size: layout.gridSize,
    cellSize: layout.gridCell,
    majorEvery: layout.gridMajorEvery,
    minorLine: layout.gridMinorLine,
    majorLine: layout.gridMajorLine,
    minorColor: 0x3af7ff,
    majorColor: 0xf5fbff,
    opacity: 0.95,
  });
  grid.position.y = 0.03;
  scene.add(grid);

  const skyline = createSkyline({
    radius: layout.skylineRadius,
    count: layout.skylineCount,
    minHeight: 18,
    maxHeight: 46,
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

  const stadiumMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1208,
    emissive: 0xff4b1a,
    emissiveIntensity: 1.05,
    metalness: 0.35,
    roughness: 0.4,
  });

  const stadiumWall = new THREE.Mesh(
    new THREE.CylinderGeometry(
      layout.stadiumRadius + layout.stadiumTube * 0.35,
      layout.stadiumRadius + layout.stadiumTube * 0.35,
      layout.stadiumHeight,
      64,
      1,
      true
    ),
    stadiumMaterial
  );
  stadiumWall.position.y = layout.stadiumHeight * 0.5 - 0.2;
  scene.add(stadiumWall);

  const stadiumRim = new THREE.Mesh(
    new THREE.TorusGeometry(layout.stadiumRadius, layout.stadiumTube, 16, 64),
    stadiumMaterial
  );
  stadiumRim.rotation.x = Math.PI / 2;
  scene.add(stadiumRim);

  const gate = createEnvUpdateGate({ stride: 5, maxFrameMs: 40, sampleSize: 5 });

  const update = (dtMs: number) => {
    if (!gate.shouldUpdate(dtMs)) return;
    floor.visible = false;
    cubeCamera.update(renderer, scene);
    floor.visible = true;
  };

  return { update };
};
