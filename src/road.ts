import * as THREE from 'three';
import City from './city';
import Traveller from './traveller';

class Road {
  start: City;
  end: City;
  rate: number;
  travellers: Traveller[];

  constructor(start: City, end: City, rate:number=500) {
    this.start = start;
    this.end = end;
    this.rate = rate;
    this.travellers = [];
  }

  getLine(): THREE.Line {
    const roadGeometry = new THREE.BufferGeometry().setFromPoints([this.start.getPosition(), this.end.getPosition()]);
    const roadMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const road = new THREE.Line(roadGeometry, roadMaterial);

    return road;
  }

  sendTraveller(): Traveller {
    const traveller = new Traveller(this.start.getPosition(), this.end.getPosition())
    this.travellers.push(traveller);

    return traveller;
  }

  removeFinishedTravellers() {
    this.travellers = this.travellers.filter(t => !t.finished);
  }
}

export default Road;
