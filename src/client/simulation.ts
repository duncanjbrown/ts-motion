import * as THREE from 'three';
import { City } from './city';
import Road from './road';
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
  }

  sendTravellers() {
    this.roads.forEach(road => {
      this.intervals.push(window.setInterval(() => {
        const traveller = road.sendTraveller();
        this.scene.add(traveller.getMesh());
      }, road.getInterval()));
    });
  }

  sendEvents() {
    this.events.forEach(event => {
      this.intervals.push(window.setInterval(() => {
        const signal = event.sendSignal();
        this.scene.add(signal.getMesh());
      }, event.getInterval()));
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
