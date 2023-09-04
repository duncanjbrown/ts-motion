import * as THREE from 'three';
import City from './city';

class Road {
  start: City;
  end: City;

  constructor(start: City, end: City) {
    this.start = start;
    this.end = end;
  }

  getLine(): THREE.Line {
    const roadGeometry = new THREE.BufferGeometry().setFromPoints([this.start.getPosition(), this.end.getPosition()]);
    const roadMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });  // Black color for road
    const road = new THREE.Line(roadGeometry, roadMaterial);

    return road;
  }
}

export default Road;
