import Phaser from 'phaser';
import { GAME_CONFIG } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Nothing to preload here
  }

  create() {
    this.scale.scaleMode = Phaser.Scale.FIT;
    this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
    
    this.scene.start('PreloadScene');
  }
}
