import * as THREE from 'three';
import Traveller from './traveller';

class Road {
  start: THREE.Vector3;
  end: THREE.Vector3;
  rate: number; // travellers per second
  travellers: Traveller[];

  constructor(start: THREE.Vector3, end: THREE.Vector3, rate:number=3) {
    this.start = start;
    this.end = end;
    this.rate = rate;
    this.travellers = [];

    start.y = end.y = 0
  }

  getLine(): THREE.Line {
    const roadGeometry = new THREE.BufferGeometry().setFromPoints([this.start, this.end]);
    const roadMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const road = new THREE.Line(roadGeometry, roadMaterial);

    return road;
  }

  sendTraveller(): Traveller {
    const traveller = new Traveller(this.start, this.end)
    this.travellers.push(traveller);

    return traveller;
  }

  removeAndReturnFinishedTravellers() {
    const toRemove = this.travellers.filter(t => t.finished);
    this.travellers = this.travellers.filter(t => !t.finished);

    return toRemove.map(t => t.getMesh());
  }

  getInterval(): number{
    return 1000 / this.rate;
  }
}

export default Road;
