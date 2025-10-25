// Base Boss class with shared behaviors
class Boss {
  constructor(level, config) {
    this.level = level;
    this.name = config.name || `Boss ${level}`;
    this.x = config.x || 300;
    this.y = config.y || 150;
    this.size = config.size || 40;
    this.maxHealth = config.health || (50 + level * 20);
    this.health = this.maxHealth;
    this.color = config.color || this.generateRedShade(level);

    // Movement
    this.speed = config.speed || 2;
    this.vx = 0;
    this.vy = 0;

    // Shooting
    this.shootCooldown = 0;
    this.shootDelay = config.shootDelay || 60;
    this.bulletSpeed = config.bulletSpeed || 10; // same speed as player
    this.bulletSize = config.bulletSize || 14; // VERY LARGE, highly visible bullets
    this.damageMultiplier = config.damageMultiplier || 1.0;  // Scaling multiplier

    // Behavior
    this.behaviorTimer = 0;
    this.phase = 1;
    this.maxPhases = config.maxPhases || 1;

    // Custom behavior function
    this.updateBehavior = config.updateBehavior || this.defaultBehavior.bind(this);
    this.shootPattern = config.shootPattern || this.defaultShoot.bind(this);
  }

  generateRedShade(level) {
    const intensity = Math.min(255, 150 + level * 3);
    const darkness = Math.max(0, 100 - level * 2);
    return `rgb(${intensity}, ${darkness}, ${darkness})`;
  }

  update(player, canvasWidth, canvasHeight) {
    this.behaviorTimer++;

    // Update behavior
    this.updateBehavior(player, canvasWidth, canvasHeight);

    // Apply movement
    this.x += this.vx;
    this.y += this.vy;

    // Keep in bounds
    this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
    this.y = Math.max(this.size, Math.min(canvasHeight / 2 - this.size, this.y));

    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }

    // Check phase changes
    const healthPercent = this.health / this.maxHealth;
    if (this.maxPhases > 1) {
      this.phase = Math.ceil((1 - healthPercent) * this.maxPhases) + 1;
      if (this.phase > this.maxPhases) this.phase = this.maxPhases;
    }
  }

  defaultBehavior(player, canvasWidth, canvasHeight) {
    // Simple side-to-side movement
    this.vx = Math.sin(this.behaviorTimer * 0.02) * this.speed;
    this.vy = 0;
  }

  shoot(player) {
    if (this.shootCooldown === 0) {
      this.shootCooldown = this.shootDelay;
      return this.shootPattern(player);
    }
    return [];
  }

  defaultShoot(player) {
    // Shoot single bullet at player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);

    return [new Projectile(
      this.x,
      this.y,
      angle,
      this.bulletSpeed,
      this.bulletSize,
      '#ff6b6b',
      10,
      false
    )];
  }

  takeDamage(damage, source = null) {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
    this.lastDamageAmount = damage; // Track for vampire lifesteal
  }

  isDead() {
    return this.health <= 0;
  }

  draw(ctx) {
    // Draw boss (red block/shape)
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );

    // Draw border
    ctx.strokeStyle = '#c92a2a';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );

    // Draw health bar
    const barWidth = this.size;
    const barHeight = 6;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.size / 2 - 15;

    // Background
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.3 ? '#ff6b6b' : '#ffd43b';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}

