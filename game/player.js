// Player class - the blue block
class Player {
  constructor(x, y, upgrades = { maxHealth: 0, bulletDamage: 0 }, equippedAbilities = {}) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.baseSpeed = 4;

    // Check for Tactician passive bonuses
    const tacticianBonus = equippedAbilities.passive === 'tactician' ? {
      damage: 0.18,
      health: 0.10,
      speed: 0.15
    } : { damage: 0, health: 0, speed: 0 };

    this.speed = this.baseSpeed * (1 + tacticianBonus.speed);

    // Apply stat upgrades + Tactician bonus
    this.maxHealth = Math.floor((100 + (upgrades.maxHealth || 0) * 20) * (1 + tacticianBonus.health));
    this.health = this.maxHealth;
    this.baseBulletDamage = Math.floor((25 + (upgrades.bulletDamage || 0) * 5) * (1 + tacticianBonus.damage));
    this.bulletDamage = this.baseBulletDamage;

    this.color = '#4dabf7';

    // Movement
    this.vx = 0;
    this.vy = 0;

    // Shooting
    this.shootCooldown = 0;
    this.shootDelay = 60; // frames between shots (1 second at 60 FPS)
    this.bulletSpeed = 10;
    this.bulletSize = 12; // even larger bullets

    // Mouse aiming
    this.aimX = 0;
    this.aimY = 0;

    // Auto-aim/Auto-shoot mode
    this.autoMode = false;

    // Ability effects
    this.berserkerActive = false;
    this.timeSinceLastHit = 0;
    this.lastHealth = this.health;

    // Poison status
    this.poisoned = false;
    this.poisonDuration = 0;
    this.poisonDamagePerTick = 0;

    // Burn status (fire DoT)
    this.burning = false;
    this.burnDuration = 0;
    this.burnDamagePerTick = 0;

    // Petrified status (stone freeze)
    this.petrified = false;
    this.petrifiedDuration = 0;
    this.justPetrified = false;  // Track if just got petrified

    // Slowed status (ice effect)
    this.slowed = false;
    this.slowedDuration = 0;
    this.slowMultiplier = 1.0;
  }

  update(keys, canvasWidth, canvasHeight) {
    // Reset speed and damage (berserker removed, revenge is passive only)
    this.speed = this.baseSpeed * this.slowMultiplier;  // Apply slow if active
    this.bulletDamage = this.baseBulletDamage;

    // Handle poison damage over time
    if (this.poisoned && this.poisonDuration > 0) {
      this.poisonDuration--;
      if (this.poisonDuration % 30 === 0) {  // Damage every 0.5 seconds
        this.takeDamage(this.poisonDamagePerTick);
      }
      if (this.poisonDuration <= 0) {
        this.poisoned = false;
      }
    }

    // Handle burn damage over time
    if (this.burning && this.burnDuration > 0) {
      this.burnDuration--;
      if (this.burnDuration % 30 === 0) {  // Damage every 0.5 seconds
        this.takeDamage(this.burnDamagePerTick);
      }
      if (this.burnDuration <= 0) {
        this.burning = false;
      }
    }

    // Handle petrified status
    if (this.petrified && this.petrifiedDuration > 0) {
      this.petrifiedDuration--;
      if (this.petrifiedDuration <= 0) {
        this.petrified = false;
        this.color = '#4dabf7';  // Back to blue
      }
    }

    // Handle slowed status
    if (this.slowed && this.slowedDuration > 0) {
      this.slowedDuration--;
      this.slowMultiplier = 0.5;  // 50% speed
      if (this.slowedDuration <= 0) {
        this.slowed = false;
        this.slowMultiplier = 1.0;
      }
    } else {
      this.slowMultiplier = 1.0;
    }

    // Movement (blocked if petrified)
    if (this.petrified) {
      this.vx = 0;
      this.vy = 0;
      return;  // Can't move when petrified!
    }

    this.vx = 0;
    this.vy = 0;

    if (keys['w'] || keys['ArrowUp']) this.vy = -this.speed;
    if (keys['s'] || keys['ArrowDown']) this.vy = this.speed;
    if (keys['a'] || keys['ArrowLeft']) this.vx = -this.speed;
    if (keys['d'] || keys['ArrowRight']) this.vx = this.speed;

    // Normalize diagonal movement
    if (this.vx !== 0 && this.vy !== 0) {
      this.vx *= 0.707;
      this.vy *= 0.707;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Keep player in bounds
    this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
    this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));

    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }

    // Track time since last hit (for auto-heal)
    if (this.health < this.lastHealth) {
      this.timeSinceLastHit = 0;
    } else {
      this.timeSinceLastHit++;
    }
    this.lastHealth = this.health;
  }

  setAimPosition(x, y, boss = null, cerberusHeads = []) {
    // Auto-aim prioritizes Cerberus heads over body
    if (this.autoMode) {
      const aliveHeads = cerberusHeads.filter(h => !h.isDead());
      if (aliveHeads.length > 0) {
        // Target nearest alive head
        let nearestHead = aliveHeads[0];
        let minDist = Math.sqrt((nearestHead.x - this.x) ** 2 + (nearestHead.y - this.y) ** 2);

        for (const head of aliveHeads) {
          const dist = Math.sqrt((head.x - this.x) ** 2 + (head.y - this.y) ** 2);
          if (dist < minDist) {
            minDist = dist;
            nearestHead = head;
          }
        }

        this.aimX = nearestHead.x;
        this.aimY = nearestHead.y;
      } else if (boss) {
        // No heads, aim at boss
        this.aimX = boss.x;
        this.aimY = boss.y;
      }
    } else {
      // Manual aim
      this.aimX = x;
      this.aimY = y;
    }
  }

  toggleAutoMode() {
    this.autoMode = !this.autoMode;
    return this.autoMode;
  }

  shouldAutoShoot() {
    return this.autoMode;
  }

  shoot() {
    // Can't shoot when petrified
    if (this.petrified) return null;

    if (this.shootCooldown === 0) {
      // Calculate angle to mouse position
      const dx = this.aimX - this.x;
      const dy = this.aimY - this.y;
      const angle = Math.atan2(dy, dx);

      this.shootCooldown = this.shootDelay;

      return new Projectile(
        this.x,
        this.y,
        angle,
        this.bulletSpeed,
        this.bulletSize,
        '#74c0fc',
        this.bulletDamage,
        true
      );
    }
    return null;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
  }

  applyPoison(duration, damagePerTick) {
    this.poisoned = true;
    this.poisonDuration = Math.max(this.poisonDuration, duration);  // Extend duration if already poisoned
    this.poisonDamagePerTick = damagePerTick;
  }

  applyBurn(duration, damagePerTick) {
    this.burning = true;
    this.burnDuration = Math.max(this.burnDuration, duration);  // Extend duration if already burning
    this.burnDamagePerTick = damagePerTick;
  }

  applyPetrify(duration) {
    this.petrified = true;
    this.petrifiedDuration = duration;
    this.color = '#808080';  // Turn gray when petrified
    this.justPetrified = true;  // Flag for burst fire
  }

  applySlow(duration) {
    this.slowed = true;
    this.slowedDuration = Math.max(this.slowedDuration, duration);
  }

  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }

  draw(ctx) {
    // Draw player (blue block)
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );

    // Draw border
    ctx.strokeStyle = '#1971c2';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );

    // Draw aiming line
    ctx.strokeStyle = 'rgba(116, 192, 252, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.aimX, this.aimY);
    ctx.stroke();
  }

  reset() {
    this.health = this.maxHealth;
  }
}

