import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

document.body.appendChild(renderer.domElement);

function buildGround(): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(100, 100);  // Adjust the size as needed
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.rotation.x = - Math.PI / 2;  // Rotate the plane to be horizontal
  plane.position.y = 0;  // Adjust as needed depending on the base of your cities
  plane.receiveShadow = true;  // Optional, if you want the plane to receive shadows from the cities

  return plane;
}

function buildCity(city: City) {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, city.height, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Basic green color for cities
    const cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.set(city.x, city.y + city.height / 2, city.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
}

function buildRoad(city1: City, city2: City): THREE.Line {
  const roadGeometry = new THREE.BufferGeometry().setFromPoints([city1.getPosition(), city2.getPosition()]);
  const roadMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });  // Black color for road
  const road = new THREE.Line(roadGeometry, roadMaterial);

  return road;
}

function buildBlob(): THREE.Mesh {
  const blobRadius = 0.1;
  const blobSegments = 4;
  const blobGeometry = new THREE.SphereGeometry(blobRadius, blobSegments, blobSegments);
  const blobMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // Red color for blob
  const blob = new THREE.Mesh(blobGeometry, blobMaterial);

  blob.position.y = blobRadius;
  return blob;
}

function addLighting(scene: THREE.Scene): THREE.Scene {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);  // white, intensity at 0.5
  directionalLight.position.set(2, 2, 1);  // position the light source in a way that it shines downwards
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;  // default is 512
  directionalLight.shadow.mapSize.height = 1024; // default is 512

  scene.add(ambientLight);
  scene.add(directionalLight);

  return scene;
}

addLighting(scene);
scene.add(buildGround());

class City {
  x: number;
  y: number;
  z: number;
  height: number;

  constructor(x: number, y: number, z: number, height: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.height = height;
  }

  getPosition(): THREE.Vector3 {
    return new THREE.Vector3(this.x, this.y, this.z);
  }
}

const city1 = new City(-2, 0, 0, 1);
const city2 = new City(2, 0, 0, 2);

const citiesData: City[] = [city1, city2];

citiesData.forEach(city => {
    scene.add(buildCity(city));
});

scene.add(buildRoad(city1, city2));

const blob = buildBlob()
scene.add(blob);

const controls = new OrbitControls(camera, renderer.domElement);

let t = 0;
const speed = 0.01;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    blob.position.lerpVectors(city1.getPosition(), city2.getPosition(), t);

    t += speed;
    if (t >= 1) t = 0;  // Reset the blob's position when it reaches cityB

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const aspectRatio = width / height;
    
    const cameraWidth = zoomLevel * aspectRatio;
    const cameraHeight = zoomLevel;

    camera.left = -cameraWidth / 2;
    camera.right = cameraWidth / 2;
    camera.top = cameraHeight / 2;
    camera.bottom = -cameraHeight / 2;
    
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

