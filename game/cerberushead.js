// Cerberus Head - separate targetable entity
class CerberusHead {
  constructor(x, y, type, phase = 1) {
    this.x = x;
    this.y = y;
    this.type = type;  // 'fire', 'ice', or 'poison'
    this.size = 35;
    this.health = 3000;
    this.maxHealth = 3000;
    this.phase = phase;
    this.shootCooldown = 0;
    this.shootDelay = 90;  // All heads shoot together

    // 1 second attack delay (60 frames at 60 FPS)
    this.attackDelay = 60;

    // Colors based on type
    if (type === 'fire') {
      this.color = '#ff4500';
      this.bulletColor = '#ff4500';
    } else if (type === 'ice') {
      this.color = '#00bfff';
      this.bulletColor = '#00bfff';
    } else {
      this.color = '#00ff00';
      this.bulletColor = '#00ff00';
    }
  }

  update() {
    // Decrease attack delay timer
    if (this.attackDelay > 0) {
      this.attackDelay--;
    }

    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  shoot(player) {
    // Don't shoot if dead
    if (this.isDead()) return [];

    // Can't attack until delay expires
    if (this.attackDelay > 0) return [];

    if (this.shootCooldown === 0) {
      this.shootCooldown = this.shootDelay;

      const bullets = [];
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const angle = Math.atan2(dy, dx);

      const count = 4 + this.phase;  // 5-8 bullets (fewer)
      for (let i = 0; i < count; i++) {
        const spread = (i - count / 2) * 0.3;  // Wider spread (was 0.2)
        const bullet = new Projectile(this.x, this.y, angle + spread, 6, 15, this.bulletColor, 15, false, true);  // Slower (was 8)

        // Apply status effect based on head type
        if (this.type === 'fire') {
          bullet.burn = true;
          bullet.burnDuration = 180;
          bullet.burnDamage = 3;
        } else if (this.type === 'ice') {
          bullet.slow = true;
          bullet.slowDuration = 180;
        } else {
          bullet.poison = true;
          bullet.poisonDuration = 240;
          bullet.poisonDamage = 4;
        }

        bullets.push(bullet);
      }

      return bullets;
    }
    return [];
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  isDead() {
    return this.health <= 0;
  }

  checkCollision(target) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size + target.size;
  }

  draw(ctx) {
    // Don't draw if dead
    if (this.isDead()) return;

    // Draw head with health bar
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Health bar
    const barWidth = this.size * 2;
    const barHeight = 5;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.size - 12;

    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = this.color;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}

