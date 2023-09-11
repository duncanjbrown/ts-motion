import * as THREE from 'three';

class OrbitTraveller {
  centre: THREE.Vector3;
  speed: number;
  colour: string;
  radius: number;
  size: number;
  mesh: THREE.Mesh;
  finished: boolean;
  accumulatedAngle: number;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;

  constructor(centre: THREE.Vector3, radius:number, colour:string='blue', size:number=0.05) {
    this.centre = centre;
    this.speed = Math.floor(Math.random() * 3) + 2;
    this.colour = colour
    this.finished = false;
    this.size = size;
    this.accumulatedAngle = 0;
    this.radius = radius;

    this.startPos = this.centre.clone();

    this.startPos.y = 0.2;
  }

  step(delta: number) {
    const angleChange = delta * this.speed;
    this.accumulatedAngle += angleChange;

    if (this.accumulatedAngle >= 2 * Math.PI) {
        this.finished = true;
        return;
    } else {
      this.mesh.position.x = this.centre.x + this.radius * Math.cos(this.accumulatedAngle);
      this.mesh.position.z = this.centre.z + this.radius * Math.sin(this.accumulatedAngle);
    }
  }

  getMesh(): THREE.Mesh {
    if(this.mesh) {
      return this.mesh;
    }

    const blobRadius = this.size;
    const blobSegments = 32;
    const blobGeometry = new THREE.SphereGeometry(blobRadius, blobSegments, blobSegments);
    const blobMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.receiveShadow = true;
    blob.position.copy(this.startPos);

    this.mesh = blob;

    return blob;
  }
}

export default OrbitTraveller;
