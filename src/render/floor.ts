import * as THREE from "three";

type FloorArgs = {
  size: number;
  envMap: THREE.Texture;
  roughness: number;
  envMapIntensity: number;
  color: number;
};

export const createReflectiveFloor = (args: FloorArgs) => {
  const geometry = new THREE.CircleGeometry(args.size / 2, 180);
  const material = new THREE.MeshStandardMaterial({
    color: args.color,
    metalness: 1,
    roughness: args.roughness,
    envMap: args.envMap,
    envMapIntensity: args.envMapIntensity,
  });

  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <envmap_fragment>",
      `#include <envmap_fragment>\n        float fresnel = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);\n        outgoingLight += envMapColor * fresnel * 0.35;`
    );
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
};
