// Game constants for Abyss Equilibrium

export const GAME_CONFIG = {
  width: 1024,
  height: 768,
};

export const PLAYER = {
  speed: 220,
  maxHealth: 100,
  echolocationCooldown: 3500,
  echolocationDuration: 2500,
  echolocationRadius: 250,
};

export const HAZARDS = {
  plasticDamage: 12,
  netDamage: 3,
  netSlowFactor: 0.3,
  jellyfishHeal: 18,
};

export const APEX = {
  netSpawnInterval: 5000,
  wasteSpawnInterval: 6000,
  plasticSpawnInterval: 3500,
};

export const OVERSEER = {
  maxUses: 2,
  shieldDuration: 4000,
  jamDuration: 6000,
  activationHealthThreshold: 25,
};

export const GAME = {
  sanctuaryDistance: 6000,
  gameSpeed: 1,
};

// Story narrative beats - triggered at specific distances
export const STORY_BEATS = [
  { distance: 0, speaker: 'SYSTEM', message: 'Year 2045. The Silent Zone.' },
  { distance: 100, speaker: 'ECHO', message: '...The water tastes wrong. Everything is murky.' },
  { distance: 300, speaker: 'OVERSEER', message: 'Detecting life form. Initiating observation protocol.' },
  { distance: 600, speaker: 'ECHO', message: 'I remember when I could hear my family. Now there is only... noise.' },
  { distance: 1000, speaker: 'APEX', message: 'Net deployed. Quota progress: 12%.' },
  { distance: 1200, speaker: 'OVERSEER', message: 'Warning: Subject entering high-density pollution zone.' },
  { distance: 1800, speaker: 'ECHO', message: 'Is that food? It looks like a jellyfish... but something feels wrong.' },
  { distance: 2200, speaker: 'APEX', message: 'Waste disposal complete. Cost savings: $500.' },
  { distance: 2500, speaker: 'OVERSEER', message: 'Analysis: If subject perishes, ecosystem collapse accelerates by 3.2 years.' },
  { distance: 3000, speaker: 'ECHO', message: 'The Sanctuary... I can almost sense it. The water feels different there.' },
  { distance: 3500, speaker: 'APEX', message: 'Quarterly report: Profits up 23%. Environmental concerns: Dismissed.' },
  { distance: 4000, speaker: 'OVERSEER', message: 'Decision threshold reached. Preparing intervention protocols.' },
  { distance: 4500, speaker: 'ECHO', message: 'The light is getting brighter. I can feel hope again.' },
  { distance: 5000, speaker: 'APEX', message: 'Warning: Sensor interference detected. Investigating...' },
  { distance: 5500, speaker: 'OVERSEER', message: 'Subject approaching Sanctuary. Probability of survival: Rising.' },
];
