import * as THREE from 'three';
import { City } from './city';
import Signal from './signal';

type EventType = 'qts' | 'submission' | 'recruitment' | 'withdrawal';

class WorldEvent {
  start: City;
  rate: number; // travellers per second
  type: EventType;
  signals: Signal[];
  texture: THREE.CanvasTexture;

  constructor(start: City, type: EventType, rate:number=3) {
    this.start = start;
    this.type = type;
    this.rate = rate;
    this.signals = [];
    this.texture = this.buildTexture();
  }

  buildTexture() {
    const typeEmojis:{[K in EventType]: string} = {
      'qts': '🎓',
      'submission': '✉️',
      'recruitment': '✅',
      'withdrawal': '❌'
    };

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.font = `${size * 0.8}px Arial`; // Adjust the size and font as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typeEmojis[this.type], size / 2, size / 2);
    return new THREE.CanvasTexture(canvas);
  }

  sendSignal() {
    const end = this.start.getPosition().clone();
    end.y = 2;
    const signal = new Signal(this.start.getPosition().clone(), end, this.texture);
    this.signals.push(signal);

    return signal;
  }

  removeAndReturnFinishedSignals() {
    const toRemove = this.signals.filter(t => t.finished);
    this.signals = this.signals.filter(t => !t.finished);

    return toRemove.map(t => t.getMesh());
  }

  getInterval(): number{
    return 1000 / this.rate;
  }
}

export { WorldEvent, EventType };
