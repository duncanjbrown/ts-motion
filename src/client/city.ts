import * as THREE from 'three';
import Road from './road';
import Orbit from './orbit';
import Label from './label';
import Theme from './theme';
import { EventType, WorldEvent } from './worldEvent';

class City {
  name: string;
  theme: Theme;
  x: number;
  y: number;
  z: number;
  height: number;
  diameter: number;
  colour: string;
  label: Label;
  roads: Road[];
  orbit: Orbit;
  events: WorldEvent[];
  mesh: THREE.Mesh;

  constructor(theme:Theme, name: string, x: number, y: number, z: number, height: number, label: Label, diameter:number=0.6) {
    this.name = name;
    this.theme = theme;
    this.x = x;
    this.y = y;
    this.z = z;
    this.height = height;
    this.diameter = diameter;
    this.label = label;
    this.roads = [];
    this.events = [];
    this.mesh = null;
  }

  getPosition(): THREE.Vector3 {
    return this.getMesh().position;
  }

  addRoad(to: City, rate:number=3) {
    const road = new Road(this, to, rate);
    this.roads.push(road);
    return road;
  }

  addOrbit(rate:number) {
    const orbit = new Orbit(this, rate);
    this.orbit = orbit;
    return orbit;
  }

  addEvent(type: EventType, rate:number=3) {
    const event = new WorldEvent(this, type, rate);
    this.events.push(event);
    return event;
  }

  getMesh(): THREE.Mesh {
    if(this.mesh) {
      return this.mesh;
    }

    const geometry = new THREE.CylinderGeometry(this.diameter, this.diameter, this.height, 32);

    const loader = new THREE.TextureLoader();
    const texture = loader.load(this.theme.texture);
    texture.center.set(0.5, 0.5);  // Set rotation center to the middle of the texture
    texture.rotation = Math.PI / 2;
    texture.anisotropy = 128;
    const topMaterial = new THREE.MeshLambertMaterial({ map: texture });
    const sideMaterial = new THREE.MeshLambertMaterial({ color: this.theme.colour });
    const materials = [sideMaterial, topMaterial];
    const cylinder = new THREE.Mesh(geometry, materials);

    cylinder.position.set(this.x, this.y + this.height / 2, this.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }

  getLabel(): THREE.Object3D {
    const mesh = this.getMesh();
    const sprite = this.label.getObject();
    sprite.position.set(mesh.position.x + 1, mesh.position.y, mesh.position.z + 0.8);
    sprite.rotation.x = - Math.PI / 2;
    sprite.position.y = 0.01;
    sprite.receiveShadow = true;

    return sprite;
  }

  getComponents(): THREE.Object3D[] {
    return [this.getMesh(), this.getLabel()];
  }
}

export { City, Theme };
