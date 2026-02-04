import * as THREE from "three";
import type { PlayerState } from "../sim/types";

const baseGeometry = new THREE.BoxGeometry(0.7, 0.45, 3.2);
const noseGeometry = new THREE.BoxGeometry(0.5, 0.32, 1.1);
const tailGeometry = new THREE.BoxGeometry(0.6, 0.38, 0.8);
const spineGeometry = new THREE.BoxGeometry(0.18, 0.22, 2.4);

export const createBikeModel = (color: number) => {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.9,
    metalness: 0.2,
    roughness: 0.28,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8fbff,
    emissive: 0x7cf8ff,
    emissiveIntensity: 1.6,
    metalness: 0.1,
    roughness: 0.2,
  });

  const body = new THREE.Mesh(baseGeometry, bodyMaterial);
  body.position.y = 0.28;
  group.add(body);

  const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
  nose.position.set(0, 0.3, 2.05);
  group.add(nose);

  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(0, 0.25, -1.8);
  group.add(tail);

  const spine = new THREE.Mesh(spineGeometry, accentMaterial);
  spine.position.set(0, 0.58, 0.2);
  group.add(spine);

  return group;
};

export const createBikeRenderer = (scene: THREE.Scene) => {
  const bikes = new Map<string, THREE.Group>();
  const baseColor = 0x00f5ff;

  const ensureBike = (player: PlayerState) => {
    if (bikes.has(player.id)) return bikes.get(player.id)!;
    const mesh = createBikeModel(baseColor);
    scene.add(mesh);
    bikes.set(player.id, mesh);
    return mesh;
  };

  const update = (players: PlayerState[]) => {
    players.forEach((player) => {
      const mesh = ensureBike(player);
      mesh.visible = player.alive;
      mesh.position.set(player.pos.x, 0.2, player.pos.y);
      mesh.rotation.y = -player.heading;
    });
  };

  return { update };
};
