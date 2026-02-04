import * as THREE from "three";
import type { PlayerState } from "../sim/types";

export const createBikeRenderer = (scene: THREE.Scene) => {
  const bikes = new Map<string, THREE.Mesh>();
  const geometry = new THREE.BoxGeometry(1.4, 0.6, 2.6);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    emissive: 0x00c8ff,
    emissiveIntensity: 1.3,
    metalness: 0.2,
    roughness: 0.3,
  });

  const ensureBike = (player: PlayerState) => {
    if (bikes.has(player.id)) return bikes.get(player.id)!;
    const mesh = new THREE.Mesh(geometry, material.clone());
    scene.add(mesh);
    bikes.set(player.id, mesh);
    return mesh;
  };

  const update = (players: PlayerState[]) => {
    players.forEach((player) => {
      const mesh = ensureBike(player);
      mesh.visible = player.alive;
      mesh.position.set(player.pos.x, 0.4, player.pos.y);
      mesh.rotation.y = -player.heading;
    });
  };

  return { update };
};
