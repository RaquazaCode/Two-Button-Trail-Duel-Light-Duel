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

  for (let i = 0; i < args.count; i += 1) {
    const angle = (i / args.count) * Math.PI * 2;
    const jitter = (noise(i + 1) - 0.5) * 18;
    const radius = args.radius + jitter;
    const height = args.minHeight + noise(i + 7) * (args.maxHeight - args.minHeight);
    const width = 6 + noise(i + 11) * 8;
    const depth = 6 + noise(i + 17) * 8;

    const material = new THREE.MeshStandardMaterial({
      color: args.color,
      emissive: args.emissive,
      emissiveIntensity: 0.2,
      metalness: 0.2,
      roughness: 0.7,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xeafcff,
      emissive: args.emissive,
      emissiveIntensity: 1.15,
      metalness: 0.1,
      roughness: 0.3,
    });

    const building = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    base.position.y = height / 2;
    building.add(base);

    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(0.6, width * 0.12), height * 0.9, depth * 1.02),
      accentMaterial
    );
    strip.position.set(width * 0.32, height * 0.45, 0);
    building.add(strip);

    building.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(building);
  }

  return group;
};
