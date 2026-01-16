import Phaser from 'phaser';

// Import assets
import echoImg from '@/assets/game/echo.png';
import oceanBgImg from '@/assets/game/ocean_bg.png';
import plasticImg from '@/assets/game/plastic.png';
import ghostNetImg from '@/assets/game/ghost_net.png';
import apexShipImg from '@/assets/game/apex_ship.png';
import jellyfishImg from '@/assets/game/jellyfish.png';
import sanctuaryImg from '@/assets/game/sanctuary.png';
import overseerImg from '@/assets/game/overseer.png';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x0a2a3a, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'ENTERING THE ABYSS...', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffff',
    });
    loadingText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load images
    this.load.image('echo', echoImg);
    this.load.image('ocean_bg', oceanBgImg);
    this.load.image('plastic', plasticImg);
    this.load.image('ghost_net', ghostNetImg);
    this.load.image('apex_ship', apexShipImg);
    this.load.image('jellyfish', jellyfishImg);
    this.load.image('sanctuary', sanctuaryImg);
    this.load.image('overseer', overseerImg);
  }

  create() {
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
