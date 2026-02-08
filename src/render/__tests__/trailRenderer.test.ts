import * as THREE from "three";
import { vec2 } from "../../sim/math";
import { createTrailRenderer } from "../trails";
import { getPlayerColor } from "../palette";
import { CONFIG } from "../../sim/config";
import { BIKE_HEIGHT } from "../bike";

const getTrailMesh = (scene: THREE.Scene) => {
  const mesh = scene.children.find((child) => child instanceof THREE.InstancedMesh);
  if (!mesh) throw new Error("Trail instanced mesh not found");
  return mesh as THREE.InstancedMesh;
};

test("trail renderer appends instances and can reset", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 1,
      owner: "b1",
      start: vec2(0, 0),
      end: vec2(2, 0),
      createdAt: 0,
      solidAt: 0,
    },
    {
      id: 1,
      owner: "b2",
      start: vec2(0, 1),
      end: vec2(2, 1),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  const mesh = getTrailMesh(scene);
  expect(mesh.count).toBe(2);
  const c0 = new THREE.Color();
  const c1 = new THREE.Color();
  mesh.getColorAt(0, c0);
  mesh.getColorAt(1, c1);
  expect(c0.getHex()).not.toBe(c1.getHex());

  renderer.reset();
  expect(mesh.count).toBe(0);
});

test("trail renderer splits long segments into visible pieces", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 9,
      owner: "p1",
      start: vec2(0, 0),
      end: vec2(100, 0),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  const mesh = getTrailMesh(scene);
  expect(mesh.count).toBeGreaterThan(1);
  expect(mesh.count).toBeLessThanOrEqual(13);
});

test("trail renderer uses configured width and height", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 2,
      owner: "p1",
      start: vec2(0, 0),
      end: vec2(2, 0),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  const mesh = getTrailMesh(scene);
  const geometry = mesh.geometry as THREE.BoxGeometry;
  expect(geometry.parameters.depth).toBeCloseTo(CONFIG.trailWidth);
  expect(geometry.parameters.height).toBeCloseTo(BIKE_HEIGHT * 1.35);

  const matrix = new THREE.Matrix4();
  mesh.getMatrixAt(0, matrix);
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, rotation, scale);
  expect(scale.x).toBeCloseTo(2);
});

test("trail renderer assigns expected owner color tint", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 5,
      owner: "b1",
      start: vec2(0, 0),
      end: vec2(2, 0),
      createdAt: 0,
      solidAt: 0,
    },
  ]);

  const mesh = getTrailMesh(scene);
  const color = new THREE.Color();
  mesh.getColorAt(0, color);
  const expected = new THREE.Color(getPlayerColor("b1"));
  expect(Math.abs(color.r - expected.r)).toBeLessThan(0.0001);
  expect(Math.abs(color.g - expected.g)).toBeLessThan(0.0001);
  expect(Math.abs(color.b - expected.b)).toBeLessThan(0.0001);
});

test("trail renderer uses unlit material so per-instance owner colors stay distinct", () => {
  const scene = new THREE.Scene();
  createTrailRenderer(scene);
  const mesh = getTrailMesh(scene);
  expect(mesh.material).toBeInstanceOf(THREE.MeshBasicMaterial);
  const material = mesh.material as THREE.MeshBasicMaterial;
  expect(material.vertexColors).toBe(true);
  expect(material.toneMapped).toBe(false);
  expect(material.fog).toBe(false);
});

test("trail renderer keeps sync when trail window shifts at constant length", () => {
  const scene = new THREE.Scene();
  const renderer = createTrailRenderer(scene);
  renderer.update([
    {
      id: 1,
      owner: "b1",
      start: vec2(0, 0),
      end: vec2(2, 0),
      createdAt: 0,
      solidAt: 0,
    },
    {
      id: 2,
      owner: "b1",
      start: vec2(2, 0),
      end: vec2(4, 0),
      createdAt: 0.1,
      solidAt: 0.1,
    },
  ]);

  renderer.update([
    {
      id: 2,
      owner: "b2",
      start: vec2(2, 0),
      end: vec2(4, 0),
      createdAt: 0.1,
      solidAt: 0.1,
    },
    {
      id: 3,
      owner: "b2",
      start: vec2(4, 0),
      end: vec2(6, 0),
      createdAt: 0.2,
      solidAt: 0.2,
    },
  ]);

  const mesh = getTrailMesh(scene);
  const color = new THREE.Color();
  mesh.getColorAt(0, color);
  const expected = new THREE.Color(getPlayerColor("b2"));
  expect(Math.abs(color.r - expected.r)).toBeLessThan(0.0001);
  expect(Math.abs(color.g - expected.g)).toBeLessThan(0.0001);
  expect(Math.abs(color.b - expected.b)).toBeLessThan(0.0001);
});
