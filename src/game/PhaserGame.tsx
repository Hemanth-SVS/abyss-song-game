import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { EndScene } from './scenes/EndScene';

interface PhaserGameProps {
  threatDetectionEnabled?: boolean;
}

export const PhaserGame = ({ threatDetectionEnabled = true }: PhaserGameProps) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
        parent: gameContainerRef.current,
        backgroundColor: '#0a1520',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, PreloadScene, GameScene, UIScene, EndScene],
      };

      gameRef.current = new Phaser.Game(config);
      
      // Pass threat detection setting to game registry
      gameRef.current.registry.set('threatDetectionEnabled', threatDetectionEnabled);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [threatDetectionEnabled]);

  return (
    <div 
      ref={gameContainerRef} 
      className="game-container"
    />
  );
};
