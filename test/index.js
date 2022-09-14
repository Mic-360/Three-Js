import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

/**
 * Debug
 */
const gui = new dat.GUI();
const debugObject = {};

debugObject.createSphere = () => {
  createSphere(Math.random() * 0.5, {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });
};

gui.add(debugObject, "createSphere");

debugObject.createBox = () => {
  createBox(Math.random(), Math.random(), Math.random(), {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });
};
gui.add(debugObject, "createBox");

// Reset
debugObject.reset = () => {
  for (const object of objectsToUpdate) {
    // Remove body
    // object.body.removeEventListener('collide', playHitSound)
    world.removeBody(object.body);

    // Remove mesh
    scene.remove(object.mesh);
  }
};
gui.add(debugObject, "reset");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const world = new CANNON.World();
const cannonDebugger = new CannonDebugger(scene, world, {
  color: 0xffff,
});
const axesHelper = new THREE.AxesHelper(15);
scene.add(axesHelper);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Physics
 */
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Default material
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.5,
  }
);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Box(new CANNON.Vec3(25, 25, 0.1));
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

/**
 * Utils
 */
const objectsToUpdate = [];

//create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});
const createSphere = (radius, position) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.castShadow = true;
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannon.js body
  const shape = new CANNON.Sphere(radius);

  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  // body.addEventListener('collide', playHitSound)
  world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ mesh, body });
};

// Create box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});
const createBox = (width, height, depth, position) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannon.js body
  const shape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  );

  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  // body.addEventListener('collide', playHitSound)
  world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ mesh, body });
};

createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 });

//WALLS

//north Wall
const wallN = new THREE.Mesh(
  new THREE.BoxGeometry(50, 10, 0.1),
  new THREE.MeshStandardMaterial({
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
const wallS = new THREE.Mesh(
  new THREE.BoxGeometry(50, 10, 0.1),
  new THREE.MeshStandardMaterial({
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
const wallE = new THREE.Mesh(
  new THREE.BoxGeometry(10, 50, 0.1),
  new THREE.MeshStandardMaterial({
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
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(50, 50, 0.01),
  new THREE.MeshStandardMaterial({
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
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 10, 30);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  for (const object of objectsToUpdate) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }

  // Update controls
  controls.update();

  // Update physics
  world.step(1 / 60, deltaTime, 3);

  // Render
  cannonDebugger.update();
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
