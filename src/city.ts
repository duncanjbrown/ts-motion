import * as THREE from 'three';

class City {
  name: string;
  x: number;
  y: number;
  z: number;
  height: number;

  constructor(name: string, x: number, y: number, z: number, height: number) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.z = z;
    this.height = height;
  }

  getPosition(): THREE.Vector3 {
    return new THREE.Vector3(this.x, this.y, this.z);
  }

  getMesh(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, this.height, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Basic green color for cities
    const cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.set(this.x, this.y + this.height / 2, this.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }
}

export default City;
