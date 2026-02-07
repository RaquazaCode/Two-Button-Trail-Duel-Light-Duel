import * as THREE from "three";
import { createReflectiveFloor } from "./floor";
import { createGridOverlay } from "./grid";
import { computeEnvironmentLayout } from "./environmentLayout";
import { createSkyline } from "./skyline";
import { STADIUM_SETTINGS } from "./stadiumConfig";

export const createEnvironment = (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  arenaSize: number
) => {
  const layout = computeEnvironmentLayout(arenaSize);
  scene.fog = new THREE.FogExp2(0x05080d, 0.006);
  void renderer;

  const floor = createReflectiveFloor({
    size: layout.floorSize,
    roughness: 0.06,
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

  const layerColors = [0x7cf8ff, 0x5fe8ff, 0x5bd3ff, 0x4fb6ff];
  layout.skylineLayers.forEach((layer, index) => {
    const skyline = createSkyline({
      radius: layer.radius,
      count: layer.count,
      minHeight: layer.minHeight,
      maxHeight: layer.maxHeight,
      color: 0x0d1824,
      emissive: layerColors[index % layerColors.length],
      opacity: layer.opacity,
      baseHeight: layer.baseHeight,
    });
    const material = skyline.material as THREE.MeshStandardMaterial;
    if (material.emissiveIntensity != null) {
      material.emissiveIntensity = 0.55 + index * 0.15;
    }
    scene.add(skyline);
  });

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: STADIUM_SETTINGS.baseColor,
    emissive: STADIUM_SETTINGS.baseEmissive,
    emissiveIntensity: STADIUM_SETTINGS.baseIntensity,
    metalness: STADIUM_SETTINGS.metalness,
    roughness: STADIUM_SETTINGS.roughness,
  });

  const topMaterial = new THREE.MeshStandardMaterial({
    color: STADIUM_SETTINGS.topColor,
    emissive: STADIUM_SETTINGS.topEmissive,
    emissiveIntensity: STADIUM_SETTINGS.topIntensity,
    metalness: STADIUM_SETTINGS.metalness,
    roughness: STADIUM_SETTINGS.roughness,
  });

  const lowerHeight = layout.stadiumHeight * 0.6;
  const upperHeight = layout.stadiumHeight * 0.4;

  const lowerBand = new THREE.Mesh(
    new THREE.CylinderGeometry(layout.stadiumRadius, layout.stadiumRadius, lowerHeight, 96, 1, true),
    baseMaterial
  );
  lowerBand.position.y = lowerHeight * 0.5;
  scene.add(lowerBand);

  const upperBand = new THREE.Mesh(
    new THREE.CylinderGeometry(layout.stadiumRadius, layout.stadiumRadius, upperHeight, 96, 1, true),
    topMaterial
  );
  upperBand.position.y = lowerHeight + upperHeight * 0.5;
  scene.add(upperBand);

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: STADIUM_SETTINGS.topColor,
    emissive: STADIUM_SETTINGS.rimEmissive,
    emissiveIntensity: STADIUM_SETTINGS.rimIntensity,
    metalness: STADIUM_SETTINGS.metalness,
    roughness: STADIUM_SETTINGS.roughness,
  });

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(layout.stadiumRadius, layout.stadiumTube * 0.25, 16, 96),
    rimMaterial
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = layout.stadiumHeight;
  scene.add(rim);

  const update = (dtMs: number) => {
    void dtMs;
  };

  return { update };
};
