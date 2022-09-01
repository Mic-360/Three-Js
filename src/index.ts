import * as THREE from 'three';

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const mesh = new THREE.Mesh(geometry, material);

mesh.scale.set(1, 2, 2);
mesh.rotation.set(1, 0.5, 1, 'ZYX');

scene.add(mesh);

const AxisHelper = new THREE.AxesHelper(2);
scene.add(AxisHelper);

const sizes = {
  width: 1265,
  height: 620,
};

const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height);
camera.position.set(1.2, 0.5, 5);
scene.add(camera);

const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({
    canvas: canvas as HTMLCanvasElement,
});

renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);
