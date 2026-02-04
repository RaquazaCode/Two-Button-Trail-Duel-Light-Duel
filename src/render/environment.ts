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
  scene.fog = new THREE.FogExp2(0x05080d, 0.0075);

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

  layout.skylineLayers.forEach((layer, index) => {
    const skyline = createSkyline({
      radius: layer.radius,
      count: layer.count,
      minHeight: layer.minHeight,
      maxHeight: layer.maxHeight,
      color: 0x0d1824,
      emissive: 0x3af7ff,
      opacity: layer.opacity,
      stripCount: layer.stripCount,
      billboardCount: layer.billboardCount,
      billboardColor: index === 0 ? 0xffd26e : index === 1 ? 0xff79c6 : 0x7cf8ff,
    });
    skyline.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity != null) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55 + index * 0.15;
      }
    });
    scene.add(skyline);
  });

  const stadiumMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a1208,
    emissive: 0xff3b1a,
    emissiveIntensity: 1.4,
    metalness: 0.35,
    roughness: 0.35,
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
