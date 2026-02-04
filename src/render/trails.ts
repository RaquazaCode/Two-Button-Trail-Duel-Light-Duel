import * as THREE from "three";
import type { TrailSegment } from "../sim/types";
import { getPlayerColor } from "./palette";

export const createTrailRenderer = (scene: THREE.Scene) => {
  const segments = new Map<number, THREE.Mesh>();
  const materials = new Map<number, THREE.MeshStandardMaterial>();

  const getMaterial = (color: number) => {
    const existing = materials.get(color);
    if (existing) return existing;
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.35,
      metalness: 0.1,
      roughness: 0.2,
    });
    materials.set(color, material);
    return material;
  };

  const addSegment = (seg: TrailSegment) => {
    if (segments.has(seg.id)) return;
    const dx = seg.end.x - seg.start.x;
    const dz = seg.end.y - seg.start.y;
    const length = Math.hypot(dx, dz);
    if (length <= 0.0001) return;

    const geometry = new THREE.BoxGeometry(length, 0.12, 0.7);
    const mesh = new THREE.Mesh(geometry, getMaterial(getPlayerColor(seg.owner)));
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

  const reset = () => {
    segments.forEach((mesh) => scene.remove(mesh));
    segments.clear();
  };

  return { update, reset };
};
