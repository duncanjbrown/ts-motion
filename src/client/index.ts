import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import City from './city';
import Road from './road';
import InboundStream from './inboundStream';
import Label from './label';
import World from './../common/world';
import Service from './../common/service';
import { diff } from 'deep-object-diff';

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
    return new City(s.name, x, y, z, 0.5, new Label(s.displayName), s.colour);
  });

  const roads: Road[] = world.services.flatMap((s:Service) => {
    return s.outbound.map(outbound => {
      let fromCity = cities.find(c => c.name == s.name);
      let toCity = cities.find(c => c.name == outbound.destination);
      return fromCity.addRoad(toCity, outbound.rate);
    });
  });

  const inboundStreams: InboundStream[] = world.services.map((s:Service) => {
    let destCity = cities.find(c => c.name == s.name);
    return new InboundStream(destCity.getPosition(), s.inbound.rate, '#666');
  });

  return new Simulation(buildGround(), cities, roads, inboundStreams);
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

      const startPos = fromCity.getPosition().clone();
      const endPos = toCity.getPosition().clone();
      startPos.y = endPos.y = 0;

      let road = simulation.roads.find(r => r.start.equals(startPos) && r.end.equals(endPos));
      if (road) {
        console.log("new rate " + outbound.rate);
        road.rate = outbound.rate;
      }
    });

    let destCity = simulation.cities.find(c => c.name == serviceUpdate.name);
    const endPos = destCity.getPosition().clone();
    endPos.y = 0;
    let inboundStream = simulation.inboundStreams.find(s => s.end.equals(endPos));
    if (inboundStream) {
        console.log("new stream " + serviceUpdate.inbound.rate);
        inboundStream.rate = serviceUpdate.inbound.rate;
    }
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
