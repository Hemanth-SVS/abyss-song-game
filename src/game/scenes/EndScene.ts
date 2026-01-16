import Phaser from 'phaser';
import { GAME_CONFIG } from '../constants';

export class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  create(data: { won: boolean; distance: number; apexMoney: number }) {
    const { won, distance, apexMoney } = data;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(won ? 0x0a2030 : 0x200a10, 1);
    bg.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    
    // Result text
    const titleText = won ? 'EQUILIBRIUM RESTORED' : 'THE OCEAN FALLS SILENT';
    const titleColor = won ? '#00ffcc' : '#ff6666';
    
    const title = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 3, titleText, {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: titleColor,
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    
    // Subtitle
    const subtitle = won 
      ? 'Echo reached the Sanctuary. Life persists.'
      : 'Biomass depleted. Humanity has 10 years left.';
    
    const subtitleObj = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 3 + 60, subtitle, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aabbcc',
    });
    subtitleObj.setOrigin(0.5, 0.5);
    
    // Stats
    const statsText = `Distance traveled: ${distance}m\nApex Industries profit: $${apexMoney}`;
    const stats = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 40, statsText, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#778899',
      align: 'center',
    });
    stats.setOrigin(0.5, 0.5);
    
    // Restart button
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(won ? 0x00aa88 : 0xaa4444, 1);
    buttonBg.fillRoundedRect(GAME_CONFIG.width / 2 - 100, GAME_CONFIG.height * 0.7, 200, 50, 8);
    
    const restartText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height * 0.7 + 25, 'DIVE AGAIN [R]', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    });
    restartText.setOrigin(0.5, 0.5);
    
    // Make button interactive
    const hitArea = this.add.zone(GAME_CONFIG.width / 2, GAME_CONFIG.height * 0.7 + 25, 200, 50);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(won ? 0x00ccaa : 0xcc6666, 1);
      buttonBg.fillRoundedRect(GAME_CONFIG.width / 2 - 100, GAME_CONFIG.height * 0.7, 200, 50, 8);
    });
    
    hitArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(won ? 0x00aa88 : 0xaa4444, 1);
      buttonBg.fillRoundedRect(GAME_CONFIG.width / 2 - 100, GAME_CONFIG.height * 0.7, 200, 50, 8);
    });
    
    hitArea.on('pointerdown', () => {
      this.restartGame();
    });
    
    // Keyboard restart
    this.input.keyboard?.on('keydown-R', () => {
      this.restartGame();
    });
    
    // Message based on outcome
    const endMessage = won 
      ? 'Overseer Model-7: "System stable. Hope remains."'
      : 'Overseer Model-7: "Warning: Point of no return reached."';
    
    const msg = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height - 60, endMessage, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#556677',
      fontStyle: 'italic',
    });
    msg.setOrigin(0.5, 0.5);
  }

  private restartGame() {
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
