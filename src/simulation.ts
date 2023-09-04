import * as THREE from 'three';
import City from './city';
import Road from './road';
import Traveller from './traveller';

type Simulation = {
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
  renderer: THREE.Renderer,
  ground: THREE.Mesh,
  cities: City[],
  roads: Road[],
  travellers: Traveller[]
}

function initialize(
  ground: THREE.Mesh,
  cities: City[],
  roads: Road[],
  travellers: Traveller[]
): Simulation {
  const scene = new THREE.Scene();
  const zoomLevel = 10;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const width = zoomLevel * aspectRatio;
  const height = zoomLevel;

  const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
  );

  camera.position.set(10, 10, 10);  // Set camera position
  camera.lookAt(scene.position);    // Make the camera look at the center of the scene

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // LIGHT
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);  // white, intensity at 0.5
  directionalLight.position.set(2, 2, 1);  // position the light source in a way that it shines downwards
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;  // default is 512
  directionalLight.shadow.mapSize.height = 1024; // default is 512

  scene.add(ambientLight);
  scene.add(directionalLight);

  const sim: Simulation = {
    scene: scene,
    camera: camera,
    renderer: renderer,
    ground: ground,
    cities: cities,
    roads: roads,
    travellers: travellers
  };

  window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    const cameraWidth = zoomLevel * aspectRatio;
    const cameraHeight = zoomLevel;

    sim.camera.left = -cameraWidth / 2;
    sim.camera.right = cameraWidth / 2;
    sim.camera.top = cameraHeight / 2;
    sim.camera.bottom = -cameraHeight / 2;

    sim.camera.updateProjectionMatrix();

    sim.renderer.setSize(width, height);
  });

  return sim;
}

function render(sim: Simulation) {
  sim.scene.add(sim.ground);
  sim.cities.forEach(city => {
    sim.scene.add(city.getMesh())
  });
  sim.roads.forEach(road => {
    sim.scene.add(road.getLine())
  });
  sim.travellers.forEach(traveller => {
    sim.scene.add(traveller.getMesh())
  });
}

export { Simulation, initialize, render }
