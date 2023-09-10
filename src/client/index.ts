import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulation } from './simulation'
import { City, Theme } from './city';
import Road from './road';
import Label from './label';
import World from './../common/world';
import Service from './../common/service';
import { EventType, WorldEvent } from './worldEvent';

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
      },
      'git': {
        rate: 3
      }
    },
    events: {},
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
    events: {
      'submission': {
        rate: 3
      },
      'recruitment': {
        rate: 1
      }
    },
    outbound: {
      'find': {
        rate: 3
      },
      'git': {
        rate: 3
      }
    },
    inbound: {
      'internet': { rate: 5 }
    }
  };

  const git: Service = {
    timeframe: 60 * 10,
    name: 'git',
    displayName: 'GIT',
    host: 'getintoteaching.education.gov.uk',
    theme: 'git',
    outbound: {
      'apply': {
        rate: 3
      },
      'find': {
        rate: 3
      }
    },
    inbound: {
      'internet': {
        rate: 5
      }
    },
    events: {}
  };

  const register: Service = {
    timeframe: 60 * 10,
    name: 'register',
    displayName: 'Register',
    host: 'www.register-trainee-teachers.service.gov.uk',
    theme: 'govuk',
    events: {
      'qts': {
        rate: 3
      },
      'withdrawal': {
        rate: 3
      }
    },
    outbound: {
    },
    inbound: {
    }
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

  return new Simulation(buildGround(), new Map<string, City>(Object.entries(cities)), roads, events);
}

function updateSimulation(simulation:Simulation, worldUpdate: World) {
  worldUpdate.services.forEach(serviceUpdate => {
    console.log('new service');
    let fromCity = simulation.cities.get(serviceUpdate.name);

    Object.entries(serviceUpdate.outbound).forEach(([destination, details]) => {
      let toCity = simulation.cities.get(destination);
      let road = simulation.roads.find(r => r.start == fromCity && r.end == toCity);
      if (road) {
        console.log("new rate " + details.rate);
        road.rate = details.rate;
      }
    });

    Object.entries(serviceUpdate.events).forEach(([eventType, details]) => {
      let event = simulation.events.find(e => e.start == fromCity && e.type == eventType);
      if (event) {
        console.log("new event rate " + details.rate);
        event.rate = details.rate;
      }
    });
  });

  simulation.clearIntervals();
  simulation.sendTravellers();
  simulation.sendEvents();
}

const sim = simulateWorld(getWorld());

sim.setScene();

const clock = new THREE.Clock()
sim.sendTravellers();
sim.sendEvents();

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
