import * as THREE from 'three';

class Signal {
  start: THREE.Vector3;
  end: THREE.Vector3;
  speed: number;
  mesh: THREE.Mesh;
  finished: boolean;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  texture: THREE.CanvasTexture;

  constructor(start: THREE.Vector3, end: THREE.Vector3, texture: THREE.CanvasTexture) {
    this.start = start;
    this.end = end;
    this.speed = Math.floor(Math.random() * 3) + 1.5;
    this.mesh = null;
    this.texture = texture;
    this.finished = false;

    this.startPos = this.start.clone();
    this.endPos = this.end.clone();

    // jitter
    const jitter = ((Math.random() - 0.5) * 2) * 0.9;
    this.endPos.x = this.endPos.x + jitter;
    this.endPos.z = this.endPos.z + jitter;
  }

  step(delta: number) {
    const direction = new THREE.Vector3().subVectors(this.endPos, this.getMesh().position).normalize();

    const moveAmount = delta * this.speed;
    const remainingDistance = this.getMesh().position.distanceTo(this.endPos);

    if(remainingDistance < 1) {
      (<THREE.MeshBasicMaterial>this.getMesh().material).opacity = 1 - (1 - remainingDistance);
    }

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

    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.startPos);

    return this.mesh;
  }
}

export default Signal;
