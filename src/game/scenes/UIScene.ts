import Phaser from 'phaser';
import { GAME_CONFIG, PLAYER, GAME, OVERSEER } from '../constants';

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private apexMoneyText!: Phaser.GameObjects.Text;
  private messageLog!: Phaser.GameObjects.Text;
  private cooldownBar!: Phaser.GameObjects.Graphics;
  private overseerText!: Phaser.GameObjects.Text;
  
  private messages: string[] = [];
  private maxMessages: number = 4;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Health bar background
    const healthBarBg = this.add.graphics();
    healthBarBg.fillStyle(0x1a1a2e, 0.8);
    healthBarBg.fillRoundedRect(20, 20, 220, 40, 8);
    
    // Health bar
    this.healthBar = this.add.graphics();
    this.updateHealthBar(PLAYER.maxHealth);
    
    // Health text
    this.healthText = this.add.text(130, 30, 'ECHO HEALTH', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
    });
    this.healthText.setOrigin(0.5, 0);
    
    // Distance to sanctuary
    this.distanceText = this.add.text(GAME_CONFIG.width / 2, 30, 'SANCTUARY: 0m', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#00ffff',
    });
    this.distanceText.setOrigin(0.5, 0);
    
    // Apex money (top right)
    const apexBg = this.add.graphics();
    apexBg.fillStyle(0x2a0a0a, 0.8);
    apexBg.fillRoundedRect(GAME_CONFIG.width - 200, 20, 180, 50, 8);
    
    this.apexMoneyText = this.add.text(GAME_CONFIG.width - 110, 35, 'APEX: $0', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ff6666',
    });
    this.apexMoneyText.setOrigin(0.5, 0);
    
    // Overseer uses indicator
    this.overseerText = this.add.text(20, 70, `OVERSEER: ${OVERSEER.maxUses} uses`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#66aaff',
    });
    
    // Echolocation cooldown bar
    const cooldownBg = this.add.graphics();
    cooldownBg.fillStyle(0x1a1a2e, 0.8);
    cooldownBg.fillRoundedRect(20, 95, 120, 25, 4);
    
    this.cooldownBar = this.add.graphics();
    this.updateCooldownBar(1);
    
    const cooldownLabel = this.add.text(80, 100, 'ECHO [SPACE]', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    });
    cooldownLabel.setOrigin(0.5, 0);
    
    // Message log (bottom)
    const logBg = this.add.graphics();
    logBg.fillStyle(0x0a1520, 0.7);
    logBg.fillRoundedRect(20, GAME_CONFIG.height - 120, GAME_CONFIG.width - 40, 100, 8);
    
    this.messageLog = this.add.text(30, GAME_CONFIG.height - 110, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#aaddff',
      wordWrap: { width: GAME_CONFIG.width - 60 },
    });
    
    // Controls hint
    this.add.text(GAME_CONFIG.width - 20, GAME_CONFIG.height - 20, 'WASD: Move | SPACE: Echolocation', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#667788',
    }).setOrigin(1, 1);

    // Listen for updates from game scene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('uiUpdate', this.handleUIUpdate, this);
    gameScene.events.on('cooldownUpdate', this.updateCooldownBar, this);
    
    // Initial message
    this.addMessage('System: Welcome to the Silent Zone. Reach the Sanctuary to survive.');
    this.addMessage('Overseer Model-7: Monitoring initiated. Will intervene if critical.');
  }

  private handleUIUpdate(data: {
    health: number;
    distance: number;
    overseerUsesLeft: number;
    apexMoney: number;
    message?: string;
  }) {
    this.updateHealthBar(data.health);
    
    const remaining = GAME.sanctuaryDistance - data.distance;
    this.distanceText.setText(`SANCTUARY: ${Math.max(0, remaining)}m`);
    
    this.apexMoneyText.setText(`APEX: $${data.apexMoney}`);
    this.overseerText.setText(`OVERSEER: ${data.overseerUsesLeft} uses`);
    
    if (data.message) {
      this.addMessage(data.message);
    }
  }

  private updateHealthBar(health: number) {
    this.healthBar.clear();
    
    const percentage = Math.max(0, health / PLAYER.maxHealth);
    const width = 200 * percentage;
    
    // Color based on health
    let color = 0x00ff88;
    if (percentage < 0.3) color = 0xff4444;
    else if (percentage < 0.6) color = 0xffaa00;
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRoundedRect(30, 30, width, 20, 4);
  }

  private updateCooldownBar(progress: number) {
    this.cooldownBar.clear();
    
    const color = progress >= 1 ? 0x00ffff : 0x446688;
    this.cooldownBar.fillStyle(color, 1);
    this.cooldownBar.fillRoundedRect(25, 100, 110 * progress, 15, 3);
  }

  private addMessage(message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    this.messages.push(`[${timestamp}] ${message}`);
    
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
    
    this.messageLog.setText(this.messages.join('\n'));
  }
}
