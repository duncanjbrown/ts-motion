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

// const light = new THREE.AmbientLight(0x404040);  // soft white light
// scene.add(light);

function buildGround(): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(100, 100);  // Adjust the size as needed
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
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

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);  // white, intensity at 0.5
directionalLight.position.set(2, 2, 1);  // position the light source in a way that it shines downwards
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;  // default is 512
directionalLight.shadow.mapSize.height = 1024; // default is 512
scene.add(directionalLight);

scene.add(buildGround());

type City = {
  x: number,
  y: number,
  z: number,
  height: number
}

const citiesData: City[] = [
    { x: -2, y: 0, z: 0, height: 1 },  // Example data
    { x: 2, y: 0, z: 0, height: 3 }
];

citiesData.forEach(city => {
    scene.add(buildCity(city));
});

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);

    controls.update();  // Add this line

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

