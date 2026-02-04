import * as THREE from "three";
import type { TrailSegment } from "../sim/types";
import { getPlayerColor } from "./palette";
import { CONFIG } from "../sim/config";

export const createTrailRenderer = (scene: THREE.Scene) => {
  const segments = new Map<string, THREE.Mesh>();
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  const height = Math.max(0.08, CONFIG.trailWidth * 0.2);
  const baseGeometry = new THREE.BoxGeometry(1, height, CONFIG.trailWidth);

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
    const key = `${seg.owner}-${seg.id}`;
    if (segments.has(key)) return;
    const dx = seg.end.x - seg.start.x;
    const dz = seg.end.y - seg.start.y;
    const length = Math.hypot(dx, dz);
    if (length > 8) return;
    if (length <= 0.0001) return;

    const mesh = new THREE.Mesh(baseGeometry, getMaterial(getPlayerColor(seg.owner)));
    const midX = (seg.start.x + seg.end.x) / 2;
    const midZ = (seg.start.y + seg.end.y) / 2;

    mesh.position.set(midX, 0.05, midZ);
    mesh.rotation.y = -Math.atan2(dz, dx);
    mesh.scale.set(length, 1, 1);

    scene.add(mesh);
    segments.set(key, mesh);
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
