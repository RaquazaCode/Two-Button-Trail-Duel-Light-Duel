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
  const baseMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
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

  type RenderedTrailEntry = {
    key: string;
    parts: number;
  };

  let renderedTrailEntries: RenderedTrailEntry[] = [];
  let instanceCount = 0;
  const tempColor = new THREE.Color();
  const readColor = new THREE.Color();
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  const tempScale = new THREE.Vector3(1, 1, 1);
  const tempQuat = new THREE.Quaternion();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const trailKey = (seg: TrailSegment) => `${seg.owner}:${seg.id}`;

  const addSegment = (seg: TrailSegment) => {
    const dx = seg.end.x - seg.start.x;
    const dz = seg.end.y - seg.start.y;
    const length = Math.hypot(dx, dz);
    if (length <= 0.0001) return 0;

    const parts = Math.max(1, Math.ceil(length / MAX_SEGMENT_LENGTH));
    const color = getPlayerColor(seg.owner);
    let partsAdded = 0;

    for (let i = 0; i < parts; i += 1) {
      if (instanceCount >= MAX_TRAIL_INSTANCES) break;

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

      tempColor.setHex(color);
      mesh.setColorAt(instanceCount, tempColor);
      instanceCount += 1;
      partsAdded += 1;
    }

    return partsAdded;
  };

  const markMeshDirty = () => {
    mesh.count = instanceCount;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  };

  const rebuildAll = (trails: TrailSegment[]) => {
    renderedTrailEntries = [];
    instanceCount = 0;
    for (let i = 0; i < trails.length; i += 1) {
      const seg = trails[i];
      renderedTrailEntries.push({
        key: trailKey(seg),
        parts: addSegment(seg),
      });
    }
    markMeshDirty();
  };

  const shiftInstancesLeft = (partsToDrop: number) => {
    if (partsToDrop <= 0) return;
    for (let i = partsToDrop; i < instanceCount; i += 1) {
      mesh.getMatrixAt(i, tempMatrix);
      mesh.setMatrixAt(i - partsToDrop, tempMatrix);
      if (mesh.instanceColor) {
        mesh.getColorAt(i, readColor);
        mesh.setColorAt(i - partsToDrop, readColor);
      }
    }
    instanceCount = Math.max(0, instanceCount - partsToDrop);
  };

  const update = (trails: TrailSegment[]) => {
    if (trails.length === 0) {
      renderedTrailEntries = [];
      instanceCount = 0;
      markMeshDirty();
      return;
    }

    const trailIndexByKey = new Map<string, number>();
    for (let i = 0; i < trails.length; i += 1) {
      trailIndexByKey.set(trailKey(trails[i]), i);
    }

    let droppedTrailCount = 0;
    while (
      droppedTrailCount < renderedTrailEntries.length &&
      !trailIndexByKey.has(renderedTrailEntries[droppedTrailCount].key)
    ) {
      droppedTrailCount += 1;
    }

    if (droppedTrailCount > 0) {
      const droppedParts = renderedTrailEntries
        .slice(0, droppedTrailCount)
        .reduce((sum, entry) => sum + entry.parts, 0);
      shiftInstancesLeft(droppedParts);
      renderedTrailEntries = renderedTrailEntries.slice(droppedTrailCount);
    }

    let orderMismatch = false;
    for (let i = 0; i < renderedTrailEntries.length; i += 1) {
      if (i >= trails.length || renderedTrailEntries[i].key !== trailKey(trails[i])) {
        orderMismatch = true;
        break;
      }
    }

    if (orderMismatch) {
      rebuildAll(trails);
      return;
    }

    for (let i = renderedTrailEntries.length; i < trails.length; i += 1) {
      const seg = trails[i];
      renderedTrailEntries.push({
        key: trailKey(seg),
        parts: addSegment(seg),
      });
    }
    markMeshDirty();
  };

  const reset = () => {
    renderedTrailEntries = [];
    instanceCount = 0;
    markMeshDirty();
  };

  return { update, reset };
};
