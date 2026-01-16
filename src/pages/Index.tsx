import { useState } from 'react';
import { GameIntro } from '@/components/GameIntro';
import { PhaserGame } from '@/game/PhaserGame';

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);

  if (!gameStarted) {
    return <GameIntro onStart={() => setGameStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center">
      <PhaserGame />
    </div>
  );
};

export default Index;
