import * as THREE from "three";
import type { PlayerState } from "../sim/types";
import { getPlayerColor } from "./palette";

const wheelGeometry = new THREE.TorusGeometry(0.95, 0.12, 16, 48);
const wheelHubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12);
const bodyGeometry = new THREE.BoxGeometry(3.6, 0.6, 1.2);
const noseGeometry = new THREE.BoxGeometry(1.2, 0.45, 0.9);
const tailGeometry = new THREE.BoxGeometry(1.3, 0.55, 1.1);
const canopyGeometry = new THREE.BoxGeometry(1.1, 0.4, 0.7);
const stripGeometry = new THREE.BoxGeometry(2.6, 0.12, 0.14);

export const createBikeModel = (color: number) => {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1018,
    emissive: color,
    emissiveIntensity: 0.55,
    metalness: 0.25,
    roughness: 0.3,
  });
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1018,
    emissive: color,
    emissiveIntensity: 1.6,
    metalness: 0.3,
    roughness: 0.2,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xeafcff,
    emissive: color,
    emissiveIntensity: 1.35,
    metalness: 0.1,
    roughness: 0.15,
  });

  const wheelFront = new THREE.Mesh(wheelGeometry, rimMaterial);
  wheelFront.rotation.z = Math.PI / 2;
  wheelFront.position.set(1.75, 0.6, 0);
  group.add(wheelFront);

  const wheelRear = new THREE.Mesh(wheelGeometry, rimMaterial);
  wheelRear.rotation.z = Math.PI / 2;
  wheelRear.position.set(-1.75, 0.6, 0);
  group.add(wheelRear);

  const hubFront = new THREE.Mesh(wheelHubGeometry, bodyMaterial);
  hubFront.rotation.z = Math.PI / 2;
  hubFront.position.set(1.75, 0.6, 0);
  group.add(hubFront);

  const hubRear = new THREE.Mesh(wheelHubGeometry, bodyMaterial);
  hubRear.rotation.z = Math.PI / 2;
  hubRear.position.set(-1.75, 0.6, 0);
  group.add(hubRear);

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0.55, 0);
  group.add(body);

  const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
  nose.position.set(1.65, 0.58, 0);
  group.add(nose);

  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-1.65, 0.58, 0);
  group.add(tail);

  const canopy = new THREE.Mesh(canopyGeometry, bodyMaterial);
  canopy.position.set(0.3, 0.92, 0);
  group.add(canopy);

  const strip = new THREE.Mesh(stripGeometry, accentMaterial);
  strip.position.set(-0.1, 0.84, 0.45);
  group.add(strip);

  const strip2 = new THREE.Mesh(stripGeometry, accentMaterial);
  strip2.position.set(-0.1, 0.84, -0.45);
  group.add(strip2);

  return group;
};

export const createBikeRenderer = (scene: THREE.Scene) => {
  const bikes = new Map<string, THREE.Group>();

  const ensureBike = (player: PlayerState) => {
    if (bikes.has(player.id)) return bikes.get(player.id)!;
    const mesh = createBikeModel(getPlayerColor(player.id));
    scene.add(mesh);
    bikes.set(player.id, mesh);
    return mesh;
  };

  const update = (players: PlayerState[]) => {
    players.forEach((player) => {
      const mesh = ensureBike(player);
      mesh.visible = player.alive;
      mesh.position.set(player.pos.x, 0.05, player.pos.y);
      mesh.rotation.y = -player.heading;
    });
  };

  const reset = () => {
    bikes.forEach((mesh) => scene.remove(mesh));
    bikes.clear();
  };

  return { update, reset };
};
