import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import City from './city';
import Road from './road';
import Label from './label';
import World from './../common/world';
import Service from './../common/service';

function buildGround(): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.rotation.x = - Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;

  return plane;
}

function getWorld(): World {
  const find: Service = {
    timeframe: 60 * 10,
    name: 'find',
    displayName: 'Find',
    host: 'www.find-postgraduate-teacher-training.service.gov.uk',
    uniques: 100,
    outbound: [{
      destination: 'apply',
      rate: 3
    }],
    inbound: {
      rate: 5
    }
  };

  const apply: Service = {
    timeframe: 60 * 10,
    name: 'apply',
    displayName: 'Apply',
    host: 'www.apply-for-teacher-training.service.gov.uk',
    uniques: 100,
    outbound: [{
      destination: 'find',
      rate: 3
    }],
    inbound: {
      rate: 5
    }
  };

  const world: World = {
    services: [find, apply]
  }

  return world;
}

function simulateWorld(world: World): Simulation {
  let cities: City[] = [];

  world.services.forEach((s, i) => {
    cities.push(new City(s.name, i * 4,0,0, 0.5, new Label(s.displayName)));
  });

  const roads: Road[] = world.services.flatMap((s:Service) => {
    return s.outbound.map(outbound => {
      let fromCity = cities.find(c => c.name == s.name);
      let toCity = cities.find(c => c.name == outbound.destination);
      return fromCity.addRoad(toCity, outbound.rate);
    });
  });

  return new Simulation(buildGround(), cities, roads);
}

const sim = simulateWorld(getWorld());

// const city1 = new City('find', -2, 0, 0, 0.5, new Label('Find'));
// const city2 = new City('apply', 2, 0, 0, 0.5, new Label('Apply'));
//
// const road = city1.addRoad(city2);
//
// const sim = new Simulation(
//   buildGround(),
//   [city1, city2],
//   [road]
// );
//
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
