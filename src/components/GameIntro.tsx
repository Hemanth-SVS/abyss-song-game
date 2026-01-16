import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface GameIntroProps {
  onStart: () => void;
}

export const GameIntro = ({ onStart }: GameIntroProps) => {
  const [showLore, setShowLore] = useState(false);

  return (
    <div className="min-h-screen bg-abyss flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-bioluminescent/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl text-center">
        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-bioluminescent mb-4 tracking-wider animate-glow">
          ABYSS
        </h1>
        <h2 className="text-3xl md:text-4xl font-light text-foreground/80 mb-2">
          EQUILIBRIUM
        </h2>
        <p className="text-muted-foreground text-lg mb-12 italic">
          Survival in the Age of Silence
        </p>

        {/* Year indicator */}
        <div className="text-destructive/80 text-sm mb-8 font-mono">
          YEAR 2045 • THE SILENT ZONE
        </div>

        {!showLore ? (
          <div className="space-y-4">
            <Button 
              onClick={onStart}
              variant="abyss"
              size="lg"
              className="text-xl px-12 py-6"
            >
              ENTER THE DEPTHS
            </Button>
            
            <div>
              <button 
                onClick={() => setShowLore(true)}
                className="text-muted-foreground hover:text-bioluminescent transition-colors text-sm underline"
              >
                Read the story first
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 text-left space-y-4 border border-bioluminescent/20">
            <h3 className="text-xl font-bold text-bioluminescent">THE TRIAD</h3>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="text-bioluminescent font-bold">ECHO</span> — The last of a bioluminescent sea turtle species. 
                Starving and confused, you must navigate through murky waters where plastic bags look exactly like jellyfish. 
                Your goal: reach the legendary Sanctuary.
              </p>
              
              <p>
                <span className="text-destructive font-bold">APEX INDUSTRIES</span> — A massive trawler above the surface. 
                They don't want to kill you, but their nets are huge and sorting costs money. 
                Every piece of waste they dump, every net they deploy, is another obstacle in your path.
              </p>
              
              <p>
                <span className="text-primary font-bold">OVERSEER MODEL-7</span> — A climate-monitoring drone that gained sentience. 
                It calculates that if the ocean dies, humanity dies. When your health is critical, 
                it will break its "Observe Only" protocol to save you.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-bold text-foreground mb-2">CONTROLS</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div><kbd className="kbd">WASD</kbd> or <kbd className="kbd">↑←↓→</kbd> Move</div>
                <div><kbd className="kbd">SPACE</kbd> Echolocation</div>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Use echolocation to reveal hidden hazards and food. Eat jellyfish to heal. Avoid plastic and nets.
              </p>
            </div>

            <Button 
              onClick={onStart}
              variant="abyss"
              size="lg"
              className="w-full mt-4"
            >
              BEGIN YOUR JOURNEY
            </Button>
          </div>
        )}

        {/* Credits */}
        <p className="text-xs text-muted-foreground/40 mt-12">
          A game about ocean pollution, acoustic disruption, and the fight for survival.
        </p>
      </div>
    </div>
  );
};
