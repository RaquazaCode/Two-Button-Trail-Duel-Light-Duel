import * as THREE from "three";
import type { TrailSegment } from "../sim/types";
import { getPlayerColor } from "./palette";
import { CONFIG } from "../sim/config";
import { BIKE_HEIGHT } from "./bike";

const MAX_TRAIL_INSTANCES = 90000;
const MAX_SEGMENT_LENGTH = 8;

export const createTrailRenderer = (scene: THREE.Scene) => {
  const height = BIKE_HEIGHT * 0.7;
  const baseGeometry = new THREE.BoxGeometry(1, height, CONFIG.trailWidth);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.35,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
  baseMaterial.toneMapped = false;

  const mesh = new THREE.InstancedMesh(baseGeometry, baseMaterial, MAX_TRAIL_INSTANCES);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.count = 0;
  scene.add(mesh);

  let renderedTrailCount = 0;
  let instanceCount = 0;
  const tempColor = new THREE.Color();
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  const tempScale = new THREE.Vector3(1, 1, 1);
  const tempQuat = new THREE.Quaternion();
  const yAxis = new THREE.Vector3(0, 1, 0);

  const addSegment = (seg: TrailSegment) => {
    const dx = seg.end.x - seg.start.x;
    const dz = seg.end.y - seg.start.y;
    const length = Math.hypot(dx, dz);
    if (length <= 0.0001) return;

    const parts = Math.max(1, Math.ceil(length / MAX_SEGMENT_LENGTH));
    const color = getPlayerColor(seg.owner);

    for (let i = 0; i < parts; i += 1) {
      if (instanceCount >= MAX_TRAIL_INSTANCES) return;

      const t0 = i / parts;
      const t1 = (i + 1) / parts;
      const startX = seg.start.x + dx * t0;
      const startZ = seg.start.y + dz * t0;
      const endX = seg.start.x + dx * t1;
      const endZ = seg.start.y + dz * t1;
      const segDx = endX - startX;
      const segDz = endZ - startZ;
      const segLength = Math.hypot(segDx, segDz);
      if (segLength <= 0.0001) continue;

      const midX = (startX + endX) / 2;
      const midZ = (startZ + endZ) / 2;
      tempPosition.set(midX, height * 0.5 + 0.02, midZ);
      tempQuat.setFromAxisAngle(yAxis, -Math.atan2(segDz, segDx));
      tempScale.set(segLength, 1, 1);
      tempMatrix.compose(tempPosition, tempQuat, tempScale);
      mesh.setMatrixAt(instanceCount, tempMatrix);

      tempColor.setHex(color).multiplyScalar(1.2);
      mesh.setColorAt(instanceCount, tempColor);
      instanceCount += 1;
    }
  };

  const update = (trails: TrailSegment[]) => {
    if (renderedTrailCount > trails.length) {
      renderedTrailCount = 0;
      instanceCount = 0;
      mesh.count = 0;
    }

    if (renderedTrailCount >= trails.length) return;
    for (let i = renderedTrailCount; i < trails.length; i += 1) {
      addSegment(trails[i]);
    }
    renderedTrailCount = trails.length;
    mesh.count = instanceCount;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  };

  const reset = () => {
    renderedTrailCount = 0;
    instanceCount = 0;
    mesh.count = 0;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  };

  return { update, reset };
};
