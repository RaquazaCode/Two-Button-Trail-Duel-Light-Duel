import * as THREE from "three";
import { createEnvironment } from "./environment";

export type SceneOptions = {
  arenaSize: number;
};

export const createScene = (container: HTMLElement, options: SceneOptions) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080d);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    900
  );
  camera.position.set(0, 70, 95);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xb9f2ff, 0x121820, 1.35);
  const key = new THREE.DirectionalLight(0xe6fbff, 1.25);
  key.position.set(55, 95, 55);
  scene.add(ambient, key);

  const environment = createEnvironment(scene, renderer, options.arenaSize);

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  };

  return { scene, camera, renderer, resize, environment };
};
