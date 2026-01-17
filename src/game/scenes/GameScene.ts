import Phaser from 'phaser';
import { GAME_CONFIG, PLAYER, HAZARDS, APEX, OVERSEER, GAME, STORY_BEATS, THREAT_LEVELS } from '../constants';

interface GameData {
  health: number;
  distance: number;
  echolocationReady: boolean;
  overseerUsesLeft: number;
  apexMoney: number;
  isShielded: boolean;
  isJammed: boolean;
  gameOver: boolean;
  won: boolean;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private plastics!: Phaser.Physics.Arcade.Group;
  private jellyfishes!: Phaser.Physics.Arcade.Group;
  private nets!: Phaser.Physics.Arcade.Group;
  
  // Parallax backgrounds
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private fogOverlay!: Phaser.GameObjects.Graphics;
  
  private apexShip!: Phaser.GameObjects.Sprite;
  private overseer!: Phaser.GameObjects.Sprite;
  private sanctuary!: Phaser.GameObjects.Sprite;
  
  private echolocationCircle!: Phaser.GameObjects.Graphics;
  private shieldCircle!: Phaser.GameObjects.Graphics;
  
  // Particle systems
  private bubbleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private debrisEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private glowEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  // Player glow effect
  private playerGlow!: Phaser.GameObjects.Graphics;
  
  private gameData: GameData = {
    health: PLAYER.maxHealth,
    distance: 0,
    echolocationReady: true,
    overseerUsesLeft: OVERSEER.maxUses,
    apexMoney: 0,
    isShielded: false,
    isJammed: false,
    gameOver: false,
    won: false,
  };
  
  private lastEcholocationTime: number = 0;
  private netSpawnTimer!: Phaser.Time.TimerEvent;
  private plasticSpawnTimer!: Phaser.Time.TimerEvent;
  private jellyfishSpawnTimer!: Phaser.Time.TimerEvent;
  
  // Story system
  private triggeredStoryBeats: Set<number> = new Set();
  private lastStoryDistance: number = 0;
  
  // Threat detection system
  private currentThreatLevel: string = THREAT_LEVELS.LOW;
  private lastThreatWarning: number = 0;
  private threatWarningCooldown: number = 3000;
  private threatDetectionEnabled: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Get threat detection setting from registry
    this.threatDetectionEnabled = this.registry.get('threatDetectionEnabled') || false;
    
    // Reset game data
    this.gameData = {
      health: PLAYER.maxHealth,
      distance: 0,
      echolocationReady: true,
      overseerUsesLeft: OVERSEER.maxUses,
      apexMoney: 0,
      isShielded: false,
      isJammed: false,
      gameOver: false,
      won: false,
    };
    this.triggeredStoryBeats.clear();

    // Create parallax backgrounds
    this.createBackgrounds();
    
    // Create particle systems
    this.createParticles();

    // Create sanctuary at the end
    this.sanctuary = this.add.sprite(GAME.sanctuaryDistance, GAME_CONFIG.height / 2, 'sanctuary');
    this.sanctuary.setScale(1.2);
    this.sanctuary.setDepth(8);
    this.physics.add.existing(this.sanctuary, true);
    
    // Add glow effect to sanctuary
    this.tweens.add({
      targets: this.sanctuary,
      alpha: { from: 0.8, to: 1 },
      scale: { from: 1.15, to: 1.25 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Create Apex ship at top
    this.apexShip = this.add.sprite(GAME_CONFIG.width / 2, -50, 'apex_ship');
    this.apexShip.setScale(0.4);
    this.apexShip.setScrollFactor(0);
    this.apexShip.setDepth(12);
    this.apexShip.setAlpha(0.8);
    
    // Create Overseer drone
    this.overseer = this.add.sprite(100, 120, 'overseer');
    this.overseer.setScale(0.12);
    this.overseer.setScrollFactor(0);
    this.overseer.setDepth(12);
    this.overseer.setAlpha(0.9);
    
    // Overseer subtle animation
    this.tweens.add({
      targets: this.overseer,
      y: { from: 115, to: 125 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Create player glow effect
    this.playerGlow = this.add.graphics();
    this.playerGlow.setDepth(18);

    // Create player (Echo - 3D enhanced fish)
    this.player = this.physics.add.sprite(150, GAME_CONFIG.height / 2, 'fishy');
    this.player.setScale(0.18);
    this.player.setCollideWorldBounds(false);
    this.player.setDepth(20);
    this.player.setData('depth3D', 0); // Track 3D depth for perspective
    
    // Enhanced 3D-like swim animation with body rotation
    this.tweens.add({
      targets: this.player,
      scaleY: { from: 0.17, to: 0.19 },
      rotation: { from: -0.05, to: 0.05 }, // Add body rotation for realism
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Create a 3D fish visual representation
    this.createFishy3DVisual();

    // Create player (Echo - 3D fish)
    this.player = this.physics.add.sprite(150, GAME_CONFIG.height / 2, 'fishy');
    this.player.setScale(0.18);
    this.player.setCollideWorldBounds(false);
    this.player.setDepth(20);
    this.player.setData('depth3D', 0); // Track 3D depth for perspective
    
    // Enhanced 3D-like swim animation with body rotation
    this.tweens.add({
      targets: this.player,
      scaleY: { from: 0.17, to: 0.19 },
      rotation: { from: -0.05, to: 0.05 }, // Add body rotation for realism
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Create groups for hazards
    this.plastics = this.physics.add.group();
    this.jellyfishes = this.physics.add.group();
    this.nets = this.physics.add.group();

    // Create echolocation circle
    this.echolocationCircle = this.add.graphics();
    this.echolocationCircle.setDepth(15);
    
    // Create shield circle
    this.shieldCircle = this.add.graphics();
    this.shieldCircle.setDepth(19);

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, GAME.sanctuaryDistance + 500, GAME_CONFIG.height);
    this.physics.world.setBounds(0, 0, GAME.sanctuaryDistance + 500, GAME_CONFIG.height);
    this.player.setCollideWorldBounds(true);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Setup collisions
    this.physics.add.overlap(this.player, this.plastics, this.hitPlastic as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.jellyfishes, this.eatJellyfish as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.nets, this.hitNet as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.sanctuary, this.reachSanctuary as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    // Start spawning hazards
    this.startSpawning();

    // Spawn initial objects
    this.spawnInitialObjects();
    
    // Trigger initial story beat
    this.time.delayedCall(500, () => {
      this.triggerStoryBeat(0);
    });
  }

  private createBackgrounds() {
    // Far background - slowest parallax
    this.bgFar = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'ocean_bg_far');
    this.bgFar.setOrigin(0, 0);
    this.bgFar.setScrollFactor(0);
    this.bgFar.setDepth(0);
    
    // Mid background - medium parallax
    this.bgMid = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'ocean_bg_mid');
    this.bgMid.setOrigin(0, 0);
    this.bgMid.setScrollFactor(0);
    this.bgMid.setDepth(1);
    this.bgMid.setAlpha(0.7);
    
    // Fog overlay for murky water effect
    this.fogOverlay = this.add.graphics();
    this.fogOverlay.setScrollFactor(0);
    this.fogOverlay.setDepth(25);
    this.updateFogOverlay();
  }
  
  private updateFogOverlay() {
    this.fogOverlay.clear();
    
    // Gradient fog from edges
    const gradient = this.fogOverlay;
    
    // Top fog
    for (let i = 0; i < 80; i++) {
      const alpha = 0.4 * (1 - i / 80);
      gradient.fillStyle(0x0a1520, alpha);
      gradient.fillRect(0, i, GAME_CONFIG.width, 1);
    }
    
    // Bottom fog
    for (let i = 0; i < 80; i++) {
      const alpha = 0.4 * (1 - i / 80);
      gradient.fillStyle(0x0a1520, alpha);
      gradient.fillRect(0, GAME_CONFIG.height - i, GAME_CONFIG.width, 1);
    }
    
    // Vignette effect
    gradient.fillStyle(0x0a1520, 0.15);
    gradient.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
  }

  private createParticles() {
    // Create bubble particle texture
    const bubbleTexture = this.add.graphics();
    bubbleTexture.fillStyle(0x88ccff, 1);
    bubbleTexture.fillCircle(4, 4, 4);
    bubbleTexture.generateTexture('bubble', 8, 8);
    bubbleTexture.destroy();
    
    // Create debris particle texture
    const debrisTexture = this.add.graphics();
    debrisTexture.fillStyle(0x446666, 1);
    debrisTexture.fillRect(0, 0, 3, 3);
    debrisTexture.generateTexture('debris', 3, 3);
    debrisTexture.destroy();
    
    // Create glow particle texture
    const glowTexture = this.add.graphics();
    glowTexture.fillStyle(0x00ffff, 1);
    glowTexture.fillCircle(6, 6, 6);
    glowTexture.generateTexture('glow', 12, 12);
    glowTexture.destroy();
    
    // Bubble emitter - follows player
    this.bubbleEmitter = this.add.particles(0, 0, 'bubble', {
      speed: { min: 20, max: 50 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      frequency: 200,
      quantity: 1,
    });
    this.bubbleEmitter.setDepth(21);
    
    // Debris emitter - ambient particles
    this.debrisEmitter = this.add.particles(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 'debris', {
      speed: { min: 5, max: 20 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 5000,
      frequency: 300,
      quantity: 2,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-GAME_CONFIG.width/2, -GAME_CONFIG.height/2, GAME_CONFIG.width, GAME_CONFIG.height)
      }
    });
    this.debrisEmitter.setDepth(4);
    this.debrisEmitter.setScrollFactor(0);
    
    // Glow emitter for bioluminescence
    this.glowEmitter = this.add.particles(0, 0, 'glow', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 1500,
      frequency: 400,
      quantity: 1,
      tint: [0x00ffff, 0x00ffaa, 0x00aaff],
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-GAME_CONFIG.width/2, -GAME_CONFIG.height/2, GAME_CONFIG.width, GAME_CONFIG.height)
      }
    });
    this.glowEmitter.setDepth(3);
    this.glowEmitter.setScrollFactor(0);
  }

  private spawnInitialObjects() {
    for (let i = 0; i < 30; i++) {
      this.spawnPlastic(Phaser.Math.Between(300, 1200));
    }
    for (let i = 0; i < 15; i++) {
      this.spawnJellyfish(Phaser.Math.Between(250, 1400));
    }
    for (let i = 0; i < 10; i++) {
      this.spawnNet();
    }
  }

  private startSpawning() {
    this.netSpawnTimer = this.time.addEvent({
      delay: APEX.netSpawnInterval,
      callback: this.spawnNet,
      callbackScope: this,
      loop: true,
    });

    this.plasticSpawnTimer = this.time.addEvent({
      delay: APEX.plasticSpawnInterval,
      callback: () => this.spawnPlastic(),
      callbackScope: this,
      loop: true,
    });

    this.jellyfishSpawnTimer = this.time.addEvent({
      delay: 4500,
      callback: () => this.spawnJellyfish(),
      callbackScope: this,
      loop: true,
    });
  }

  private spawnPlastic(xOffset?: number) {
    const x = xOffset ?? this.player.x + GAME_CONFIG.width + Phaser.Math.Between(50, 300);
    const y = Phaser.Math.Between(80, GAME_CONFIG.height - 80);
    
    if (x < GAME.sanctuaryDistance - 200) {
      const plastic = this.plastics.create(x, y, 'plastic') as Phaser.Physics.Arcade.Sprite;
      plastic.setScale(0.12);
      plastic.setVelocityX(Phaser.Math.Between(-40, -20));
      plastic.setVelocityY(Phaser.Math.Between(-15, 15));
      plastic.setAlpha(0.2);
      plastic.setData('revealed', false);
      plastic.setDepth(6);
      
      // Gentle floating animation
      this.tweens.add({
        targets: plastic,
        y: y + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private spawnJellyfish(xOffset?: number) {
    const x = xOffset ?? this.player.x + GAME_CONFIG.width + Phaser.Math.Between(50, 300);
    const y = Phaser.Math.Between(100, GAME_CONFIG.height - 100);
    
    if (x < GAME.sanctuaryDistance - 200) {
      const jellyfish = this.jellyfishes.create(x, y, 'jellyfish') as Phaser.Physics.Arcade.Sprite;
      jellyfish.setScale(0.1);
      jellyfish.setVelocityX(Phaser.Math.Between(-30, -15));
      jellyfish.setVelocityY(Phaser.Math.Between(-10, 10));
      jellyfish.setAlpha(0.25);
      jellyfish.setData('revealed', false);
      jellyfish.setData('avoidanceRadius', 100); // Detection radius for nets
      jellyfish.setData('lastAvoidTime', 0);
      jellyfish.setDepth(6);
      
      // Pulsing animation for jellyfish
      this.tweens.add({
        targets: jellyfish,
        scaleY: 0.12,
        scaleX: 0.09,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private spawnNet() {
    if (this.gameData.isJammed || this.gameData.gameOver) return;
    
    const x = this.player.x + Phaser.Math.Between(150, 500);
    const y = Phaser.Math.Between(120, GAME_CONFIG.height - 120);
    
    if (x < GAME.sanctuaryDistance - 300) {
      const net = this.nets.create(x, y, 'ghost_net') as Phaser.Physics.Arcade.Sprite;
      net.setScale(0.5); // More visible size
      net.setAlpha(0.6); // More opaque
      net.setData('revealed', false);
      net.setData('avoidanceRadius', 120); // Radius for AI to detect and avoid
      net.setDepth(7);
      
      // Make nets static (don't drift)
      net.setImmovable(true);
      
      // Drifting animation
      this.tweens.add({
        targets: net,
        rotation: 0.2,
        duration: 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.gameData.apexMoney += 100;
      this.emitUIUpdate('APEX: Fishnet deployed. Quota +$100');
    }
  }

  private hitPlastic(player: Phaser.GameObjects.GameObject, plastic: Phaser.GameObjects.GameObject) {
    if (this.gameData.isShielded || this.gameData.gameOver) return;
    
    this.takeDamage(HAZARDS.plasticDamage);
    
    // Impact effect
    const sprite = plastic as Phaser.Physics.Arcade.Sprite;
    this.cameras.main.shake(100, 0.01);
    
    // Burst particles on impact
    const burst = this.add.particles(sprite.x, sprite.y, 'debris', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8,
    });
    burst.setDepth(22);
    this.time.delayedCall(600, () => burst.destroy());
    
    sprite.destroy();
    
    this.gameData.apexMoney += 50;
    this.emitUIUpdate('ECHO ate plastic! APEX: +$50');
    
    this.flashRed();
  }

  private eatJellyfish(player: Phaser.GameObjects.GameObject, jellyfish: Phaser.GameObjects.GameObject) {
    if (this.gameData.gameOver) return;
    
    this.gameData.health = Math.min(PLAYER.maxHealth, this.gameData.health + HAZARDS.jellyfishHeal);
    
    const sprite = jellyfish as Phaser.Physics.Arcade.Sprite;
    
    // Healing particle effect
    const healBurst = this.add.particles(sprite.x, sprite.y, 'glow', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      quantity: 12,
      tint: 0x00ff88,
    });
    healBurst.setDepth(22);
    this.time.delayedCall(900, () => healBurst.destroy());
    
    sprite.destroy();
    
    this.emitUIUpdate('ECHO: Found real food! +' + HAZARDS.jellyfishHeal + ' HP');
    this.flashGreen();
  }

  private hitNet(player: Phaser.GameObjects.GameObject, net: Phaser.GameObjects.GameObject) {
    if (this.gameData.isShielded || this.gameData.gameOver) return;
    
    this.takeDamage(HAZARDS.netDamage);
    this.player.setVelocity(this.player.body!.velocity.x * HAZARDS.netSlowFactor, this.player.body!.velocity.y * HAZARDS.netSlowFactor);
    this.cameras.main.shake(50, 0.005);
  }

  private takeDamage(amount: number) {
    this.gameData.health -= amount;
    
    if (this.gameData.health <= 0) {
      this.gameOver(false);
    } else if (this.gameData.health <= OVERSEER.activationHealthThreshold && this.gameData.overseerUsesLeft > 0) {
      this.activateOverseer();
    }
  }

  private activateOverseer() {
    if (this.gameData.overseerUsesLeft <= 0) return;
    
    this.gameData.overseerUsesLeft--;
    this.gameData.isShielded = true;
    this.gameData.isJammed = true;
    
    this.emitUIUpdate('OVERSEER: Breaking protocol. Activating Sanctuary Shield.');
    
    // Visual feedback for overseer activation
    this.tweens.add({
      targets: this.overseer,
      alpha: 1,
      scale: 0.18,
      duration: 300,
      yoyo: true,
      repeat: 2,
    });
    
    // Screen flash
    this.cameras.main.flash(300, 0, 200, 255);
    
    // Destroy nearby nets
    this.nets.getChildren().forEach((net) => {
      const netSprite = net as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, netSprite.x, netSprite.y);
      if (distance < PLAYER.echolocationRadius * 1.5) {
        // Destruction effect
        const destroyBurst = this.add.particles(netSprite.x, netSprite.y, 'glow', {
          speed: { min: 50, max: 100 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.6, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 600,
          quantity: 15,
          tint: 0x00aaff,
        });
        destroyBurst.setDepth(22);
        this.time.delayedCall(700, () => destroyBurst.destroy());
        
        netSprite.destroy();
      }
    });
    
    // Remove shield and jam after duration
    this.time.delayedCall(OVERSEER.shieldDuration, () => {
      this.gameData.isShielded = false;
      this.emitUIUpdate('OVERSEER: Shield depleted. Resume caution.');
    });
    
    this.time.delayedCall(OVERSEER.jamDuration, () => {
      this.gameData.isJammed = false;
      this.emitUIUpdate('APEX: Systems restored. Resuming operations.');
    });
  }

  private reachSanctuary() {
    if (!this.gameData.gameOver) {
      this.gameOver(true);
    }
  }

  private gameOver(won: boolean) {
    this.gameData.gameOver = true;
    this.gameData.won = won;
    
    // Stop all timers
    this.netSpawnTimer?.destroy();
    this.plasticSpawnTimer?.destroy();
    this.jellyfishSpawnTimer?.destroy();
    
    if (won) {
      // Victory effects
      this.cameras.main.flash(500, 0, 255, 200);
      this.emitUIUpdate('ECHO: I made it... The Sanctuary is real.');
    } else {
      // Death effects
      this.cameras.main.shake(500, 0.02);
      this.emitUIUpdate('ECHO: The silence... it\'s everywhere now...');
    }
    
    // Transition to end scene
    this.time.delayedCall(1500, () => {
      this.scene.stop('UIScene');
      this.scene.start('EndScene', { won, distance: this.gameData.distance, apexMoney: this.gameData.apexMoney });
    });
  }

  private flashRed() {
    this.cameras.main.flash(150, 255, 50, 50);
  }

  private flashGreen() {
    this.cameras.main.flash(150, 50, 255, 100);
  }

  private performEcholocation() {
    if (!this.gameData.echolocationReady || this.gameData.gameOver) return;
    
    this.gameData.echolocationReady = false;
    this.lastEcholocationTime = this.time.now;
    
    // Screen effect
    this.cameras.main.flash(100, 0, 200, 255);
    
    // Reveal nearby objects
    const revealObjects = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((obj) => {
        const sprite = obj as Phaser.Physics.Arcade.Sprite;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
        if (distance < PLAYER.echolocationRadius) {
          // Instant reveal with glow
          this.tweens.add({
            targets: sprite,
            alpha: 1,
            duration: 200,
            ease: 'Cubic.easeOut'
          });
          sprite.setData('revealed', true);
          
          // Fade back after duration
          this.time.delayedCall(PLAYER.echolocationDuration, () => {
            if (sprite.active) {
              this.tweens.add({
                targets: sprite,
                alpha: 0.2,
                duration: 800,
              });
            }
          });
        }
      });
    };
    
    revealObjects(this.plastics);
    revealObjects(this.jellyfishes);
    revealObjects(this.nets);
    
    // Animate echolocation circle with multiple rings
    let radius = 0;
    const expandCircle = () => {
      this.echolocationCircle.clear();
      radius += 20;
      
      if (radius < PLAYER.echolocationRadius) {
        const alpha = 1 - radius / PLAYER.echolocationRadius;
        
        // Main ring
        this.echolocationCircle.lineStyle(4, 0x00ffff, alpha);
        this.echolocationCircle.strokeCircle(this.player.x, this.player.y, radius);
        
        // Inner echo
        if (radius > 40) {
          this.echolocationCircle.lineStyle(2, 0x00aaff, alpha * 0.5);
          this.echolocationCircle.strokeCircle(this.player.x, this.player.y, radius - 30);
        }
      }
    };
    
    this.time.addEvent({
      delay: 15,
      callback: expandCircle,
      repeat: Math.floor(PLAYER.echolocationRadius / 20),
    });
    
    // Reset cooldown
    this.time.delayedCall(PLAYER.echolocationCooldown, () => {
      this.gameData.echolocationReady = true;
    });
    
    this.emitUIUpdate('ECHO: ...listening...');
  }
  
  private triggerStoryBeat(distance: number) {
    const beat = STORY_BEATS.find(b => b.distance === distance);
    if (beat && !this.triggeredStoryBeats.has(distance)) {
      this.triggeredStoryBeats.add(distance);
      this.events.emit('storyBeat', beat);
    }
  }
  
  private checkStoryBeats() {
    const currentDistance = Math.floor(this.gameData.distance);
    
    // Check for new story beats
    for (const beat of STORY_BEATS) {
      if (currentDistance >= beat.distance && !this.triggeredStoryBeats.has(beat.distance)) {
        this.triggerStoryBeat(beat.distance);
        break; // Only trigger one at a time
      }
    }
  }

  private emitUIUpdate(message: string) {
    this.events.emit('uiUpdate', { ...this.gameData, message });
  }

  update(time: number, delta: number) {
    if (this.gameData.gameOver) return;
    
    // Update threat detection
    this.updateThreatDetection(time);
    
    // Update jellyfish avoidance behavior
    this.updateJellyfishAvoidance();
    
    // Update distance
    this.gameData.distance = Math.floor(this.player.x);
    
    // Parallax scrolling - different speeds for depth
    const scrollX = this.cameras.main.scrollX;
    this.bgFar.tilePositionX = scrollX * 0.2;
    this.bgMid.tilePositionX = scrollX * 0.5;
    
    // Update bubble emitter position
    this.bubbleEmitter.setPosition(this.player.x - 20, this.player.y + 10);
    
    // Player movement
    let velocityX = 0;
    let velocityY = 0;
    let depth3D = 0; // Track 3D depth movement
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -PLAYER.speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = PLAYER.speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -PLAYER.speed;
      depth3D = -20; // Move up = move forward in 3D space (increase depth)
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = PLAYER.speed;
      depth3D = 20; // Move down = move backward in 3D space (decrease depth)
    }
    
    this.player.setVelocity(velocityX, velocityY);
    
    // Apply 3D depth effect - scale changes based on depth
    const currentDepth3D = this.player.getData('depth3D') || 0;
    const newDepth3D = currentDepth3D + depth3D * 0.01;
    this.player.setData('depth3D', newDepth3D);
    
    // Perspective scaling - fish gets larger as it moves toward camera (up)
    const depthScale = 1 + (newDepth3D * 0.005); // Max 0.5% scale change per depth unit
    const clampedDepthScale = Phaser.Math.Clamp(depthScale, 0.12, 0.28); // Constrain scale
    this.player.setScale(clampedDepthScale);
    
    // Adjust alpha for depth perception
    const depthAlpha = 0.7 + (newDepth3D * 0.001); // Opacity changes with depth
    this.player.setAlpha(Phaser.Math.Clamp(depthAlpha, 0.5, 1));
    
    // Flip player based on direction
    if (velocityX < 0) this.player.setFlipX(true);
    if (velocityX > 0) this.player.setFlipX(false);
    
    // Player glow effect with 3D depth
    this.playerGlow.clear();
    const glowAlpha = 0.15 + Math.sin(time / 500) * 0.1 + (newDepth3D * 0.001);
    this.playerGlow.fillStyle(0x00ffff, glowAlpha);
    const glowRadius = 35 + Math.sin(time / 300) * 5 + (newDepth3D * 0.05);
    this.playerGlow.fillCircle(this.player.x, this.player.y, glowRadius);
    
    // Echolocation
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performEcholocation();
    }
    
    // Update shield visual
    this.shieldCircle.clear();
    if (this.gameData.isShielded) {
      const shieldPulse = Math.sin(time / 100) * 0.2 + 0.6;
      this.shieldCircle.lineStyle(5, 0x00ffff, shieldPulse);
      this.shieldCircle.strokeCircle(this.player.x, this.player.y, 70);
      this.shieldCircle.fillStyle(0x00ffff, 0.1);
      this.shieldCircle.fillCircle(this.player.x, this.player.y, 70);
    }
    
    // Update Apex ship position with wave motion
    this.apexShip.x = GAME_CONFIG.width / 2 + Math.sin(time / 2500) * 150;
    this.apexShip.y = -40 + Math.sin(time / 1500) * 10;
    
    // Check story beats
    this.checkStoryBeats();
    
    // Clean up off-screen objects
    this.cleanupObjects();
    
    // Emit UI update
    this.events.emit('uiUpdate', { ...this.gameData });
    
    // Calculate echolocation cooldown
    const cooldownProgress = this.gameData.echolocationReady ? 1 : 
      Math.min(1, (time - this.lastEcholocationTime) / PLAYER.echolocationCooldown);
    this.events.emit('cooldownUpdate', cooldownProgress);
  }

  private cleanupObjects() {
    const cleanupGroup = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((obj) => {
        const sprite = obj as Phaser.Physics.Arcade.Sprite;
        if (sprite.x < this.player.x - 600) {
          sprite.destroy();
        }
      });
    };
    
    cleanupGroup(this.plastics);
    cleanupGroup(this.jellyfishes);
    cleanupGroup(this.nets);
  }

  private updateThreatDetection(time: number) {
    // Threat detection always runs
    // Detect ALL hazards in a wide area
    const detectionRange = 1000; // Wide detection range for early warning
    
    // Count all obstacles near player
    let nearbyNets = 0;
    let nearbyPlastics = 0;
    let totalHazards = 0;
    let closestThreat = Infinity;
    
    // Detect nets (fishnets - major threat)
    this.nets.getChildren().forEach((netObj) => {
      const net = netObj as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, net.x, net.y);
      if (distance < detectionRange) {
        nearbyNets++;
        totalHazards++;
        closestThreat = Math.min(closestThreat, distance);
      }
    });
    
    // Detect plastics (waste hazard)
    this.plastics.getChildren().forEach((plasticObj) => {
      const plastic = plasticObj as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, plastic.x, plastic.y);
      if (distance < detectionRange) {
        nearbyPlastics++;
        totalHazards++;
        closestThreat = Math.min(closestThreat, distance);
      }
    });
    
    // Calculate threat level based on proximity and count
    let newThreatLevel = THREAT_LEVELS.LOW;
    let threatMessage = '';
    
    // Lower thresholds for easier threat escalation
    if (totalHazards >= 12) {
      newThreatLevel = THREAT_LEVELS.CRITICAL;
      threatMessage = '⚠ CRITICAL: DANGER! Multiple traps ahead - IMMEDIATE EVASION!';
    } else if (totalHazards >= 8) {
      newThreatLevel = THREAT_LEVELS.HIGH;
      threatMessage = '⚠ HIGH THREAT: Dense hazard zone detected - Multiple nets and waste!';
    } else if (totalHazards >= 4) {
      newThreatLevel = THREAT_LEVELS.MEDIUM;
      threatMessage = '⚠ CAUTION: Multiple hazards detected ahead.';
    } else if (totalHazards >= 2) {
      newThreatLevel = THREAT_LEVELS.LOW;
      threatMessage = '• Hazards detected nearby.';
    } else {
      newThreatLevel = THREAT_LEVELS.LOW;
      threatMessage = '• Sensors clear.';
    }
    
    // Update threat level
    this.currentThreatLevel = newThreatLevel;
    
    // Emit threat update constantly for real-time detection
    if (time - this.lastThreatWarning > 100) { // Every 100ms for smooth updates
      this.lastThreatWarning = time;
      this.events.emit('threatUpdate', {
        level: newThreatLevel,
        message: threatMessage,
        nearbyNets,
        nearbyPlastics,
        totalThreat: totalHazards,
        closestThreat: closestThreat === Infinity ? -1 : Math.floor(closestThreat)
      });
    }
  }


  private updateJellyfishAvoidance() {
    // Get all nets as an array for easier iteration
    const nets = this.nets.getChildren() as Phaser.Physics.Arcade.Sprite[];
    
    // Update each jellyfish's avoidance behavior
    this.jellyfishes.getChildren().forEach((jellyfishObj) => {
      const jellyfish = jellyfishObj as Phaser.Physics.Arcade.Sprite;
      const avoidanceRadius = jellyfish.getData('avoidanceRadius') as number;
      
      // Check if any net is within avoidance radius
      let hasNearbyNet = false;
      let netToAvoid: Phaser.Physics.Arcade.Sprite | null = null;
      
      for (const net of nets) {
        const distance = Phaser.Math.Distance.Between(
          jellyfish.x, jellyfish.y,
          net.x, net.y
        );
        
        if (distance < avoidanceRadius) {
          hasNearbyNet = true;
          netToAvoid = net;
          break; // Avoid closest net
        }
      }
      
      // Apply avoidance behavior
      if (hasNearbyNet && netToAvoid) {
        // Calculate escape vector (away from net)
        const angle = Phaser.Math.Angle.Between(
          netToAvoid.x, netToAvoid.y,
          jellyfish.x, jellyfish.y
        );
        
        // Get current velocity
        const currentVelX = jellyfish.body!.velocity.x;
        const currentVelY = jellyfish.body!.velocity.y;
        
        // Blend avoidance with current direction (stronger avoidance = more blending)
        const avoidanceForce = 80;
        const avoidVelX = Math.cos(angle) * avoidanceForce;
        const avoidVelY = Math.sin(angle) * avoidanceForce;
        
        // Mix avoidance with natural movement (30% avoidance, 70% natural)
        jellyfish.setVelocity(
          currentVelX * 0.7 + avoidVelX * 0.3,
          currentVelY * 0.7 + avoidVelY * 0.3
        );
        
        jellyfish.setData('lastAvoidTime', Date.now());
      } else {
        // Resume natural drifting if no nets nearby
        const lastAvoidTime = jellyfish.getData('lastAvoidTime') as number;
        
        // Gradually return to natural movement if not avoiding
        if (Date.now() - lastAvoidTime > 500) {
          // Keep current velocity as is for natural drift
        }
      }
      
      // Keep jellyfish in bounds
      const y = jellyfish.y;
      if (y < 50) {
        jellyfish.setVelocityY(Math.abs(jellyfish.body!.velocity.y));
      } else if (y > GAME_CONFIG.height - 50) {
        jellyfish.setVelocityY(-Math.abs(jellyfish.body!.velocity.y));
      }
    });
  }

  private createFishy3DVisual() {
    // Create a 3D-styled fish visual overlay
    const fishyGraphics = this.add.graphics();
    fishyGraphics.setDepth(19);
    
    // Update the visual every frame to match player position and 3D state
    this.events.on('update', () => {
      fishyGraphics.clear();
      
      const x = this.player.x;
      const y = this.player.y;
      const depth3D = this.player.getData('depth3D') || 0;
      const scale = this.player.scale;
      
      // Draw 3D fish body with perspective
      const bodyLength = 30 * scale;
      const bodyHeight = 15 * scale;
      
      // Main body (more pronounced with 3D effect)
      fishyGraphics.fillStyle(0x00ccff, 0.9);
      fishyGraphics.beginPath();
      // Fish head (pointed)
      fishyGraphics.moveTo(x - bodyLength / 2, y);
      // Top back
      fishyGraphics.lineTo(x + bodyLength / 2, y - bodyHeight / 2);
      // Bottom back
      fishyGraphics.lineTo(x + bodyLength / 2, y + bodyHeight / 2);
      fishyGraphics.closePath();
      fishyGraphics.fillPath();
      
      // Add fin effect
      fishyGraphics.fillStyle(0x00ffff, 0.6);
      fishyGraphics.beginPath();
      fishyGraphics.arc(x + bodyLength / 3, y, bodyHeight / 3, 0, Math.PI * 2);
      fishyGraphics.fillPath();
      
      // Eye highlight for 3D effect
      fishyGraphics.fillStyle(0xffffff, 0.8);
      fishyGraphics.fillCircle(x - bodyLength / 4, y - bodyHeight / 4, 3 * scale);
      fishyGraphics.fillStyle(0x000000, 0.9);
      fishyGraphics.fillCircle(x - bodyLength / 4, y - bodyHeight / 4, 1.5 * scale);
    });
  }
}
