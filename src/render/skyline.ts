import * as THREE from "three";

type SkylineArgs = {
  radius: number;
  count: number;
  minHeight: number;
  maxHeight: number;
  color: number;
  emissive: number;
  opacity?: number;
  baseHeight?: number;
};

const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const createSkyline = (args: SkylineArgs) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: args.color,
    emissive: args.emissive,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.7,
    transparent: args.opacity !== undefined,
    opacity: args.opacity ?? 1,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uStripeColor = { value: new THREE.Color(args.emissive) };
    shader.uniforms.uStripeIntensity = { value: 0.55 };
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>\nvarying vec3 vWorldPos;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>\n vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>\nuniform vec3 uStripeColor;\nuniform float uStripeIntensity;\nvarying vec3 vWorldPos;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>\n float stripe = step(0.86, abs(sin(vWorldPos.y * 0.22 + (vWorldPos.x + vWorldPos.z) * 0.02)));\n totalEmissiveRadiance += uStripeColor * stripe * uStripeIntensity;`
    );
  };

  const mesh = new THREE.InstancedMesh(geometry, material, args.count);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const baseHeight = args.baseHeight ?? 0;

  for (let i = 0; i < args.count; i += 1) {
    const angle = (i / args.count) * Math.PI * 2;
    const jitter = (noise(i + 1) - 0.5) * 18;
    const radius = args.radius + jitter;
    const height = args.minHeight + noise(i + 7) * (args.maxHeight - args.minHeight);
    const width = 6 + noise(i + 11) * 8;
    const depth = 6 + noise(i + 17) * 8;

    position.set(Math.cos(angle) * radius, baseHeight + height * 0.5, Math.sin(angle) * radius);
    rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
    scale.set(width, height, depth);
    matrix.compose(position, rotation, scale);
    mesh.setMatrixAt(i, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  return mesh;
};
