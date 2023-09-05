import * as THREE from 'three';

class Traveller {
  start: THREE.Vector3;
  end: THREE.Vector3;
  speed: number;
  mesh: THREE.Mesh;
  finished: Boolean;

  constructor(start: THREE.Vector3, end: THREE.Vector3) {
    this.start = start;
    this.end = end;
    this.speed = Math.floor(Math.random() * 3) + 2;
    this.mesh = null;
    this.finished = false;
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

    const blobRadius = 0.1;
    const blobSegments = 4;
    const blobGeometry = new THREE.SphereGeometry(blobRadius, blobSegments, blobSegments);
    const blobMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.receiveShadow = true;
    blob.position.copy(this.start);

    blob.position.y = blobRadius;
    this.mesh = blob;

    return blob;
  }
}

export default Traveller;
