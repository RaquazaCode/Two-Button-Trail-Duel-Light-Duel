import * as THREE from "three";

type GridArgs = {
  size: number;
  cellSize: number;
  majorEvery: number;
  minorLine: number;
  majorLine: number;
  minorColor: number;
  majorColor: number;
  opacity: number;
};

export const createGridOverlay = (args: GridArgs) => {
  const geometry = new THREE.CircleGeometry(args.size / 2, 160);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uCellSize: { value: args.cellSize },
      uMajorEvery: { value: args.majorEvery },
      uMinorWidth: { value: args.minorLine },
      uMajorWidth: { value: args.majorLine },
      uMinorColor: { value: new THREE.Color(args.minorColor) },
      uMajorColor: { value: new THREE.Color(args.majorColor) },
      uOpacity: { value: args.opacity },
    },
    vertexShader: `
      varying vec2 vWorld;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorld = worldPos.xz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uCellSize;
      uniform float uMajorEvery;
      uniform float uMinorWidth;
      uniform float uMajorWidth;
      uniform vec3 uMinorColor;
      uniform vec3 uMajorColor;
      uniform float uOpacity;
      varying vec2 vWorld;

      float gridLine(vec2 world, float cellSize, float lineWidth) {
        vec2 coord = world / cellSize;
        vec2 dist = abs(fract(coord) - 0.5);
        float d = min(dist.x, dist.y) * cellSize;
        float aa = fwidth(d) * 1.5;
        return 1.0 - smoothstep(lineWidth, lineWidth + aa, d);
      }

      void main() {
        float minor = gridLine(vWorld, uCellSize, uMinorWidth);
        float major = gridLine(vWorld, uCellSize * uMajorEvery, uMajorWidth);
        vec3 color = uMinorColor * minor + uMajorColor * major;
        float alpha = max(minor, major) * uOpacity;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  material.toneMapped = false;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
};
