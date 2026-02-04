import * as THREE from "three";
import { createEnvironment } from "./environment";

export const createScene = (container: HTMLElement) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080d);

  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    500
  );
  camera.position.set(0, 120, 80);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0x66ccff, 0x0b1016, 0.9);
  const key = new THREE.DirectionalLight(0xb7e6ff, 0.85);
  key.position.set(40, 80, 30);
  scene.add(ambient, key);

  const environment = createEnvironment(scene, renderer);

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  };

  return { scene, camera, renderer, resize, environment };
};
