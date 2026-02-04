import * as THREE from "three";
import type { TrailSegment } from "../sim/types";

export const createTrailRenderer = (scene: THREE.Scene) => {
  const segments = new Map<number, THREE.Mesh>();
  const material = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    emissive: 0x00b7ff,
    emissiveIntensity: 1.6,
    metalness: 0.1,
    roughness: 0.2,
  });

  const addSegment = (seg: TrailSegment) => {
    if (segments.has(seg.id)) return;
    const dx = seg.end.x - seg.start.x;
    const dz = seg.end.y - seg.start.y;
    const length = Math.hypot(dx, dz);
    if (length <= 0.0001) return;

    const geometry = new THREE.BoxGeometry(length, 0.1, 0.6);
    const mesh = new THREE.Mesh(geometry, material.clone());
    const midX = (seg.start.x + seg.end.x) / 2;
    const midZ = (seg.start.y + seg.end.y) / 2;

    mesh.position.set(midX, 0.05, midZ);
    mesh.rotation.y = -Math.atan2(dz, dx);

    scene.add(mesh);
    segments.set(seg.id, mesh);
  };

  const update = (trails: TrailSegment[]) => {
    trails.forEach(addSegment);
  };

  return { update };
};
