import * as THREE from 'three';
import Traveller from './traveller';

class InboundStream {
  start: THREE.Vector3;
  end: THREE.Vector3;
  rate: number; // travellers per second
  travellerColour: string;
  travellers: Traveller[];

  constructor(end: THREE.Vector3, rate:number=3, travellerColour: string) {
    end.y = 0;
    this.start = new THREE.Vector3(0,0,12.5);
    this.end = end;

    this.rate = rate;
    this.travellerColour = travellerColour;
    this.travellers = [];
  }

  sendTraveller(): Traveller {
    const start = this.start.clone();
    const end = this.end.clone();
    const offset = Math.random() * 0.4;

    start.x += offset;
    end.x += offset;
    start.z += offset;
    end.z += offset;

    const traveller = new Traveller(start, end, this.travellerColour, 0.07, true)
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

export default InboundStream;
