import * as THREE from 'three';
import City from './city';
import Road from './road';
import Traveller from './traveller';

class Simulation {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.Renderer;
  ground: THREE.Mesh;
  cities: City[];
  roads: Road[];

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
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
    cities: City[],
    roads: Road[],
  ) {
    this.scene = new THREE.Scene();

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
    this.cities.forEach(city => {
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
      setInterval(() => {
        const traveller = road.sendTraveller();
        this.scene.add(traveller.getMesh());
      }, road.getInterval());
    });
  }

  update(delta: number) {
    this.roads.forEach(road => {
      road.travellers.forEach(traveller => {
        traveller.step(delta);
        road.removeFinishedTravellers();
      });
    });
  }
}

export { Simulation }
