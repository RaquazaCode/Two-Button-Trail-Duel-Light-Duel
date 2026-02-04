import * as THREE from "three";

type SkylineArgs = {
  radius: number;
  count: number;
  minHeight: number;
  maxHeight: number;
  color: number;
  emissive: number;
  opacity?: number;
  stripCount?: number;
  billboardCount?: number;
  billboardColor?: number;
};

const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const createSkyline = (args: SkylineArgs) => {
  const group = new THREE.Group();
  const stripCount = args.stripCount ?? 2;
  const billboardCount = args.billboardCount ?? 1;
  const billboardColor = args.billboardColor ?? args.emissive;

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
      transparent: args.opacity !== undefined,
      opacity: args.opacity ?? 1,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xeafcff,
      emissive: args.emissive,
      emissiveIntensity: 1.35,
      metalness: 0.1,
      roughness: 0.3,
      transparent: args.opacity !== undefined,
      opacity: args.opacity ?? 1,
    });

    const billboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b1018,
      emissive: billboardColor,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.25,
      side: THREE.DoubleSide,
      transparent: args.opacity !== undefined,
      opacity: args.opacity ?? 1,
    });

    const building = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    base.position.y = height / 2;
    building.add(base);

    for (let s = 0; s < stripCount; s += 1) {
      const stripWidth = Math.max(0.4, width * 0.08);
      const stripDepth = depth * 1.02;
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(stripWidth, height * 0.9, stripDepth),
        accentMaterial
      );
      const offset = (s / Math.max(1, stripCount - 1)) * 0.8 - 0.4;
      strip.position.set(width * 0.35 * offset, height * 0.45, 0);
      building.add(strip);
    }

    for (let b = 0; b < billboardCount; b += 1) {
      const boardWidth = Math.max(1.2, width * 0.5);
      const boardHeight = Math.max(0.6, height * 0.12);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(boardWidth, boardHeight), billboardMaterial);
      const side = b % 2 === 0 ? 1 : -1;
      board.position.set(0, height * (0.4 + b * 0.15), (depth * 0.55) * side);
      board.rotation.y = Math.PI / 2;
      building.add(board);
    }

    building.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(building);
  }

  return group;
};
