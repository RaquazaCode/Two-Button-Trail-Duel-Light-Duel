import * as THREE from "three";
import type { WorldState } from "../sim/types";

export type ChaseConfig = {
  height: number;
  distance: number;
  lookAhead: number;
  shoulder: number;
  smoothing: number;
  rollFactor: number;
  rollMax: number;
  rollSmoothing: number;
};

export const computeCameraRoll = (turnVel: number, rollFactor: number, rollMax: number) => {
  const raw = turnVel * rollFactor;
  if (raw > rollMax) return rollMax;
  if (raw < -rollMax) return -rollMax;
  return raw;
};

export const computeChaseCamera = (args: {
  pos: { x: number; y: number };
  heading: number;
  height: number;
  distance: number;
  lookAhead: number;
  shoulder: number;
}) => {
  const forwardX = Math.cos(args.heading);
  const forwardZ = Math.sin(args.heading);
  const rightX = -Math.sin(args.heading);
  const rightZ = Math.cos(args.heading);

  const position = {
    x: args.pos.x - forwardX * args.distance + rightX * args.shoulder,
    y: args.height,
    z: args.pos.y - forwardZ * args.distance + rightZ * args.shoulder,
  };

  const target = {
    x: args.pos.x + forwardX * args.lookAhead,
    y: args.height * 0.15,
    z: args.pos.y + forwardZ * args.lookAhead,
  };

  return { position, target };
};

export const createChaseCameraController = (
  camera: THREE.PerspectiveCamera,
  config: ChaseConfig
) => {
  const currentPos = new THREE.Vector3();
  const currentTarget = new THREE.Vector3();
  let currentRoll = 0;
  let initialized = false;

  const update = (world: WorldState | null, dt: number) => {
    if (!world) return;
    const player = world.players.find((p) => p.id === "p1") ?? world.players[0];
    if (!player) return;

    const desired = computeChaseCamera({
      pos: player.pos,
      heading: player.heading,
      height: config.height,
      distance: config.distance,
      lookAhead: config.lookAhead,
      shoulder: config.shoulder,
    });

    const desiredPos = new THREE.Vector3(desired.position.x, desired.position.y, desired.position.z);
    const desiredTarget = new THREE.Vector3(desired.target.x, desired.target.y, desired.target.z);
    const desiredRoll = computeCameraRoll(player.turnVel ?? 0, config.rollFactor, config.rollMax);

    if (!initialized) {
      currentPos.copy(desiredPos);
      currentTarget.copy(desiredTarget);
      currentRoll = desiredRoll;
      initialized = true;
    } else {
      const alpha = 1 - Math.exp(-config.smoothing * dt);
      currentPos.lerp(desiredPos, alpha);
      currentTarget.lerp(desiredTarget, alpha);
      const rollAlpha = 1 - Math.exp(-config.rollSmoothing * dt);
      currentRoll += (desiredRoll - currentRoll) * rollAlpha;
    }

    camera.position.copy(currentPos);
    camera.lookAt(currentTarget);
    camera.rotation.z += currentRoll;
  };

  return { update };
};
