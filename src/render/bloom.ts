import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BLOOM_SETTINGS } from "./bloomConfig";

export const createBloomComposer = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) => {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(renderer.domElement.width, renderer.domElement.height),
    BLOOM_SETTINGS.strength,
    BLOOM_SETTINGS.radius,
    BLOOM_SETTINGS.threshold
  );
  composer.addPass(bloomPass);

  const resize = (width: number, height: number) => {
    composer.setSize(width, height);
    bloomPass.setSize(width, height);
  };

  return { composer, resize };
};
