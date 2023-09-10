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

const govukTheme:Theme = {
  colour: '#000',
  texture: 'govuk-crown.png',
}

const gitTheme:Theme = {
  colour: '#159964',
  texture: 'git.jpg',
}

const internetTheme:Theme = {
  colour: '#5694ca',
  texture: 'cloud.png',
}

const themes:Record<string, Theme> = {
  'govuk': govukTheme,
  'git': gitTheme,
  'internet': internetTheme
};

function getWorld(): World {
  const find: Service = {
    timeframe: 60 * 10,
    name: 'find',
    displayName: 'Find',
    host: 'www.find-postgraduate-teacher-training.service.gov.uk',
    theme: 'govuk',
    outbound: {
      'apply': {
        rate: 3
      }
    },
    inbound: {
      'internet': {
        rate: 5
      }
    }
  };

  const apply: Service = {
    timeframe: 60 * 10,
    name: 'apply',
    displayName: 'Apply',
    host: 'www.apply-for-teacher-training.service.gov.uk',
    theme: 'govuk',
    outbound: {
      'find': {
        rate: 3
      }
    },
    inbound: {
      'internet': { rate: 5 }
    }
  };

  const world: World = {
    services: [find, apply]
  }

  return world;
}

function simulateWorld(world: World): Simulation {
  const positions:any = {
    'find': {
      'city' : { x: -2, y: 0, z: 0 },
      'internet': { x: -2, y: 0, z: -2 }
    },
    'apply': {
      'city' : { x: 2, y: 0, z: 0 },
      'internet': { x: 2, y: 0, z: -2 }
    },
    'git': {
      'city' : { x: 0, y: 0, z: 2 },
      'internet': { x: 0, y: 0, z: 4 }
    }
  }

  const cities:{[key:string]: City} = world.services.reduce<{[key:string]: City}>((acc, s:Service) => {
    const { x: cityX, y: cityY, z: cityZ } = positions[s.name]['city'];
    const { x: originX, y: originY, z: originZ } = positions[s.name]['internet'];

    const originName = `${s.name}-origin`;
    acc[s.name] = new City(themes[s.theme], s.name, cityX, cityY, cityZ, 0.5, new Label(s.displayName));
    acc[originName] = new City(themes['internet'], originName, originX, originY, originZ, 0.5, new Label(''));

    return acc;
  }, {});

  const roads: Road[] = world.services.flatMap((s:Service) => {
    const thisCity:City = cities[s.name];
    const roads = Object.entries(s.outbound).map(([destination, details]) => {
      let toCity = cities[destination];
      return thisCity.addRoad(toCity, details.rate);
    });

    return roads;
  });

  return new Simulation(buildGround(), new Map<string, City>(Object.entries(cities)), roads);
}

function updateSimulation(simulation:Simulation, worldUpdate: World) {
  worldUpdate.services.forEach(serviceUpdate => {
    console.log('new service');
    let fromCity = simulation.cities.get(serviceUpdate.name);

    // const roads = Object.entries(s.outbound).map(([destination, details]) => {
    //   let toCity = cities[destination];
    //   return thisCity.addRoad(toCity, details.rate);
    // });
    Object.entries(serviceUpdate.outbound).forEach(([destination, details]) => {
      let toCity = simulation.cities.get(destination);
      let road = simulation.roads.find(r => r.start == fromCity && r.end == toCity);
      if (road) {
        console.log("new rate " + details.rate);
        road.rate = details.rate;
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
