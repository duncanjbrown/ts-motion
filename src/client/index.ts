import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import { City, Theme } from './city';
import Road from './road';
import Label from './label';
import Orbit from './orbit';
import WorldUpdate from './../common/worldUpdate';
import ServiceUpdate from './../common/serviceUpdate';
import Service from './service';
import { EventType, WorldEvent } from './worldEvent';

type World = {
  services: Service[]
}

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
    timeframe: 60 * 20,
    name: 'find',
    displayName: 'Find',
    host: 'www.find-postgraduate-teacher-training.service.gov.uk',
    theme: 'govuk',
    outbound: {
      'apply': {
        rate: 0
      },
      'git': {
        rate: 0
      }
    },
    events: {},
    inbound: {
      'internet': {
        rate: 0
      }
    },
    orbit: { rate: 0 }
  };

  const apply: Service = {
    timeframe: 60 * 20,
    name: 'apply',
    displayName: 'Apply',
    host: 'www.apply-for-teacher-training.service.gov.uk',
    theme: 'govuk',
    events: {
      'submission': {
        rate: 0
      },
      'recruitment': {
        rate: 0
      }
    },
    outbound: {
      'find': {
        rate: 0
      },
      'git': {
        rate: 0
      }
    },
    inbound: {
      'internet': { rate: 0 }
    },
    orbit: { rate: 10 }
  };

  const git: Service = {
    timeframe: 60 * 20,
    name: 'git',
    displayName: 'GIT',
    host: 'getintoteaching.education.gov.uk',
    theme: 'git',
    outbound: {
      'apply': {
        rate: 0
      },
      'find': {
        rate: 0
      }
    },
    inbound: {
      'internet': {
        rate: 0
      }
    },
    events: {},
    orbit: { rate: 0 }
  };

  const register: Service = {
    timeframe: 60 * 20,
    name: 'register',
    displayName: 'Register',
    host: 'www.register-trainee-teachers.service.gov.uk',
    theme: 'govuk',
    events: {
      'qts': {
        rate: 0
      },
      'withdrawal': {
        rate: 0
      }
    },
    outbound: {
    },
    inbound: {
    },
    orbit: { rate: 0 }
  };

  const world: World = {
    services: [find, apply, git, register]
  }

  return world;
}

function simulateWorld(world: World): Simulation {
  const positions:any = {
    'find': {
      'city' : { x: -5, y: 0, z: 0 },
      'internet': { x: -5, y: 0, z: 3 }
    },
    'apply': {
      'city' : { x: 1, y: 0, z: 0 },
      'internet': { x: 1, y: 0, z: 3 }
    },
    'register': {
      'city' : { x: 5, y: 0, z: 0 },
      'internet': { x: 5, y: 0, z: 4 }
    },
    'git': {
      'city' : { x: -2, y: 0, z: -4 },
      'internet': { x: -2, y: 0, z: -7 }
    }
  }

  const cities:{[key:string]: City} = world.services.reduce<{[key:string]: City}>((acc, s:Service) => {
    const { x: cityX, y: cityY, z: cityZ } = positions[s.name]['city'];
    acc[s.name] = new City(themes[s.theme], s.name, cityX, cityY, cityZ, 0.5, new Label(s.displayName));

    if(s.inbound['internet']) {
      const { x: originX, y: originY, z: originZ } = positions[s.name]['internet'];

      const originName = `${s.name}-internet`;
      acc[originName] = new City(themes['internet'], originName, originX, originY, originZ, 0.25, new Label(''), 0.3);
    }

    return acc;
  }, {});

  const roads: Road[] = world.services.flatMap((s:Service) => {
    const thisCity:City = cities[s.name];
    const outboundRoads:Road[] = Object.entries(s.outbound).map(([destination, details]) => {
      let toCity = cities[destination];
      return thisCity.addRoad(toCity, details.rate);
    });

    const inboundRoads:Road[] = Object.entries(s.inbound).map(([_origin, details]) => {
      const internet = cities[`${s.name}-internet`];
      return internet.addRoad(thisCity, details.rate);
    });

    return [...outboundRoads, ...inboundRoads];
  });

  const orbits: Orbit[] = world.services.flatMap((s:Service) => {
    const thisCity:City = cities[s.name];
    return thisCity.addOrbit(s.orbit.rate);
  });

  const events: WorldEvent[] = world.services.flatMap((s:Service) => {
    const thisCity:City = cities[s.name];

    const events:WorldEvent[] = [];

    if(s.events) {
      events.push(...Object.entries(s.events).map(([type, details]) => {
        let eventType:EventType = type as EventType;
        return thisCity.addEvent(eventType, details.rate);
      }));
    }

    return events;
  });

  return new Simulation(buildGround(), new Map<string, City>(Object.entries(cities)), roads, events, orbits);
}

function updateSimulation(simulation:Simulation, worldUpdate: WorldUpdate) {
  console.log('Update!', worldUpdate);
  worldUpdate.services.forEach((serviceUpdate:ServiceUpdate) => {
    let thisCity = simulation.cities.get(serviceUpdate.name);

    Object.entries(serviceUpdate.outbound).forEach(([destination, details]) => {
      let toCity = simulation.cities.get(destination);
      let road = simulation.roads.find(r => r.start == thisCity && r.end == toCity);
      if (road) {
        console.log('updating outbound rate');
        road.rate = details.rate;
      }
    });

    Object.entries(serviceUpdate.inbound).forEach(([origin, details]) => {
      if(origin === 'internet') {
        const internet = simulation.cities.get(`${serviceUpdate.name}-internet`);
        let road = simulation.roads.find(r => r.start == internet && r.end == thisCity);
        if (road) {
          console.log('updating inbound rate');
          road.rate = details.rate;
        }
      }
    });

    Object.entries(serviceUpdate.events).forEach(([eventType, details]) => {
      let event = simulation.events.find(e => e.start == thisCity && e.type == eventType);
      if (event) {
        event.rate = details.rate;
      }
    });

    thisCity.orbit.rate = serviceUpdate.orbit.rate;
  });

  simulation.clearIntervals();
  simulation.sendTravellers();
  simulation.sendOrbits();
  simulation.sendEvents();
}

const sim = simulateWorld(getWorld());

sim.setScene();

const clock = new THREE.Clock()
sim.sendTravellers();
sim.sendOrbits();
sim.sendEvents();

const controls = new OrbitControls(sim.camera, sim.renderer.domElement);

const socket = new WebSocket('ws://localhost:8181');

socket.onmessage = (event: MessageEvent) => {
  const newWorld:WorldUpdate = JSON.parse(event.data);
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
