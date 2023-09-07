import * as THREE from 'three';

class Traveller {
  start: THREE.Vector3;
  end: THREE.Vector3;
  speed: number;
  colour: string;
  transparent: boolean;
  size: number;
  mesh: THREE.Mesh;
  finished: boolean;

  constructor(start: THREE.Vector3, end: THREE.Vector3, colour: string, size:number=0.1, transparent:boolean=false) {
    this.start = start;
    this.end = end;
    this.speed = Math.floor(Math.random() * 3) + 2;
    this.mesh = null;
    this.colour = colour
    this.finished = false;
    this.size = size;
    this.transparent = transparent;
  }

  step(delta: number) {
    const direction = new THREE.Vector3().subVectors(this.end, this.getMesh().position).normalize();

    const moveAmount = delta * this.speed;
    const remainingDistance = this.getMesh().position.distanceTo(this.end);

    if (remainingDistance < moveAmount) {
      this.getMesh().position.copy(this.end);
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
    const blobMaterial = new THREE.MeshLambertMaterial({ color: this.colour, transparent: this.transparent });
    if(this.transparent) {
      blobMaterial.opacity = 0.1;
    }
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.receiveShadow = true;
    blob.position.copy(this.start);

    if(this.transparent) {
      blob.position.y = 0.2;
    }

    this.mesh = blob;

    return blob;
  }
}

export default Traveller;
