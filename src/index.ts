import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import City from './city';
import Road from './road';

function buildGround(): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(100, 100);  // Adjust the size as needed
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.rotation.x = - Math.PI / 2;  // Rotate the plane to be horizontal
  plane.position.y = 0;  // Adjust as needed depending on the base of your cities
  plane.receiveShadow = true;  // Optional, if you want the plane to receive shadows from the cities

  return plane;
}

const city1 = new City('find', -2, 0, 0, 1);
const city2 = new City('apply', 2, 0, 0, 2);

const road = city1.addRoad(city2);

const sim = new Simulation(
  buildGround(),
  [city1, city2],
  [road]
);

sim.setScene();

const clock = new THREE.Clock()

const controls = new OrbitControls(sim.camera, sim.renderer.domElement);

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    const delta = clock.getDelta();

    sim.update(delta);

    // t += speed;
    // if (t >= 1) t = 0;  // Reset the blob's position when it reaches cityB

    sim.renderer.render(sim.scene, sim.camera);
}

animate();
