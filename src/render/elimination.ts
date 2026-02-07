import * as THREE from "three";
import type { PlayerState } from "../sim/types";
import { getPlayerColor } from "./palette";

export const FLASH_DURATION = 0.12;
export const BURST_DURATION = 0.8;
export const SHOCK_DURATION = 0.25;
export const ELIMINATION_SOUND_COOLDOWN = 3.4;

export const shouldPlayEliminationSound = (
  lastPlayedAt: number | null,
  now: number,
  cooldown: number
) => {
  if (lastPlayedAt == null) return true;
  return now - lastPlayedAt >= cooldown;
};

export const shouldCreateEliminationEffect = (
  lastHandledAt: number | undefined,
  eliminatedAt: number | undefined
) => {
  if (eliminatedAt == null) return false;
  return lastHandledAt !== eliminatedAt;
};

export const getFlashIntensity = (elapsed: number) => {
  if (elapsed <= 0) return 1;
  if (elapsed >= FLASH_DURATION) return 0;
  return 1 - elapsed / FLASH_DURATION;
};

export const getShockScale = (elapsed: number) => {
  if (elapsed <= 0) return 1;
  if (elapsed >= SHOCK_DURATION) return 3;
  return 1 + (elapsed / SHOCK_DURATION) * 2;
};

type Shard = {
  direction: THREE.Vector3;
  speed: number;
  spin: number;
  offset: THREE.Vector3;
};

type Effect = {
  id: string;
  startTime: number;
  group: THREE.Group;
  core: THREE.Mesh;
  glow: THREE.Mesh;
  ring: THREE.Mesh;
  shards: THREE.InstancedMesh;
  shardData: Shard[];
  basePos: THREE.Vector3;
};

const createAudio = () => {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
};

const playEliminationSound = (ctx: AudioContext | null) => {
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const now = ctx.currentTime;

  // Keep elimination audio as a single short pulse to avoid click-loop artifacts.
  const pulse = ctx.createOscillator();
  const pulseGain = ctx.createGain();
  pulse.type = "triangle";
  pulse.frequency.setValueAtTime(196, now);
  pulse.frequency.exponentialRampToValueAtTime(110, now + 0.24);
  pulseGain.gain.setValueAtTime(0.0001, now);
  pulseGain.gain.exponentialRampToValueAtTime(0.032, now + 0.03);
  pulseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(600, now + 0.2);

  pulse.connect(filter).connect(pulseGain).connect(ctx.destination);
  pulse.start(now);
  pulse.stop(now + 0.3);
};

const createEffect = (id: string, color: number, position: THREE.Vector3): Effect => {
  const group = new THREE.Group();
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), coreMaterial);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), glowMaterial);
  group.add(core, glow);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 0.75, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  const shardCount = 40;
  const shardGeometry = new THREE.BoxGeometry(0.18, 0.55, 0.1);
  const shardMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const shards = new THREE.InstancedMesh(shardGeometry, shardMaterial, shardCount);
  const shardData: Shard[] = [];
  const temp = new THREE.Vector3();

  for (let i = 0; i < shardCount; i += 1) {
    temp.set(Math.random() - 0.5, Math.random() * 0.6, Math.random() - 0.5).normalize();
    shardData.push({
      direction: temp.clone(),
      speed: 5 + Math.random() * 6,
      spin: (Math.random() - 0.5) * 2,
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.4
      ),
    });
  }
  group.add(shards);

  group.position.copy(position);

  return {
    id,
    startTime: 0,
    group,
    core,
    glow,
    ring,
    shards,
    shardData,
    basePos: new THREE.Vector3(0, 0, 0),
  };
};

export const createEliminationEffects = (scene: THREE.Scene) => {
  const effects = new Map<string, Effect>();
  const handledEliminations = new Map<string, number>();
  const audioContext = createAudio();
  let lastSoundAt: number | null = null;

  const update = (players: PlayerState[], time: number) => {
    players.forEach((player) => {
      if (!shouldCreateEliminationEffect(handledEliminations.get(player.id), player.eliminatedAt)) {
        return;
      }
      if (effects.has(player.id)) return;

      const effect = createEffect(
        player.id,
        getPlayerColor(player.id),
        new THREE.Vector3(player.pos.x, 0.2, player.pos.y)
      );
      effect.startTime = player.eliminatedAt as number;
      effects.set(player.id, effect);
      handledEliminations.set(player.id, player.eliminatedAt as number);
      scene.add(effect.group);
      if (shouldPlayEliminationSound(lastSoundAt, time, ELIMINATION_SOUND_COOLDOWN)) {
        playEliminationSound(audioContext);
        lastSoundAt = time;
      }
    });

    effects.forEach((effect, id) => {
      const elapsed = time - effect.startTime;
      if (elapsed > BURST_DURATION) {
        scene.remove(effect.group);
        effects.delete(id);
        return;
      }

      const flash = getFlashIntensity(elapsed);
      effect.core.material.opacity = flash;
      effect.glow.material.opacity = flash * 0.7;
      effect.core.visible = flash > 0.01;
      effect.glow.visible = flash > 0.01;

      if (elapsed <= SHOCK_DURATION) {
        const scale = getShockScale(elapsed);
        effect.ring.visible = true;
        effect.ring.scale.set(scale, scale, scale);
        (effect.ring.material as THREE.MeshBasicMaterial).opacity = 1 - elapsed / SHOCK_DURATION;
      } else {
        effect.ring.visible = false;
      }

      const burstT = Math.min(1, Math.max(0, elapsed / BURST_DURATION));
      const matrix = new THREE.Matrix4();
      effect.shardData.forEach((shard, index) => {
        const travel = shard.speed * (1 - burstT * 0.6) * burstT;
        const pos = effect.basePos
          .clone()
          .add(shard.direction.clone().multiplyScalar(travel))
          .add(shard.offset);
        const rot = shard.spin * burstT * Math.PI;
        matrix.makeRotationY(rot);
        matrix.setPosition(pos.x, pos.y + 0.4 + burstT * 0.6, pos.z);
        effect.shards.setMatrixAt(index, matrix);
      });
      effect.shards.instanceMatrix.needsUpdate = true;
      (effect.shards.material as THREE.MeshBasicMaterial).opacity = 1 - burstT;
    });
  };

  const reset = () => {
    effects.forEach((effect) => scene.remove(effect.group));
    effects.clear();
    handledEliminations.clear();
    lastSoundAt = null;
  };

  return { update, reset };
};
