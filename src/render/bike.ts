import * as THREE from "three";
import type { PlayerState } from "../sim/types";
import { getPlayerColor } from "./palette";
import { getFlashIntensity } from "./elimination";

const wheelGeometry = new THREE.TorusGeometry(1.45, 0.24, 20, 64);
const wheelHubGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.75, 18);
const bodyGeometry = new THREE.BoxGeometry(5.2, 0.9, 1.4);
const noseGeometry = new THREE.BoxGeometry(1.6, 0.6, 1.0);
const tailGeometry = new THREE.BoxGeometry(1.8, 0.7, 1.1);
const canopyGeometry = new THREE.BoxGeometry(1.3, 0.5, 0.8);
const stripGeometry = new THREE.BoxGeometry(4.4, 0.12, 0.16);

export const BIKE_HEIGHT = 2.4;

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
  wheelFront.position.set(2.7, 0.85, 0);
  group.add(wheelFront);

  const wheelRear = new THREE.Mesh(wheelGeometry, rimMaterial);
  wheelRear.rotation.z = Math.PI / 2;
  wheelRear.position.set(-2.7, 0.85, 0);
  group.add(wheelRear);

  const hubFront = new THREE.Mesh(wheelHubGeometry, bodyMaterial);
  hubFront.rotation.z = Math.PI / 2;
  hubFront.position.set(2.7, 0.85, 0);
  group.add(hubFront);

  const hubRear = new THREE.Mesh(wheelHubGeometry, bodyMaterial);
  hubRear.rotation.z = Math.PI / 2;
  hubRear.position.set(-2.7, 0.85, 0);
  group.add(hubRear);

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0.82, 0);
  group.add(body);

  const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
  nose.position.set(2.55, 0.8, 0);
  group.add(nose);

  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-2.7, 0.82, 0);
  group.add(tail);

  const canopy = new THREE.Mesh(canopyGeometry, bodyMaterial);
  canopy.position.set(0.5, 1.18, 0);
  group.add(canopy);

  const strip = new THREE.Mesh(stripGeometry, accentMaterial);
  strip.position.set(-0.2, 1.08, 0.62);
  group.add(strip);

  const strip2 = new THREE.Mesh(stripGeometry, accentMaterial);
  strip2.position.set(-0.2, 1.08, -0.62);
  group.add(strip2);

  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const material = child.material as THREE.MeshStandardMaterial;
    child.userData.baseEmissive = material.emissiveIntensity ?? 0;
    child.userData.baseEmissiveColor = material.emissive.clone();
  });

  return group;
};

export const createBikeRenderer = (scene: THREE.Scene) => {
  const bikes = new Map<string, THREE.Group>();
  const fadeDuration = 0.2;

  const ensureBike = (player: PlayerState) => {
    if (bikes.has(player.id)) return bikes.get(player.id)!;
    const mesh = createBikeModel(getPlayerColor(player.id));
    scene.add(mesh);
    bikes.set(player.id, mesh);
    return mesh;
  };

  const update = (players: PlayerState[], time: number) => {
    players.forEach((player) => {
      const mesh = ensureBike(player);
      const elapsed = player.eliminatedAt != null ? Math.max(0, time - player.eliminatedAt) : 0;
      const fade = player.alive ? 0 : Math.min(1, elapsed / fadeDuration);
      const flash = player.alive ? 0 : getFlashIntensity(elapsed);
      mesh.visible = player.alive || fade < 1;
      mesh.position.set(player.pos.x, 0.05, player.pos.y);
      mesh.rotation.y = -player.heading;

      mesh.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const material = child.material as THREE.MeshStandardMaterial;
        material.transparent = true;
        const baseEmissive = (child.userData.baseEmissive as number) ?? material.emissiveIntensity ?? 0;
        const alpha = player.alive ? 1 : 1 - fade;
        material.opacity = alpha;
        const baseColor = child.userData.baseEmissiveColor as THREE.Color | undefined;
        if (baseColor) {
          material.emissive.copy(baseColor).lerp(new THREE.Color(0xffffff), flash);
        }
        material.emissiveIntensity = (baseEmissive * alpha) + flash * 2.5;
      });
    });
  };

  const reset = () => {
    bikes.forEach((mesh) => scene.remove(mesh));
    bikes.clear();
  };

  return { update, reset };
};
