import Phaser from 'phaser';
import { GAME_CONFIG, PLAYER, HAZARDS, APEX, OVERSEER, GAME } from '../constants';

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
  
  private background!: Phaser.GameObjects.TileSprite;
  private apexShip!: Phaser.GameObjects.Sprite;
  private overseer!: Phaser.GameObjects.Sprite;
  private sanctuary!: Phaser.GameObjects.Sprite;
  
  private echolocationCircle!: Phaser.GameObjects.Graphics;
  private shieldCircle!: Phaser.GameObjects.Graphics;
  
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
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

    // Create background
    this.background = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'ocean_bg');
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0);
    
    // Add fog overlay effect
    const fogGraphics = this.add.graphics();
    fogGraphics.fillStyle(0x0a1520, 0.4);
    fogGraphics.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    fogGraphics.setScrollFactor(0);
    fogGraphics.setDepth(5);

    // Create sanctuary at the end
    this.sanctuary = this.add.sprite(GAME.sanctuaryDistance, GAME_CONFIG.height / 2, 'sanctuary');
    this.sanctuary.setScale(0.8);
    this.physics.add.existing(this.sanctuary, true);

    // Create Apex ship at top
    this.apexShip = this.add.sprite(GAME_CONFIG.width / 2, 40, 'apex_ship');
    this.apexShip.setScale(0.3);
    this.apexShip.setScrollFactor(0);
    this.apexShip.setDepth(10);
    
    // Create Overseer drone
    this.overseer = this.add.sprite(100, 100, 'overseer');
    this.overseer.setScale(0.15);
    this.overseer.setScrollFactor(0);
    this.overseer.setDepth(10);
    this.overseer.setAlpha(0.7);

    // Create player (Echo)
    this.player = this.physics.add.sprite(100, GAME_CONFIG.height / 2, 'echo');
    this.player.setScale(0.15);
    this.player.setCollideWorldBounds(false);
    this.player.setDepth(20);
    
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
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
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
  }

  private spawnInitialObjects() {
    // Spawn some initial plastics and jellyfish
    for (let i = 0; i < 10; i++) {
      this.spawnPlastic(Phaser.Math.Between(200, 1000));
    }
    for (let i = 0; i < 5; i++) {
      this.spawnJellyfish(Phaser.Math.Between(200, 1200));
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
      delay: 5000,
      callback: () => this.spawnJellyfish(),
      callbackScope: this,
      loop: true,
    });
  }

  private spawnPlastic(xOffset?: number) {
    const x = xOffset ?? this.player.x + GAME_CONFIG.width + Phaser.Math.Between(0, 200);
    const y = Phaser.Math.Between(50, GAME_CONFIG.height - 50);
    
    if (x < GAME.sanctuaryDistance) {
      const plastic = this.plastics.create(x, y, 'plastic') as Phaser.Physics.Arcade.Sprite;
      plastic.setScale(0.08);
      plastic.setVelocityX(-30);
      plastic.setAlpha(0.3); // Hidden until echolocation
      plastic.setData('revealed', false);
    }
  }

  private spawnJellyfish(xOffset?: number) {
    const x = xOffset ?? this.player.x + GAME_CONFIG.width + Phaser.Math.Between(0, 200);
    const y = Phaser.Math.Between(50, GAME_CONFIG.height - 50);
    
    if (x < GAME.sanctuaryDistance) {
      const jellyfish = this.jellyfishes.create(x, y, 'jellyfish') as Phaser.Physics.Arcade.Sprite;
      jellyfish.setScale(0.08);
      jellyfish.setVelocityX(-20);
      jellyfish.setVelocityY(Phaser.Math.Between(-20, 20));
      jellyfish.setAlpha(0.3); // Hidden until echolocation
      jellyfish.setData('revealed', false);
    }
  }

  private spawnNet() {
    if (this.gameData.isJammed || this.gameData.gameOver) return;
    
    const x = this.player.x + Phaser.Math.Between(100, 400);
    const y = Phaser.Math.Between(100, GAME_CONFIG.height - 100);
    
    if (x < GAME.sanctuaryDistance) {
      const net = this.nets.create(x, y, 'ghost_net') as Phaser.Physics.Arcade.Sprite;
      net.setScale(0.2);
      net.setAlpha(0.3);
      net.setData('revealed', false);
      
      this.gameData.apexMoney += 100;
      this.emitUIUpdate('Apex: Net deployed. Quota +$100');
    }
  }

  private hitPlastic(player: Phaser.GameObjects.GameObject, plastic: Phaser.GameObjects.GameObject) {
    if (this.gameData.isShielded || this.gameData.gameOver) return;
    
    this.takeDamage(HAZARDS.plasticDamage);
    (plastic as Phaser.Physics.Arcade.Sprite).destroy();
    
    this.gameData.apexMoney += 50;
    this.emitUIUpdate('Echo ate plastic! Apex: Waste disposal +$50');
    
    this.flashRed();
  }

  private eatJellyfish(player: Phaser.GameObjects.GameObject, jellyfish: Phaser.GameObjects.GameObject) {
    if (this.gameData.gameOver) return;
    
    this.gameData.health = Math.min(PLAYER.maxHealth, this.gameData.health + HAZARDS.jellyfishHeal);
    (jellyfish as Phaser.Physics.Arcade.Sprite).destroy();
    
    this.emitUIUpdate('Echo found real food! +' + HAZARDS.jellyfishHeal + ' HP');
    this.flashGreen();
  }

  private hitNet(player: Phaser.GameObjects.GameObject, net: Phaser.GameObjects.GameObject) {
    if (this.gameData.isShielded || this.gameData.gameOver) return;
    
    this.takeDamage(HAZARDS.netDamage);
    this.player.setVelocity(this.player.body!.velocity.x * HAZARDS.netSlowFactor, this.player.body!.velocity.y * HAZARDS.netSlowFactor);
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
    
    this.emitUIUpdate('Overseer: Protocol Sanctuary activated. Shield deployed.');
    
    // Visual feedback for overseer
    this.tweens.add({
      targets: this.overseer,
      alpha: 1,
      scale: 0.2,
      duration: 300,
      yoyo: true,
    });
    
    // Destroy nearby nets
    this.nets.getChildren().forEach((net) => {
      const netSprite = net as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, netSprite.x, netSprite.y);
      if (distance < PLAYER.echolocationRadius * 1.5) {
        netSprite.destroy();
      }
    });
    
    // Remove shield and jam after duration
    this.time.delayedCall(OVERSEER.shieldDuration, () => {
      this.gameData.isShielded = false;
      this.emitUIUpdate('Overseer: Shield depleted.');
    });
    
    this.time.delayedCall(OVERSEER.jamDuration, () => {
      this.gameData.isJammed = false;
      this.emitUIUpdate('Apex: Systems restored. Resuming operations.');
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
    this.netSpawnTimer.destroy();
    this.plasticSpawnTimer.destroy();
    this.jellyfishSpawnTimer.destroy();
    
    // Transition to end scene
    this.time.delayedCall(500, () => {
      this.scene.stop('UIScene');
      this.scene.start('EndScene', { won, distance: this.gameData.distance, apexMoney: this.gameData.apexMoney });
    });
  }

  private flashRed() {
    this.cameras.main.flash(200, 255, 50, 50);
  }

  private flashGreen() {
    this.cameras.main.flash(200, 50, 255, 100);
  }

  private performEcholocation() {
    if (!this.gameData.echolocationReady || this.gameData.gameOver) return;
    
    this.gameData.echolocationReady = false;
    this.lastEcholocationTime = this.time.now;
    
    // Reveal nearby objects
    const revealObjects = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((obj) => {
        const sprite = obj as Phaser.Physics.Arcade.Sprite;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
        if (distance < PLAYER.echolocationRadius) {
          sprite.setAlpha(1);
          sprite.setData('revealed', true);
          
          // Fade back after duration
          this.time.delayedCall(PLAYER.echolocationDuration, () => {
            if (sprite.active) {
              this.tweens.add({
                targets: sprite,
                alpha: 0.3,
                duration: 500,
              });
            }
          });
        }
      });
    };
    
    revealObjects(this.plastics);
    revealObjects(this.jellyfishes);
    revealObjects(this.nets);
    
    // Animate echolocation circle
    let radius = 0;
    const expandCircle = () => {
      this.echolocationCircle.clear();
      radius += 15;
      
      if (radius < PLAYER.echolocationRadius) {
        this.echolocationCircle.lineStyle(3, 0x00ffff, 1 - radius / PLAYER.echolocationRadius);
        this.echolocationCircle.strokeCircle(this.player.x, this.player.y, radius);
      }
    };
    
    const echoTimer = this.time.addEvent({
      delay: 20,
      callback: expandCircle,
      repeat: Math.floor(PLAYER.echolocationRadius / 15),
    });
    
    // Reset cooldown
    this.time.delayedCall(PLAYER.echolocationCooldown, () => {
      this.gameData.echolocationReady = true;
    });
    
    this.emitUIUpdate('Echolocation pulse sent...');
  }

  private emitUIUpdate(message: string) {
    this.events.emit('uiUpdate', { ...this.gameData, message });
  }

  update(time: number, delta: number) {
    if (this.gameData.gameOver) return;
    
    // Update distance
    this.gameData.distance = Math.floor(this.player.x);
    
    // Scroll background
    this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
    
    // Player movement
    let velocityX = 0;
    let velocityY = 0;
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -PLAYER.speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = PLAYER.speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -PLAYER.speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = PLAYER.speed;
    
    this.player.setVelocity(velocityX, velocityY);
    
    // Flip player based on direction
    if (velocityX < 0) this.player.setFlipX(true);
    if (velocityX > 0) this.player.setFlipX(false);
    
    // Echolocation
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performEcholocation();
    }
    
    // Update shield visual
    this.shieldCircle.clear();
    if (this.gameData.isShielded) {
      this.shieldCircle.lineStyle(4, 0x00ffff, 0.6);
      this.shieldCircle.strokeCircle(this.player.x, this.player.y, 60);
      this.shieldCircle.fillStyle(0x00ffff, 0.1);
      this.shieldCircle.fillCircle(this.player.x, this.player.y, 60);
    }
    
    // Update Apex ship position
    this.apexShip.x = GAME_CONFIG.width / 2 + Math.sin(time / 2000) * 100;
    
    // Update Overseer position to follow player loosely
    this.overseer.x = 80;
    this.overseer.y = 80 + Math.sin(time / 1000) * 10;
    
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
        if (sprite.x < this.player.x - 500) {
          sprite.destroy();
        }
      });
    };
    
    cleanupGroup(this.plastics);
    cleanupGroup(this.jellyfishes);
    cleanupGroup(this.nets);
  }
}
