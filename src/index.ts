import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import City from './city';
import Label from './label';

function buildGround(): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.rotation.x = - Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;

  return plane;
}

function getWorld() {
  // next
}

const city1 = new City('find', -2, 0, 0, 0.5, new Label('Find'));
const city2 = new City('apply', 2, 0, 0, 0.5, new Label('Apply'));

const road = city1.addRoad(city2);

const sim = new Simulation(
  buildGround(),
  [city1, city2],
  [road]
);

sim.setScene();

const clock = new THREE.Clock()
sim.sendTravellers();

const controls = new OrbitControls(sim.camera, sim.renderer.domElement);

const socket = new WebSocket('ws://localhost:8181');
socket.onopen = () => {
  socket.send("hello");
};

socket.onmessage = (event: MessageEvent) => {
  console.log('Server says:', event.data);
};

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    const delta = clock.getDelta();
    sim.update(delta);

    sim.renderer.render(sim.scene, sim.camera);
}

animate();
