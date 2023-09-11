import * as THREE from 'three';
import { City } from './city';

class Traveller {
  start: THREE.Vector3;
  end: THREE.Vector3;
  speed: number;
  colour: string;
  size: number;
  mesh: THREE.Mesh;
  finished: boolean;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;

  constructor(start: THREE.Vector3, end: THREE.Vector3, colour: string, size:number=0.05) {
    this.start = start;
    this.end = end;
    this.speed = Math.floor(Math.random() * 3) + 2;
    this.mesh = null;
    this.colour = colour
    this.finished = false;
    this.size = size;

    this.startPos = this.start.clone();
    this.endPos = this.end.clone();

    this.startPos.y = this.endPos.y = 0.1;
  }

  step(delta: number) {
    const direction = new THREE.Vector3().subVectors(this.endPos, this.getMesh().position).normalize();

    const moveAmount = delta * this.speed;
    const remainingDistance = this.getMesh().position.distanceTo(this.endPos);

    if (remainingDistance < moveAmount) {
      this.getMesh().position.copy(this.endPos);
      this.finished = true;
    } else {
      this.getMesh().position.addScaledVector(direction, moveAmount);
    }
  }

  getMesh(): THREE.Mesh {
    if(this.mesh) {
      return this.mesh;
    }

    const blobRadius = this.size;
    const blobSegments = 32;
    const blobGeometry = new THREE.SphereGeometry(blobRadius, blobSegments, blobSegments);
    const blobMaterial = new THREE.MeshLambertMaterial({ color: this.colour });
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.receiveShadow = true;
    blob.position.copy(this.startPos);

    this.mesh = blob;

    return blob;
  }
}

export default Traveller;
