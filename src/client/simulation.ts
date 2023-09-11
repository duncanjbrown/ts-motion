import * as THREE from 'three';
import { City } from './city';
import Road from './road';
import Orbit from './orbit';
import { EventType, WorldEvent } from './worldEvent';
import Signal from './signal';

class Simulation {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.Renderer;
  ground: THREE.Mesh;
  cities: Map<string, City>;
  roads: Road[];
  events: WorldEvent[];
  orbits: Orbit[];
  intervals: number[];

  getCamera(width: number, height: number) {
    const camera = new THREE.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        0.1,
        1000
    );

    camera.position.set(10, 10, 10);
    return camera;
  }

  getRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    return renderer;
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(2, 2, 1);
    directionalLight.castShadow = true;

    // Sharper shadows
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  constructor(
    ground: THREE.Mesh,
    cities: Map<string, City>,
    roads: Road[],
    events: WorldEvent[],
    orbits: Orbit[],
  ) {
    this.scene = new THREE.Scene();
    this.intervals = [];

    const zoomLevel = 10;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const width = zoomLevel * aspectRatio;
    const height = zoomLevel;

    // CAMERA
    this.camera = this.getCamera(width, height);
    this.camera.lookAt(this.scene.position);

    // RENDERER
    this.renderer = this.getRenderer();
    document.body.appendChild(this.renderer.domElement);

    // LIGHT
    this.setupLighting();

    // STRUCTURE
    this.ground = ground;
    this.cities = cities;
    this.roads = roads;
    this.events = events;
    this.orbits = orbits;

    // Resize :/
    const self = this;

    window.addEventListener('resize', function() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const cameraWidth = zoomLevel * aspectRatio;
      const cameraHeight = zoomLevel;

      self.camera.left = -cameraWidth / 2;
      self.camera.right = cameraWidth / 2;
      self.camera.top = cameraHeight / 2;
      self.camera.bottom = -cameraHeight / 2;

      self.camera.updateProjectionMatrix();

      self.renderer.setSize(width, height);
    });
  }

  setScene() {
    this.scene.add(this.ground);
    [...this.cities.values()].forEach((city:City) => {
      city.getComponents().forEach(component => {
        this.scene.add(component)
      });
    });
    this.roads.forEach(road => {
      this.scene.add(road.getLine())
    });
    this.orbits.forEach(orbit => {
      this.scene.add(orbit.getLine())
    });
  }

  sendTravellers() {
    this.roads.forEach(road => {
      if(road.rate > 0) {
        this.intervals.push(window.setInterval(() => {
          if (Math.random() < (road.rate / 4)/60) {
            const traveller = road.sendTraveller();
            this.scene.add(traveller.getMesh());
          }
        }, 1000 / 4));
      }
    });
  }

  sendOrbits() {
    this.cities.forEach(city => {
      if(city.orbit && city.orbit.rate > 0) {
        this.intervals.push(window.setInterval(() => {
          if (Math.random() < (city.orbit.rate / 4)/60) {
            const orbitTraveller = city.orbit.sendTraveller();
            this.scene.add(orbitTraveller.getMesh());
          }
        }, 1000 / 4));
      }
    });
  }

  sendEvents() {
    this.events.forEach(event => {
      if(event.rate > 0) {
        this.intervals.push(window.setInterval(() => {
          if (Math.random() < (event.rate / 4)/60) {
            const signal = event.sendSignal();
            this.scene.add(signal.getMesh());
          }
        }, 1000 / 4));
      }
    });
  }


  update(delta: number) {
    this.roads.forEach(road => {
      road.travellers.forEach(traveller => {
        traveller.step(delta);
        const removed = road.removeAndReturnFinishedTravellers();
        removed.forEach(t => { this.scene.remove(t) });
      });
    });

    this.orbits.forEach(orbit => {
      orbit.travellers.forEach(traveller => {
        traveller.step(delta);
        const removed = orbit.removeAndReturnFinishedTravellers();
        removed.forEach(t => { this.scene.remove(t) });
      });
    });

    this.events.forEach(event => {
      event.signals.forEach((signal:Signal) => {
        signal.step(delta);
        const removed = event.removeAndReturnFinishedSignals();
        removed.forEach((t:THREE.Object3D) => { this.scene.remove(t) });
      });
    });
  }

  clearIntervals() {
    this.intervals.forEach(i => {
      window.clearInterval(i);
    });
  }
}

export { Simulation }
