import Phaser from 'phaser';
import { GAME_CONFIG, PLAYER, GAME, OVERSEER } from '../constants';

interface StoryBeat {
  distance: number;
  speaker: string;
  message: string;
}

export class UIScene extends Phaser.Scene {
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private apexMoneyText!: Phaser.GameObjects.Text;
  private messageLog!: Phaser.GameObjects.Text;
  private cooldownBar!: Phaser.GameObjects.Graphics;
  private cooldownBg!: Phaser.GameObjects.Graphics;
  private overseerText!: Phaser.GameObjects.Text;
  
  // Story display
  private storyContainer!: Phaser.GameObjects.Container;
  private storySpeaker!: Phaser.GameObjects.Text;
  private storyMessage!: Phaser.GameObjects.Text;
  private storyBg!: Phaser.GameObjects.Graphics;
  
  private messages: string[] = [];
  private maxMessages: number = 3;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // --- Health Bar Section ---
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x0a1a2a, 0.9);
    this.healthBarBg.fillRoundedRect(20, 20, 240, 50, 8);
    this.healthBarBg.lineStyle(2, 0x00ffff, 0.3);
    this.healthBarBg.strokeRoundedRect(20, 20, 240, 50, 8);
    
    this.healthBar = this.add.graphics();
    this.updateHealthBar(PLAYER.maxHealth);
    
    this.healthText = this.add.text(140, 28, 'ECHO VITALS', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#88cccc',
    });
    this.healthText.setOrigin(0.5, 0);
    
    // Health percentage
    this.add.text(230, 45, '100%', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00ff88',
    }).setName('healthPercent');
    
    // --- Distance Indicator ---
    const distBg = this.add.graphics();
    distBg.fillStyle(0x0a1a2a, 0.9);
    distBg.fillRoundedRect(GAME_CONFIG.width / 2 - 120, 15, 240, 55, 8);
    distBg.lineStyle(2, 0x00aaaa, 0.3);
    distBg.strokeRoundedRect(GAME_CONFIG.width / 2 - 120, 15, 240, 55, 8);
    
    this.add.text(GAME_CONFIG.width / 2, 28, 'SANCTUARY DISTANCE', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#66aaaa',
    }).setOrigin(0.5, 0);
    
    this.distanceText = this.add.text(GAME_CONFIG.width / 2, 48, '6000m', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffcc',
      fontStyle: 'bold',
    });
    this.distanceText.setOrigin(0.5, 0);
    
    // --- Apex Money (top right) ---
    const apexBg = this.add.graphics();
    apexBg.fillStyle(0x2a0a0a, 0.9);
    apexBg.fillRoundedRect(GAME_CONFIG.width - 200, 20, 180, 50, 8);
    apexBg.lineStyle(2, 0xff4444, 0.3);
    apexBg.strokeRoundedRect(GAME_CONFIG.width - 200, 20, 180, 50, 8);
    
    this.add.text(GAME_CONFIG.width - 110, 28, 'APEX INDUSTRIES', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#aa6666',
    }).setOrigin(0.5, 0);
    
    this.apexMoneyText = this.add.text(GAME_CONFIG.width - 110, 45, '$0', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ff6666',
      fontStyle: 'bold',
    });
    this.apexMoneyText.setOrigin(0.5, 0);
    
    // --- Overseer Status ---
    const overseerBg = this.add.graphics();
    overseerBg.fillStyle(0x0a1a2a, 0.8);
    overseerBg.fillRoundedRect(20, 80, 160, 30, 4);
    
    this.overseerText = this.add.text(28, 88, `⚡ OVERSEER: ${OVERSEER.maxUses} interventions`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#66aaff',
    });
    
    // --- Echolocation Cooldown ---
    this.cooldownBg = this.add.graphics();
    this.cooldownBg.fillStyle(0x0a1a2a, 0.8);
    this.cooldownBg.fillRoundedRect(20, 115, 160, 28, 4);
    this.cooldownBg.lineStyle(1, 0x00ffff, 0.2);
    this.cooldownBg.strokeRoundedRect(20, 115, 160, 28, 4);
    
    this.cooldownBar = this.add.graphics();
    this.updateCooldownBar(1);
    
    this.add.text(100, 122, '⟨ ECHO ⟩ [SPACE]', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaddff',
    }).setOrigin(0.5, 0);
    
    // --- Story Display (center-top) ---
    this.createStoryDisplay();
    
    // --- Message Log (bottom) ---
    const logBg = this.add.graphics();
    logBg.fillStyle(0x0a1520, 0.85);
    logBg.fillRoundedRect(20, GAME_CONFIG.height - 100, GAME_CONFIG.width - 40, 80, 8);
    logBg.lineStyle(1, 0x224466, 0.5);
    logBg.strokeRoundedRect(20, GAME_CONFIG.height - 100, GAME_CONFIG.width - 40, 80, 8);
    
    this.add.text(35, GAME_CONFIG.height - 92, 'SYSTEM LOG', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#446688',
    });
    
    this.messageLog = this.add.text(35, GAME_CONFIG.height - 78, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8899aa',
      wordWrap: { width: GAME_CONFIG.width - 80 },
      lineSpacing: 4,
    });
    
    // --- Controls hint ---
    this.add.text(GAME_CONFIG.width - 25, GAME_CONFIG.height - 12, '↑←↓→ or WASD: Move  |  SPACE: Echolocation', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#445566',
    }).setOrigin(1, 1);

    // Listen for updates from game scene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('uiUpdate', this.handleUIUpdate, this);
    gameScene.events.on('cooldownUpdate', this.updateCooldownBar, this);
    gameScene.events.on('storyBeat', this.showStoryBeat, this);
    
    // Initial messages
    this.addMessage('SYSTEM: Welcome to the Silent Zone. Year 2045.');
    this.addMessage('OVERSEER: Life form detected. Initiating observation protocol.');
  }

  private createStoryDisplay() {
    // Story text container (appears in center-top area)
    this.storyBg = this.add.graphics();
    this.storyBg.setAlpha(0);
    
    this.storySpeaker = this.add.text(GAME_CONFIG.width / 2, 100, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#00ffff',
      fontStyle: 'bold',
    });
    this.storySpeaker.setOrigin(0.5, 0.5);
    this.storySpeaker.setAlpha(0);
    
    this.storyMessage = this.add.text(GAME_CONFIG.width / 2, 130, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 600 },
    });
    this.storyMessage.setOrigin(0.5, 0.5);
    this.storyMessage.setAlpha(0);
  }

  private showStoryBeat(beat: StoryBeat) {
    // Speaker color based on who's talking
    let speakerColor = '#ffffff';
    switch(beat.speaker) {
      case 'ECHO': speakerColor = '#00ffcc'; break;
      case 'APEX': speakerColor = '#ff6666'; break;
      case 'OVERSEER': speakerColor = '#66aaff'; break;
      case 'SYSTEM': speakerColor = '#888888'; break;
    }
    
    this.storySpeaker.setText(`[ ${beat.speaker} ]`);
    this.storySpeaker.setColor(speakerColor);
    this.storyMessage.setText(`"${beat.message}"`);
    
    // Update background
    this.storyBg.clear();
    this.storyBg.fillStyle(0x0a1520, 0.9);
    const msgWidth = Math.max(300, this.storyMessage.width + 60);
    this.storyBg.fillRoundedRect(GAME_CONFIG.width / 2 - msgWidth / 2, 85, msgWidth, 70, 8);
    
    // Fade in
    this.tweens.add({
      targets: [this.storyBg, this.storySpeaker, this.storyMessage],
      alpha: 1,
      duration: 500,
      ease: 'Cubic.easeOut'
    });
    
    // Fade out after delay
    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: [this.storyBg, this.storySpeaker, this.storyMessage],
        alpha: 0,
        duration: 800,
        ease: 'Cubic.easeIn'
      });
    });
  }

  private handleUIUpdate(data: {
    health: number;
    distance: number;
    overseerUsesLeft: number;
    apexMoney: number;
    message?: string;
  }) {
    this.updateHealthBar(data.health);
    
    const remaining = Math.max(0, GAME.sanctuaryDistance - data.distance);
    this.distanceText.setText(`${remaining}m`);
    
    // Color based on proximity
    if (remaining < 1000) {
      this.distanceText.setColor('#00ff88');
    } else if (remaining < 3000) {
      this.distanceText.setColor('#00ffcc');
    }
    
    this.apexMoneyText.setText(`$${data.apexMoney}`);
    this.overseerText.setText(`⚡ OVERSEER: ${data.overseerUsesLeft} intervention${data.overseerUsesLeft !== 1 ? 's' : ''}`);
    
    if (data.message) {
      this.addMessage(data.message);
    }
  }

  private updateHealthBar(health: number) {
    this.healthBar.clear();
    
    const percentage = Math.max(0, health / PLAYER.maxHealth);
    const width = 210 * percentage;
    
    // Color based on health
    let color = 0x00ff88;
    if (percentage < 0.25) color = 0xff4444;
    else if (percentage < 0.5) color = 0xffaa00;
    else if (percentage < 0.75) color = 0xaaff00;
    
    // Background bar
    this.healthBar.fillStyle(0x1a2a3a, 1);
    this.healthBar.fillRoundedRect(30, 42, 210, 18, 4);
    
    // Health bar
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRoundedRect(30, 42, width, 18, 4);
    
    // Gloss effect
    this.healthBar.fillStyle(0xffffff, 0.1);
    this.healthBar.fillRoundedRect(30, 42, width, 6, 2);
    
    // Update percentage text
    const percentText = this.children.getByName('healthPercent') as Phaser.GameObjects.Text;
    if (percentText) {
      percentText.setText(`${Math.floor(percentage * 100)}%`);
      percentText.setColor(percentage < 0.25 ? '#ff4444' : (percentage < 0.5 ? '#ffaa00' : '#00ff88'));
    }
  }

  private updateCooldownBar(progress: number) {
    this.cooldownBar.clear();
    
    const isReady = progress >= 1;
    const color = isReady ? 0x00ffff : 0x224466;
    const glowColor = isReady ? 0x00ffff : 0x113344;
    
    // Progress bar
    this.cooldownBar.fillStyle(color, isReady ? 1 : 0.6);
    this.cooldownBar.fillRoundedRect(25, 120, 150 * progress, 18, 3);
    
    // Glow when ready
    if (isReady) {
      this.cooldownBar.lineStyle(2, glowColor, 0.5);
      this.cooldownBar.strokeRoundedRect(25, 120, 150, 18, 3);
    }
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
