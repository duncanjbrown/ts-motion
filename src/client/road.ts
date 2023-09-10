import * as THREE from 'three';
import Traveller from './traveller';
import { City } from './city';

class Road {
  start: City;
  end: City;
  rate: number; // travellers per second
  travellers: Traveller[];

  constructor(start: City, end: City, rate:number=3) {
    this.start = start;
    this.end = end;
    this.rate = rate;
    this.travellers = [];
  }

  getLine(): THREE.Line {
    const startPos = this.start.getPosition().clone();
    const endPos = this.end.getPosition().clone();

    const roadGeometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
    const roadMaterial = new THREE.LineBasicMaterial({ color: '#888' });
    const road = new THREE.Line(roadGeometry, roadMaterial);

    return road;
  }

  sendTraveller(): Traveller {
    const traveller = new Traveller(this.start, this.end, 'red')
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
