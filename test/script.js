import * as THREE from "https://unpkg.com/three@0.144.0/build/three.module.js";
// import { OrbitControls } from "https://unpkg.com/three@0.144.0/examples/jsm/controls/OrbitControls.js";

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
document.querySelector('.').appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


const geometry = new THREE.SphereGeometry(5, 0, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(10, 0, 25);
scene.add(light);

const render = function () {
  requestAnimationFrame(render);

  // Animations
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;



  renderer.render(scene, camera);
}

render();