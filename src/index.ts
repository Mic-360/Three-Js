// @ts-nocheck
import { Controller } from "./controls";
import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  AnimationMixer,
  AxesHelper,
  CubeTextureLoader,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Object3D,
} from "three";
import { DirectionalLight, AmbientLight, Clock } from "three";
import { OrbitControls } from "@three-ts/orbit-controls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import { GUI } from "lil-gui";
import "./styles.css";
import { Vec3 } from "cannon-es";
import CannonDebugger from "cannon-es-debugger";


const world = new CANNON.World();
const scene = new Scene();
const cannonDebugger = CannonDebugger(scene, world, {
  color: 0xffff,
});
const axesHelper = new AxesHelper(15);
scene.add(axesHelper);
scene.background = new Color(0xa8def0);

/**
 * Debug
 */
const gui: any = new GUI();
const debugObject: any = {};
const objectsToUpdate: any = [];

//
//  variables for Debug
//
//

// let Xaxis = (Math.random() - 0.5) * 3;
// let Yaxis = 3;
// let Zaxis = (Math.random() - 0.5) * 3;

// debugObject.createBox = () => {
//   createChar(Math.random(), Math.random(), Math.random(), {
//     x: Xaxis,
//     y: Yaxis,
//     z: Zaxis,
//   });
// };
gui.add(debugObject, "createChar");

// Reset
// debugObject.reset = () => {
//   for (const object of objectsToUpdate) {
//     // Remove body
//     // object.body.removeEventListener('collide', playHitSound)
//     world.removeBody(object.body);

//     // Remove mesh
//     scene.remove(object.mesh);
//   }
// };
// gui.add(debugObject, "reset");

/**
 * Textures
 */
// const textureLoader = new TextureLoader();
const cubeTextureLoader = new CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

// /WALLS

//north Wall
const wallN = new Mesh(
  new BoxGeometry(50, 10, 0.1),
  new MeshStandardMaterial({
    color: 0x00ff,
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
wallN.position.set(-25, 5, 0);
wallN.receiveShadow = true;
wallN.rotation.y = Math.PI * 0.5;
scene.add(wallN);
//physics
const wallNShape = new CANNON.Box(new CANNON.Vec3(25, 5, 0.1));
const wallNBody = new CANNON.Body();
wallNBody.mass = 0;
wallNBody.addShape(wallNShape);
wallNBody.position.set(-25, 5, 0);
wallNBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI * 0.5);
world.addBody(wallNBody);

//south wall
const wallS = new Mesh(
  new BoxGeometry(50, 10, 0.1),
  new MeshStandardMaterial({
    color: 0x00ff00,
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
wallS.position.set(25, 5, 0);
wallS.receiveShadow = true;
wallS.rotation.y = Math.PI * 0.5;
scene.add(wallS);

//physics
const wallSShape = new CANNON.Box(new CANNON.Vec3(25, 5, 0.1));
const wallSBody = new CANNON.Body();
wallSBody.mass = 0;
wallSBody.position.set(25, 5, 0);
wallSBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI * 0.5);
wallSBody.addShape(wallSShape);
world.addBody(wallSBody);

//east wall
const wallE = new Mesh(
  new BoxGeometry(10, 50, 0.1),
  new MeshStandardMaterial({
    color: 0xf0ff0f,
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
wallE.position.set(0, 5, -25);
wallE.receiveShadow = true;
wallE.rotation.z = Math.PI * 0.5;
scene.add(wallE);

//physics
const wallEShape = new CANNON.Box(new CANNON.Vec3(5, 25, 0.1));
const wallEBody = new CANNON.Body();
wallEBody.mass = 0.5;
wallEBody.position.set(0, 5, -25);
wallEBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI * 0.5);
wallEBody.addShape(wallEShape);
world.addBody(wallEBody);

/**
 * Floor
 */
const floor = new Mesh(
  new BoxGeometry(50, 50, 0.01),
  new MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Floor END ----------------------
 */

/*
 * Shapes and Materials INIT --------------------
 */

let characterControls: Controller;

let Avatar: string = "Soldier.glb"; //?Dynamic character selection

let character = new GLTFLoader().load(Avatar, function (gltf) {
  const model = gltf.scene;
  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });
  gltf.scene.scale.set(3, 3, 3), scene.add(model);

  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });

  characterControls = new Controller(
    model,
    mixer,
    animationsMap,
    orbit as any,
    camera,
    "Idle"
  );
});

// Create box

const createChar = (
  position: Vector3 | CANNON.Vec3
) => {
  // Three.js mesh
  scene.add(character as unknown as Object3D<Event>);

  // Cannon.js body
  const body = character as CANNON.Body;
  // body.position.copy(position as Vec3);
  // world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ character, body });
};

createChar(new Vector3(0, 0, 0));

/*
 * Shapes End
 */

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(15, 12, 5);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.minDistance = 2;
orbit.enableDamping = true;
orbit.maxDistance = 30;
orbit.enablePan = false;
orbit.maxPolarAngle = Math.PI / 2 - 0.05;
orbit.update();

light();

const keysPressed = {};
document.addEventListener(
  "keydown",
  (event) => {
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    } else {
      (keysPressed as any)[event.key.toLowerCase()] = true;
    }
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    (keysPressed as any)[event.key.toLowerCase()] = false;
  },
  false
);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Clock();
// let oldElapsedTime = 0;

function animate() {
  let mixerUpdateDelta = clock.getDelta();
  if (characterControls) {
    characterControls.update(mixerUpdateDelta, keysPressed);
  }
  orbit.update();

  // const elapsedTime = clock.getElapsedTime();
  // const deltaTime = elapsedTime - oldElapsedTime;
  // oldElapsedTime = elapsedTime;

  // Update controls
  controls.update();

  // Render
  cannonDebugger.update();
  renderer.render(scene, camera);

  // Update physics
  // world.step(1 / 60, deltaTime, 3);

  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

function light() {
  scene.add(new AmbientLight(0xffffff, 0.7));

  const dirLight = new DirectionalLight(0xffffff, 1);
  dirLight.position.set(-60, 100, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  scene.add(dirLight);
}
