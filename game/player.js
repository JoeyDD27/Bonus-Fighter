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
  }

  update(keys, canvasWidth, canvasHeight) {
    // Reset speed and damage (berserker removed, revenge is passive only)
    this.speed = this.baseSpeed;
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

    // Movement
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

  setAimPosition(x, y, boss = null) {
    // If auto-mode is on and boss exists, aim at boss
    if (this.autoMode && boss) {
      this.aimX = boss.x;
      this.aimY = boss.y;
    } else {
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

