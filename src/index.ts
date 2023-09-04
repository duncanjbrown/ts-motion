import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initialize, render } from './simulation'
import City from './city';
import Road from './road';
import Traveller from './traveller';

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
const road = new Road(city1, city2);
const traveller = new Traveller(road)

const sim = initialize(
  buildGround(),
  [city1, city2],
  [road],
  [traveller]
);

render(sim);
document.body.appendChild(sim.renderer.domElement);

const controls = new OrbitControls(sim.camera, sim.renderer.domElement);

let t = 0;
const speed = 0.02;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    sim.travellers.forEach(traveller => {
      traveller.step(t);
    })

    t += speed;
    if (t >= 1) t = 0;  // Reset the blob's position when it reaches cityB

    sim.renderer.render(sim.scene, sim.camera);
}

animate();
