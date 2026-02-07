import { createReflectiveFloor } from "../floor";
import * as THREE from "three";

test("createReflectiveFloor configures a reflective material", () => {
  const floor = createReflectiveFloor({
    size: 240,
    roughness: 0.08,
    color: 0x040b12,
  });

  const material = floor.material as THREE.MeshStandardMaterial;
  expect(material.metalness).toBe(1);
  expect(material.roughness).toBeCloseTo(0.08);
  expect(material.envMapIntensity).toBeCloseTo(1);
  expect(typeof material.onBeforeCompile).toBe("function");
});
