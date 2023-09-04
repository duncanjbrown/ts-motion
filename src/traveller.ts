import * as THREE from 'three';
import Road from './road';

class Traveller {
  road: Road;
  mesh: THREE.Mesh;

  constructor(road: Road) {
    this.road = road;
    this.mesh = null;
  }

  step(t: number) {
    this.mesh.position.lerpVectors(this.road.start.getPosition(), this.road.end.getPosition(), t);
  }

  getMesh(): THREE.Mesh {
    if(this.mesh) {
      return this.mesh;
    }

    const blobRadius = 0.1;
    const blobSegments = 4;
    const blobGeometry = new THREE.SphereGeometry(blobRadius, blobSegments, blobSegments);
    const blobMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });  // Red color for blob
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.receiveShadow = true;

    blob.position.y = blobRadius;
    this.mesh = blob;

    return blob;
  }
}

export default Traveller;
