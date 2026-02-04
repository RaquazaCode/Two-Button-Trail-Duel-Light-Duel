import * as THREE from "three";
import { createReflectiveFloor } from "../floor";

test("createReflectiveFloor configures a reflective material", () => {
  const envMap = new THREE.Texture();
  const floor = createReflectiveFloor({
    size: 240,
    envMap,
    roughness: 0.08,
    envMapIntensity: 1.1,
    color: 0x040b12,
  });

  const material = floor.material as THREE.MeshStandardMaterial;
  expect(material.metalness).toBe(1);
  expect(material.roughness).toBeCloseTo(0.08);
  expect(material.envMapIntensity).toBeCloseTo(1.1);
  expect(typeof material.onBeforeCompile).toBe("function");
});
