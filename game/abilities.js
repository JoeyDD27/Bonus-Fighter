// Ability System - All 9 abilities with activation logic

class AbilityManager {
  constructor() {
    this.abilities = this.defineAbilities();
    this.cooldowns = {
      healing: 0,
      special: 0
    };
    this.activeEffects = {
      shield: { active: false, timer: 0 },
      vampire: { active: false, timer: 0 },
      laser: { active: false, timer: 0 },
      disarm: { active: false, timer: 0 },
      vulnerability: { active: false, timer: 0 }  // Boss takes +30% damage
    };
    this.vampireHealThisSecond = 0;  // Track ALL vampire healing per second
    this.vampireHealTimer = 0;
    this.tacticianHealTimer = 0;  // Track healing interval for Tactician
  }

  defineAbilities() {
    return {
      // HEALING ABILITIES (E key, 15s cooldown)
      healthPotion: {
        id: 'healthPotion',
        name: 'Health Potion',
        type: 'healing',
        cost: 200,
        description: 'Heal 50% of max HP',
        cooldown: 900, // 15 seconds at 60 FPS
        activate: (player) => {
          const healAmount = Math.ceil(player.maxHealth * 0.5);
          player.heal(healAmount);
          return { effect: 'heal', value: healAmount };
        }
      },

      shield: {
        id: 'shield',
        name: 'Shield',
        type: 'healing',
        cost: 200,
        description: 'Set HP to 5% + invincible 5s (auto-save)',
        cooldown: 900, // 15 seconds at 60 FPS
        activate: (player, abilityManager) => {
          // Set health to 5% of max health
          const targetHealth = Math.ceil(player.maxHealth * 0.05);
          player.health = Math.max(player.health, targetHealth); // Set to 5% if lower

          // Activate invincibility shield
          abilityManager.activeEffects.shield.active = true;
          abilityManager.activeEffects.shield.timer = 300; // 5 seconds
          return { effect: 'shield', duration: 5, setHealth: targetHealth };
        }
      },

      vampire: {
        id: 'vampire',
        name: 'Vampire',
        type: 'healing',
        cost: 200,
        description: 'Lifesteal 50% for 6s',
        cooldown: 900, // 15 seconds at 60 FPS
        activate: (player, abilityManager) => {
          abilityManager.activeEffects.vampire.active = true;
          abilityManager.activeEffects.vampire.timer = 360; // 6 seconds
          return { effect: 'vampire', duration: 6 };
        }
      },

      // SPECIAL ABILITIES (R key, 20s cooldown)
      laser: {
        id: 'laser',
        name: 'Laser Beam',
        type: 'special',
        cost: 300,
        description: 'Auto-aim laser for 4s',
        cooldown: 1200, // 20 seconds at 60 FPS
        activate: (player, abilityManager) => {
          abilityManager.activeEffects.laser.active = true;
          abilityManager.activeEffects.laser.timer = 240; // 4 seconds
          return { effect: 'laser', duration: 4 };
        }
      },

      bulletStorm: {
        id: 'bulletStorm',
        name: 'Bullet Storm',
        type: 'special',
        cost: 300,
        description: 'Fire 12 homing bouncing bullets',
        cooldown: 1200, // 20 seconds at 60 FPS
        activate: (player) => {
          const bullets = [];
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const bullet = new Projectile(
              player.x, player.y, angle,
              2, player.bulletSize, '#74c0fc',  // Super slow: 5 → 2
              player.bulletDamage, true
            );
            bullet.bounces = true; // Mark as bouncing bullet
            bullet.homing = true;  // Mark as homing bullet
            bullet.homingStrength = 0.01; // Very slow homing: 0.02 → 0.01
            bullets.push(bullet);
          }
          return { effect: 'bulletStorm', bullets: bullets };
        }
      },

      disarm: {
        id: 'disarm',
        name: 'Disarm',
        type: 'special',
        cost: 300,
        description: 'Clear bullets, silence + vulnerable 5s',
        cooldown: 1200, // 20 seconds at 60 FPS
        activate: (player, abilityManager) => {
          abilityManager.activeEffects.disarm.active = true;
          abilityManager.activeEffects.disarm.timer = 300; // 5 seconds
          abilityManager.activeEffects.vulnerability.active = true;
          abilityManager.activeEffects.vulnerability.timer = 300; // 5 seconds, boss takes +30% damage
          return { effect: 'disarm', duration: 5, clearBullets: true };
        }
      },

      // PASSIVE ABILITIES (Always active)
      autoHeal: {
        id: 'autoHeal',
        name: 'Auto-Heal',
        type: 'passive',
        cost: 250,
        description: 'Regen 5% max HP/s after 1s no damage',
        passive: true
      },

      tactician: {
        id: 'tactician',
        name: 'Tactician',
        type: 'passive',
        cost: 250,
        description: '+18% dmg, +10% HP, +15% speed, heal 3%/3s',
        passive: true,
        damageBoost: 0.18,
        healthBoost: 0.10,
        speedBoost: 0.15,
        cooldownReduction: 0.15,
        healPercent: 0.03,
        healInterval: 180  // 3 seconds in frames
      },

      revenge: {
        id: 'revenge',
        name: 'Revenge',
        type: 'passive',
        cost: 250,
        description: 'Deal 3-10x damage back (scales with upgrades)',
        passive: true
      }
    };
  }

  update(player, equippedAbilities) {
    // Update cooldowns
    if (this.cooldowns.healing > 0) this.cooldowns.healing--;
    if (this.cooldowns.special > 0) this.cooldowns.special--;

    // Reset vampire heal counter every second
    this.vampireHealTimer++;
    if (this.vampireHealTimer >= 60) {
      this.vampireHealThisSecond = 0;
      this.vampireHealTimer = 0;
    }

    // Update active effects
    if (this.activeEffects.shield.active) {
      this.activeEffects.shield.timer--;
      if (this.activeEffects.shield.timer <= 0) {
        this.activeEffects.shield.active = false;
      }
    }

    if (this.activeEffects.vampire.active) {
      this.activeEffects.vampire.timer--;
      if (this.activeEffects.vampire.timer <= 0) {
        this.activeEffects.vampire.active = false;
      }
    }

    if (this.activeEffects.laser.active) {
      this.activeEffects.laser.timer--;
      if (this.activeEffects.laser.timer <= 0) {
        this.activeEffects.laser.active = false;
      }
    }

    if (this.activeEffects.disarm.active) {
      this.activeEffects.disarm.timer--;
      if (this.activeEffects.disarm.timer <= 0) {
        this.activeEffects.disarm.active = false;
      }
    }

    if (this.activeEffects.vulnerability.active) {
      this.activeEffects.vulnerability.timer--;
      if (this.activeEffects.vulnerability.timer <= 0) {
        this.activeEffects.vulnerability.active = false;
      }
    }

    // Handle passive abilities
    if (equippedAbilities.passive === 'autoHeal') {
      if (player.timeSinceLastHit > 60 && player.health < player.maxHealth) {
        player.heal((player.maxHealth * 0.05) / 60); // 5% of max HP per second
      }
    }

    if (equippedAbilities.passive === 'tactician') {
      // Heal 3% max HP every 3 seconds
      this.tacticianHealTimer++;
      if (this.tacticianHealTimer >= 180 && player.health < player.maxHealth) {
        player.heal(player.maxHealth * 0.03);
        this.tacticianHealTimer = 0;
      }
    }

    // Revenge passive is handled in engine when player takes damage
  }

  activateAbility(type, equippedAbilities, player) {
    const abilityId = equippedAbilities[type];
    if (!abilityId) return null;

    const ability = this.abilities[abilityId];
    if (!ability) return null;

    // Check cooldown
    if (type === 'healing' && this.cooldowns.healing > 0) return null;
    if (type === 'special' && this.cooldowns.special > 0) return null;

    // Activate ability
    const result = ability.activate(player, this);

    // Set cooldown (with Tactician reduction if equipped)
    const cdReduction = equippedAbilities.passive === 'tactician' ? 0.85 : 1.0; // 15% reduction
    if (type === 'healing') this.cooldowns.healing = Math.floor(ability.cooldown * cdReduction);
    if (type === 'special') this.cooldowns.special = Math.floor(ability.cooldown * cdReduction);

    return result;
  }

  getShieldDamageMultiplier() {
    return this.activeEffects.shield.active ? 0.0 : 1.0; // 100% immunity = 0% damage
  }

  isVampireActive() {
    return this.activeEffects.vampire.active;
  }

  isLaserActive() {
    return this.activeEffects.laser.active;
  }

  isDisarmActive() {
    return this.activeEffects.disarm.active;
  }

  getVulnerabilityMultiplier() {
    return this.activeEffects.vulnerability.active ? 1.3 : 1.0; // +30% damage when vulnerable
  }

  incrementCombo() {
    this.comboCounter++;
    if (this.comboCounter >= 3) {
      this.comboCounter = 0;
      return true; // Combo hit!
    }
    return false;
  }

  resetCombo() {
    this.comboCounter = 0;
  }

  applyRevengeVampireHeal(player, revengeDamage) {
    // Revenge vampire healing now uses the same cap as regular vampire (handled in engine)
    // This function is no longer needed - all vampire healing goes through applyVampireHeal
  }
}

