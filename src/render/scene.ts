import * as THREE from "three";

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

  const grid = new THREE.GridHelper(100, 20, 0x00f5ff, 0x0d2a36);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.8;
  scene.add(grid);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
      color: 0x061018,
      metalness: 0.2,
      roughness: 0.4,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  const ambient = new THREE.AmbientLight(0x66ccff, 0.6);
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(40, 80, 20);
  scene.add(ambient, key);

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  };

  return { scene, camera, renderer, resize };
};
