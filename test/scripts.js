import * as THREE from "three";
import { OrbitControls } from "orbit-controls";
import { GLTFLoader } from "GLTFLoader";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(1, 1, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#35363a");
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(10, 0, 25);
scene.add(light);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Physics
const world = new CANNON.World({
  restitution: -1,
});
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
world.solver.tolerance = 0.001;
world.solver.iterations = 10;

// Floor
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 0.1, 10),
  new THREE.MeshStandardMaterial({ color: 0x35363a })
);
floor.position.y = -0.05;
floor.receiveShadow = true;
scene.add(floor);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
  material: new CANNON.Material("floorMaterial"),
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
world.addBody(floorBody);

// Wall
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x35363a })
);
wall.position.z = -5;
wall.receiveShadow = true;
scene.add(wall);

const wallShaper = new CANNON.Plane();
const wallBody = new CANNON.Body({
  mass: 0,
  shape: wallShaper,
  material: new CANNON.Material("wallMaterial"),
});
wallBody.position.copy(wall.position);
world.addBody(wallBody);
console.log("wall", wall.position);
console.log("wall body", wallBody.position);

// Cannon Debugger
const cannonDebugger = new CannonDebugger(scene, world);

// Load Model
const Avatar = "../public/Soldier.glb"; //?Dynamic character selection
let animations, model;
let modelBody;
const velocity = 0.5;
let character = new GLTFLoader().load(Avatar, function (gltf) {
  model = gltf.scene;
  model.traverse(function (object) {
    if (object.isMesh) object.castShadow = true;
  });
  gltf.scene.scale.set(3, 3, 3), scene.add(model);

  const modelShape = new CANNON.Sphere(2);
  modelBody = new CANNON.Body({
    mass: 1,
    shape: modelShape,
    material: new CANNON.Material("modelMaterial"),
  });
  modelBody.position.set(0, 0, 0);
  world.addBody(modelBody);

  animations = new THREE.AnimationMixer(model);
  let action = animations.clipAction(gltf.animations[0]);

  //character movement
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "w":
        modelBody.position.z -= velocity;
        model.rotation.y = 2 * Math.PI;
        break;
      case "s":
        modelBody.position.z += velocity;
        model.rotation.y = Math.PI;
        break;
      case "a":
        modelBody.position.x -= velocity;
        model.rotation.y = Math.PI / 2;
        break;
      case "d":
        modelBody.position.x += velocity;
        model.rotation.y = -Math.PI / 2;
        break;
    }
  });
  action.play();
});
scene.add(character);


const clock = new THREE.Clock();
const render = function () {
  requestAnimationFrame(render);
  const delta = clock.getDelta();

  if (animations) {
    animations.update(delta);
    world.step(1 / 60, delta, 3);
    model.position.x = modelBody.position.x;
    model.position.z = modelBody.position.z;
  }

  world.step(delta); // Update cannon-es physics
  cannonDebugger.update();

  renderer.render(scene, camera);
};

render();
