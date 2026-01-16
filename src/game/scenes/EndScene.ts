import Phaser from 'phaser';
import { GAME_CONFIG } from '../constants';

export class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  create(data: { won: boolean; distance: number; apexMoney: number }) {
    const { won, distance, apexMoney } = data;
    
    // Animated background gradient
    const bg = this.add.graphics();
    
    if (won) {
      // Victory - ocean recovery colors
      bg.fillGradientStyle(0x0a3040, 0x0a3040, 0x004455, 0x004455);
    } else {
      // Defeat - polluted colors
      bg.fillGradientStyle(0x200a10, 0x200a10, 0x0a0a1a, 0x0a0a1a);
    }
    bg.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    
    // Particles based on outcome
    const particleTexture = this.add.graphics();
    particleTexture.fillStyle(won ? 0x00ffcc : 0xff4444, 1);
    particleTexture.fillCircle(4, 4, 4);
    particleTexture.generateTexture('endParticle', 8, 8);
    particleTexture.destroy();
    
    const particles = this.add.particles(GAME_CONFIG.width / 2, GAME_CONFIG.height, 'endParticle', {
      speed: { min: 20, max: 60 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 4000,
      frequency: 100,
      quantity: 2,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-GAME_CONFIG.width/2, 0, GAME_CONFIG.width, 50)
      }
    });
    
    // Outcome icon/symbol
    const symbol = won ? '◈' : '✖';
    const symbolColor = won ? '#00ffcc' : '#ff4444';
    
    const symbolText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 4 - 20, symbol, {
      fontSize: '72px',
      color: symbolColor,
    });
    symbolText.setOrigin(0.5, 0.5);
    
    // Pulsing animation
    this.tweens.add({
      targets: symbolText,
      scale: { from: 0.9, to: 1.1 },
      alpha: { from: 0.8, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Main result text
    const titleText = won ? 'EQUILIBRIUM RESTORED' : 'THE OCEAN FALLS SILENT';
    const titleColor = won ? '#00ffcc' : '#ff6666';
    
    const title = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 3 + 30, titleText, {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: titleColor,
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    title.setAlpha(0);
    
    // Fade in title
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      ease: 'Cubic.easeOut'
    });
    
    // Narrative subtitle
    const narrativeLines = won 
      ? [
          'Echo reached the Sanctuary.',
          'In the depths, life persists.',
          'The balance can be restored.'
        ]
      : [
          'Biomass depleted. Systems failing.',
          'The acoustic pollution spreads.',
          'Humanity has 10 years left.'
        ];
    
    const subtitle = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 3 + 90, narrativeLines.join('\n'), {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#99aabb',
      fontStyle: 'italic',
      align: 'center',
      lineSpacing: 8,
    });
    subtitle.setOrigin(0.5, 0);
    subtitle.setAlpha(0);
    
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Cubic.easeOut'
    });
    
    // Stats panel
    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x0a1a2a, 0.8);
    statsBg.fillRoundedRect(GAME_CONFIG.width / 2 - 150, GAME_CONFIG.height / 2 + 60, 300, 80, 8);
    statsBg.lineStyle(1, won ? 0x00aaaa : 0xaa4444, 0.3);
    statsBg.strokeRoundedRect(GAME_CONFIG.width / 2 - 150, GAME_CONFIG.height / 2 + 60, 300, 80, 8);
    
    const stats = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 85, 
      `Journey: ${distance}m\nApex Industries Profit: $${apexMoney}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#778899',
      align: 'center',
      lineSpacing: 8,
    });
    stats.setOrigin(0.5, 0);
    
    // Environmental impact
    const impact = apexMoney > 500 
      ? 'Environmental Cost: SEVERE' 
      : apexMoney > 200 
        ? 'Environmental Cost: MODERATE'
        : 'Environmental Cost: MINIMAL';
    
    const impactColor = apexMoney > 500 ? '#ff4444' : apexMoney > 200 ? '#ffaa00' : '#00ff88';
    
    const impactText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 125, impact, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: impactColor,
    });
    impactText.setOrigin(0.5, 0);
    
    // Restart button
    const buttonY = GAME_CONFIG.height * 0.78;
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(won ? 0x00aa88 : 0xaa4444, 1);
    buttonBg.fillRoundedRect(GAME_CONFIG.width / 2 - 120, buttonY - 25, 240, 50, 8);
    
    const restartText = this.add.text(GAME_CONFIG.width / 2, buttonY, 'DIVE AGAIN', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    restartText.setOrigin(0.5, 0.5);
    
    const keyHint = this.add.text(GAME_CONFIG.width / 2, buttonY + 35, 'Press R or click to restart', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#556677',
    });
    keyHint.setOrigin(0.5, 0.5);
    
    // Make button interactive
    const hitArea = this.add.zone(GAME_CONFIG.width / 2, buttonY, 240, 50);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(won ? 0x00ccaa : 0xcc6666, 1);
      buttonBg.fillRoundedRect(GAME_CONFIG.width / 2 - 120, buttonY - 25, 240, 50, 8);
    });
    
    hitArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(won ? 0x00aa88 : 0xaa4444, 1);
      buttonBg.fillRoundedRect(GAME_CONFIG.width / 2 - 120, buttonY - 25, 240, 50, 8);
    });
    
    hitArea.on('pointerdown', () => {
      this.restartGame();
    });
    
    // Keyboard restart
    this.input.keyboard?.on('keydown-R', () => {
      this.restartGame();
    });
    
    // Final Overseer message
    const endMessage = won 
      ? 'Overseer Model-7: "System stable. Equilibrium achieved. Hope persists."'
      : 'Overseer Model-7: "Critical failure. Intervention protocols... insufficient."';
    
    const msg = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height - 50, endMessage, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#556677',
      fontStyle: 'italic',
    });
    msg.setOrigin(0.5, 0.5);
    
    // Credits
    this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height - 25, 'ABYSS EQUILIBRIUM — Survival in the Age of Silence', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#334455',
    }).setOrigin(0.5, 0.5);
  }

  private restartGame() {
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }
}
