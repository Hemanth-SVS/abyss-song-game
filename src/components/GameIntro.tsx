import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GameIntroProps {
  onStart: () => void;
}

const TypewriterText = ({ text, delay = 30, onComplete }: { text: string; delay?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <span>{displayedText}<span className="animate-pulse">|</span></span>;
};

export const GameIntro = ({ onStart }: GameIntroProps) => {
  const [phase, setPhase] = useState<'title' | 'lore' | 'characters' | 'ready'>('title');
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const advancePhase = () => {
    if (phase === 'title') setPhase('lore');
    else if (phase === 'lore') setPhase('characters');
    else if (phase === 'characters') setPhase('ready');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--abyss))] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: `hsl(180, 100%, ${50 + Math.random() * 30}%, ${0.2 + Math.random() * 0.3})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--abyss-deep))] via-transparent to-[hsl(var(--abyss-deep))] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--abyss-deep))] via-transparent to-[hsl(var(--abyss-deep))] opacity-40" />

      <div className="relative z-10 max-w-4xl w-full text-center">
        {phase === 'title' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <p className="text-[hsl(var(--destructive))] text-sm font-mono tracking-widest">
                YEAR 2045 • THE SILENT ZONE
              </p>
              <h1 className="text-7xl md:text-8xl font-serif font-bold text-[hsl(var(--bioluminescent))] tracking-wider glow">
                ABYSS
              </h1>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground/80 tracking-wide">
                EQUILIBRIUM
              </h2>
            </div>
            
            <p className="text-[hsl(var(--muted-foreground))] text-lg italic font-serif">
              Survival in the Age of Silence
            </p>

            <div className="pt-8">
              <Button 
                onClick={advancePhase}
                variant="abyss"
                size="lg"
                className="text-lg px-10 py-6 font-serif"
              >
                BEGIN TRANSMISSION
              </Button>
            </div>
          </div>
        )}

        {phase === 'lore' && (
          <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            <p className="text-[hsl(var(--bioluminescent))] text-xs font-mono tracking-widest">
              // TRANSMISSION INCOMING
            </p>
            
            <div className="bg-[hsl(var(--card))]/50 backdrop-blur-sm rounded-lg p-8 border border-[hsl(var(--bioluminescent))]/20 text-left space-y-6">
              <p className="text-[hsl(var(--foreground))]/90 font-serif text-lg leading-relaxed">
                <TypewriterText 
                  text="The ocean is no longer blue. It is a murky grey. The Great Pacific Garbage Patch has grown into a solid continent of trash—The Plastic Crust."
                  delay={25}
                />
              </p>
              
              <p className="text-[hsl(var(--foreground))]/70 font-serif leading-relaxed">
                Beneath this crust, the sun rarely shines. The water is filled with the deafening roar of ship engines. 
                In this dying world, three forces are locked in a battle for the future.
              </p>
            </div>

            <Button 
              onClick={advancePhase}
              variant="abyss"
              size="lg"
              className="font-serif"
            >
              CONTINUE
            </Button>
          </div>
        )}

        {phase === 'characters' && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-[hsl(var(--bioluminescent))] text-xs font-mono tracking-widest">
              // THE TRIAD
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 text-left">
              {/* Echo */}
              <div className="bg-[hsl(var(--card))]/50 backdrop-blur-sm rounded-lg p-5 border border-[hsl(var(--bioluminescent))]/30">
                <h3 className="text-xl font-bold text-[hsl(var(--bioluminescent))] mb-2 font-serif">ECHO</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                  The last of a bioluminescent sea turtle species. Starving and confused, navigating murky waters 
                  where plastic bags look exactly like jellyfish. Goal: Reach the Sanctuary.
                </p>
                <p className="text-[hsl(var(--bioluminescent))]/60 text-xs mt-3 font-mono">
                  [ YOU CONTROL ECHO ]
                </p>
              </div>

              {/* Apex */}
              <div className="bg-[hsl(var(--card))]/50 backdrop-blur-sm rounded-lg p-5 border border-[hsl(var(--destructive))]/30">
                <h3 className="text-xl font-bold text-[hsl(var(--destructive))] mb-2 font-serif">APEX INDUSTRIES</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                  A massive trawler above the surface. They don't want to kill you—they just don't see you. 
                  Nets are huge. Sorting costs money. Quotas must be met.
                </p>
                <p className="text-[hsl(var(--destructive))]/60 text-xs mt-3 font-mono">
                  [ THE THREAT ]
                </p>
              </div>

              {/* Overseer */}
              <div className="bg-[hsl(var(--card))]/50 backdrop-blur-sm rounded-lg p-5 border border-[hsl(var(--primary))]/30">
                <h3 className="text-xl font-bold text-[hsl(var(--primary))] mb-2 font-serif">OVERSEER MODEL-7</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                  A climate-monitoring drone that gained sentience. It calculates: if the ocean dies, humanity dies. 
                  When you're critical, it will break its "Observe Only" protocol.
                </p>
                <p className="text-[hsl(var(--primary))]/60 text-xs mt-3 font-mono">
                  [ YOUR GUARDIAN ]
                </p>
              </div>
            </div>

            <Button 
              onClick={advancePhase}
              variant="abyss"
              size="lg"
              className="font-serif mt-4"
            >
              UNDERSTOOD
            </Button>
          </div>
        )}

        {phase === 'ready' && (
          <div className="space-y-8 animate-fade-in max-w-xl mx-auto">
            <h2 className="text-3xl font-serif text-[hsl(var(--bioluminescent))]">MISSION BRIEFING</h2>
            
            <div className="bg-[hsl(var(--card))]/50 backdrop-blur-sm rounded-lg p-6 border border-[hsl(var(--border))] text-left">
              <h4 className="font-bold text-[hsl(var(--foreground))] mb-4 font-serif">CONTROLS</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-3">
                  <kbd className="kbd px-3 py-1.5">W A S D</kbd>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="kbd px-3 py-1.5">↑ ← ↓ →</kbd>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-3 col-span-2">
                  <kbd className="kbd px-3 py-1.5">SPACE</kbd>
                  <span>Echolocation — reveals hidden objects in murky water</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-2 font-serif text-sm">OBJECTIVES</h4>
                <ul className="text-sm text-[hsl(var(--muted-foreground))] space-y-1">
                  <li>• Reach the <span className="text-[hsl(var(--sanctuary))]">Sanctuary</span> (6000m)</li>
                  <li>• Eat <span className="text-[hsl(var(--bioluminescent))]">jellyfish</span> to heal</li>
                  <li>• Avoid <span className="text-[hsl(var(--destructive))]">plastic bags</span> and <span className="text-[hsl(var(--destructive))]">ghost nets</span></li>
                  <li>• Use echolocation to see in the murky water</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={onStart}
              variant="abyss"
              size="lg"
              className="text-xl px-12 py-7 font-serif"
            >
              ENTER THE DEPTHS
            </Button>
          </div>
        )}

        {/* Skip button */}
        {showSkip && phase !== 'ready' && (
          <button 
            onClick={() => setPhase('ready')}
            className="absolute bottom-8 right-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--bioluminescent))] 
                       transition-colors text-sm font-mono"
          >
            Skip intro →
          </button>
        )}

        {/* Credits */}
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-[hsl(var(--muted-foreground))]/40">
          A game about ocean pollution, acoustic disruption, and the fight for survival.
        </p>
      </div>
    </div>
  );
};
