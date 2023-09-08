import * as THREE from 'three';
import Road from './road';
import Label from './label';

type Theme = {
  colour: string,
  texture: string,
  travellerColour: string,
};

class City {
  name: string;
  x: number;
  y: number;
  z: number;
  height: number;
  colour: string;
  travellerColour: string;
  theme: Theme;
  label: Label;
  roads: Road[];
  mesh: THREE.Mesh;

  constructor(name: string, x: number, y: number, z: number, height: number, label: Label, colour:string='#000', travellerColour:string) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.z = z;
    this.height = height;
    this.label = label;
    this.colour = colour;
    this.travellerColour = travellerColour;
    this.roads = [];
    this.mesh = null;
  }

  getPosition(): THREE.Vector3 {
    return this.getMesh().position;
  }

  addRoad(to: City, rate:number=3) {
    const road = new Road(this, to, rate, this.travellerColour);
    this.roads.push(road);
    return road;
  }

  getMesh(): THREE.Mesh {
    if(this.mesh) {
      return this.mesh;
    }

    let cylinder:THREE.Mesh;
    const geometry = new THREE.CylinderGeometry(0.6, 0.6, this.height, 32);

    if(this.colour == '#000') {
      const loader = new THREE.TextureLoader();
      const texture = loader.load('govuk-crown.png');
      texture.center.set(0.5, 0.5);  // Set rotation center to the middle of the texture
      texture.rotation = Math.PI / 2;
      texture.anisotropy = 128;
      const topMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const sideMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const materials = [sideMaterial, topMaterial, sideMaterial];
      cylinder = new THREE.Mesh(geometry, materials);
    } else {
      const material = new THREE.MeshLambertMaterial({ color: this.colour });
      cylinder = new THREE.Mesh(geometry, material);
    }

    cylinder.position.set(this.x, this.y + this.height / 2, this.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }

  getLabel(): THREE.Object3D {
    const mesh = this.getMesh();
    const sprite = this.label.getObject();
    sprite.position.set(mesh.position.x + 0, mesh.position.y, mesh.position.z + 1);
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
