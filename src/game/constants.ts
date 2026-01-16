// Game constants for Abyss Equilibrium

export const GAME_CONFIG = {
  width: 1024,
  height: 768,
};

export const PLAYER = {
  speed: 250,
  maxHealth: 100,
  echolocationCooldown: 3000,
  echolocationDuration: 2000,
  echolocationRadius: 200,
};

export const HAZARDS = {
  plasticDamage: 8,
  netDamage: 2,
  netSlowFactor: 0.3,
  jellyfishHeal: 15,
};

export const APEX = {
  netSpawnInterval: 4000,
  wasteSpawnInterval: 6000,
  plasticSpawnInterval: 3000,
};

export const OVERSEER = {
  maxUses: 2,
  shieldDuration: 3000,
  jamDuration: 5000,
  activationHealthThreshold: 30,
};

export const GAME = {
  sanctuaryDistance: 5000,
  gameSpeed: 1,
};
