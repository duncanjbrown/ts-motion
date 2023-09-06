import * as THREE from 'three';

class Label {
  text: string;
  object: THREE.Object3D;

  constructor(message: string, fontsize:number=40, backgroundColor:string="rgba(255, 255, 255, 1)", textColor:string="#000") {
    fontsize = fontsize || 24;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = fontsize + "px Arial";

    var metrics = context.measureText(message);
    var textWidth = metrics.width;
    canvas.width = textWidth + 20;
    canvas.height = fontsize * 1.5;

    // Background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    context.font = fontsize + "px Arial";
    context.fillStyle = textColor;
    context.fillText(message, 10, fontsize);

    // Plane
    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    var material = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width / 100, canvas.height / 100), material);

    this.object = plane;
}

  getObject(): THREE.Object3D {
    return this.object;
  }
}

export default Label;
