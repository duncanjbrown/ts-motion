import * as THREE from 'three';
import OrbitTraveller from './orbitTraveller';
import { City } from './city';

class Orbit {
  centre: THREE.Vector3;
  rate: number; // travellers per second
  travellers: OrbitTraveller[];

  constructor(centre:City, rate:number=3) {
    this.centre = centre.getPosition().clone();
    this.rate = rate;
    this.travellers = [];

    this.centre.y = 0.2;
  }

  getLine(): THREE.Line {
    const trackGeometry = new THREE.RingGeometry(0.7, 0.7, 32);
    const trackMaterial = new THREE.MeshStandardMaterial({ color: '#888'});
    const track = new THREE.Line(trackGeometry, trackMaterial);
    track.position.copy(this.centre);
    track.rotation.x = - Math.PI / 2;

    return track;
  }

  sendTraveller(colour:string='black'): OrbitTraveller {
    const traveller = new OrbitTraveller(this.centre, 0.7, colour)
    this.travellers.push(traveller);

    return traveller;
  }

  removeAndReturnFinishedTravellers() {
    const toRemove = this.travellers.filter(t => t.finished);
    this.travellers = this.travellers.filter(t => !t.finished);

    return toRemove.map(t => t.getMesh());
  }
}

export default Orbit;
