import * as THREE from "three";

type SkylineArgs = {
  radius: number;
  count: number;
  minHeight: number;
  maxHeight: number;
  color: number;
  emissive: number;
};

const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const createSkyline = (args: SkylineArgs) => {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(8, 1, 8);

  for (let i = 0; i < args.count; i += 1) {
    const angle = (i / args.count) * Math.PI * 2;
    const jitter = (noise(i + 1) - 0.5) * 18;
    const radius = args.radius + jitter;
    const height = args.minHeight + noise(i + 7) * (args.maxHeight - args.minHeight);

    const material = new THREE.MeshStandardMaterial({
      color: args.color,
      emissive: args.emissive,
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
    mesh.scale.y = height;
    group.add(mesh);
  }

  return group;
};
