import Phaser from 'phaser';

// Import assets - new high quality versions
import echoTurtleImg from '@/assets/game/echo_turtle.png';
import oceanBgFarImg from '@/assets/game/ocean_bg_far.png';
import oceanBgMidImg from '@/assets/game/ocean_bg_mid.png';
import plasticBagImg from '@/assets/game/plastic_bag.png';
import ghostNetImg from '@/assets/game/ghost_net_new.png';
import apexTrawlerImg from '@/assets/game/apex_trawler.png';
import jellyfishImg from '@/assets/game/jellyfish_real.png';
import sanctuaryImg from '@/assets/game/sanctuary_reef.png';
import overseerImg from '@/assets/game/overseer_drone.png';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1520, 1);
    bg.fillRect(0, 0, width, height);
    
    // Progress bar container
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x0a2a3a, 0.8);
    progressBox.fillRoundedRect(width / 2 - 200, height / 2 - 30, 400, 60, 10);
    progressBox.lineStyle(2, 0x00ffff, 0.3);
    progressBox.strokeRoundedRect(width / 2 - 200, height / 2 - 30, 400, 60, 10);
    
    const progressBar = this.add.graphics();
    
    // Title
    const titleText = this.add.text(width / 2, height / 2 - 100, 'ABYSS EQUILIBRIUM', {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold',
    });
    titleText.setOrigin(0.5, 0.5);
    
    // Subtitle
    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Descending into the Silent Zone...', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#6699aa',
      fontStyle: 'italic',
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Percentage text
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff',
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Asset being loaded
    const assetText = this.add.text(width / 2, height / 2 + 50, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#446688',
    });
    assetText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRoundedRect(width / 2 - 190, height / 2 - 20, 380 * value, 40, 6);
    });
    
    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      assetText.setText('Loading: ' + file.key);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
      loadingText.destroy();
      assetText.destroy();
      
      // Fade out title
      this.tweens.add({
        targets: titleText,
        alpha: 0,
        duration: 500,
        onComplete: () => titleText.destroy()
      });
    });

    // Load all game images
    this.load.image('echo', echoTurtleImg);
    this.load.image('ocean_bg_far', oceanBgFarImg);
    this.load.image('ocean_bg_mid', oceanBgMidImg);
    this.load.image('plastic', plasticBagImg);
    this.load.image('ghost_net', ghostNetImg);
    this.load.image('apex_ship', apexTrawlerImg);
    this.load.image('jellyfish', jellyfishImg);
    this.load.image('sanctuary', sanctuaryImg);
    this.load.image('overseer', overseerImg);
  }

  create() {
    // Small delay for visual polish
    this.time.delayedCall(600, () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }
}
