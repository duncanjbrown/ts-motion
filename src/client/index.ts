import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import { City, Theme } from './city';
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
    colour: 'red',
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
    colour: 'red',
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
  const positions = [
    { x: -2, y: 0, z: 0 },
    { x: 2, y: 0, z: 0 }
  ];

  const cities = world.services.map((s, i) => {
    const { x, y, z } = positions[i];
    return new City(s.name, x, y, z, 0.5, new Label(s.displayName), '#000', s.colour);
  });

  const origin = new City('external', 0, 0, 6, 0.5, new Label("The Internet"), "#e1e1e1", '#fff');

  const roads: Road[] = world.services.flatMap((s:Service) => {
    const thisCity = cities.find(c => c.name == s.name);
    const roads = s.outbound.map(outbound => {
      let toCity = cities.find(c => c.name == outbound.destination);
      return thisCity.addRoad(toCity, outbound.rate);
    });

    roads.push(origin.addRoad(thisCity, s.inbound.rate));

    return roads;
  });

  cities.push(origin);

  return new Simulation(buildGround(), cities, roads);
}

function updateSimulation(simulation:Simulation, worldUpdate: World) {
  worldUpdate.services.forEach(serviceUpdate => {
    console.log('new service');
    let city = simulation.cities.find(c => c.name == serviceUpdate.name);
    if (city) {
      city.name = serviceUpdate.name;
      city.colour = serviceUpdate.colour;
    }

    serviceUpdate.outbound.forEach(outbound => {
      let fromCity = simulation.cities.find(c => c.name == serviceUpdate.name);
      let toCity = simulation.cities.find(c => c.name == outbound.destination);
      let road = simulation.roads.find(r => r.start == fromCity && r.end == toCity);
      if (road) {
        console.log("new rate " + outbound.rate);
        road.rate = outbound.rate;
      }
    });
  });

  simulation.clearIntervals();
  simulation.sendTravellers();
}

const sim = simulateWorld(getWorld());

sim.setScene();

const clock = new THREE.Clock()
sim.sendTravellers();

const controls = new OrbitControls(sim.camera, sim.renderer.domElement);

const socket = new WebSocket('ws://localhost:8181');
socket.onopen = () => {
  socket.send("hello");
};

socket.onmessage = (event: MessageEvent) => {
  const newWorld:World = JSON.parse(event.data);
  console.log(newWorld);
  updateSimulation(sim, newWorld);
};

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    const delta = clock.getDelta();
    sim.update(delta);

    sim.renderer.render(sim.scene, sim.camera);
}

animate();
