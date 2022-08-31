import * as THREE from 'three';

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height);
camera.position.z = 5;
camera.position.y = 1;
camera.position.x = 2;
scene.add(camera);

const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas as HTMLCanvasElement,
});

renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);
