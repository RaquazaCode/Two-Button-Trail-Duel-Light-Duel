import * as THREE from "three";
import type { PlayerState, TrailSegment } from "../sim/types";
import { getPlayerColor } from "./palette";
import { CONFIG } from "../sim/config";
import { BIKE_HEIGHT } from "./bike";

export const createTrailRenderer = (scene: THREE.Scene) => {
  const segments = new Map<string, THREE.Mesh>();
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  const ownerMaterials = new Map<string, THREE.MeshStandardMaterial>();
  const height = BIKE_HEIGHT * 0.7;
  const baseGeometry = new THREE.BoxGeometry(1, height, CONFIG.trailWidth);
  const baseEmissive = 1.35;

  const getMaterial = (color: number) => {
    const existing = materials.get(color);
    if (existing) return existing;
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: baseEmissive,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    material.toneMapped = false;
    material.userData.baseEmissive = baseEmissive;
    materials.set(color, material);
    return material;
  };

  const addSegment = (seg: TrailSegment) => {
    const dx = seg.end.x - seg.start.x;
    const dz = seg.end.y - seg.start.y;
    const length = Math.hypot(dx, dz);
    if (length <= 0.0001) return;
    const maxLength = 8;
    const parts = Math.max(1, Math.ceil(length / maxLength));

    for (let i = 0; i < parts; i += 1) {
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

      const key = `${seg.owner}-${seg.id}-${i}`;
      if (segments.has(key)) continue;

      const material = getMaterial(getPlayerColor(seg.owner));
      ownerMaterials.set(seg.owner, material);
      const mesh = new THREE.Mesh(baseGeometry, material);
      const midX = (startX + endX) / 2;
      const midZ = (startZ + endZ) / 2;

      mesh.position.set(midX, height * 0.5 + 0.02, midZ);
      mesh.rotation.y = -Math.atan2(segDz, segDx);
      mesh.scale.set(segLength, 1, 1);

      scene.add(mesh);
      segments.set(key, mesh);
    }
  };

  const applyTrailPulse = (players?: PlayerState[], time = 0) => {
    if (!players) return;
    players.forEach((player) => {
      const material = ownerMaterials.get(player.id);
      if (!material) return;
      const base = (material.userData.baseEmissive as number) ?? baseEmissive;
      if (player.eliminatedAt == null) {
        material.emissiveIntensity = base;
        return;
      }
      const elapsed = Math.max(0, time - player.eliminatedAt);
      if (elapsed < 0.15) {
        material.emissiveIntensity = base * 2.5;
        return;
      }
      material.emissiveIntensity = base * 0.85;
    });
  };

  const update = (trails: TrailSegment[], players?: PlayerState[], time?: number) => {
    trails.forEach(addSegment);
    applyTrailPulse(players, time ?? 0);
  };

  const reset = () => {
    segments.forEach((mesh) => scene.remove(mesh));
    segments.clear();
    ownerMaterials.clear();
  };

  return { update, reset };
};
