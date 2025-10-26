// Ghost minion - summoned by Necromancer
class Ghost {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 18;
    this.health = 200;  // Very tanky!
    this.maxHealth = 200;
    this.speed = 3;  // Medium chase (slower than 3.5)
    this.damage = 30;  // 30 HP/sec when in contact
    this.damageRange = 80;  // Longer range (was 40)
    this.color = '#8b00ff';
    this.vx = 0;
    this.vy = 0;
    this.damageTimer = 0;
    this.shootCooldown = 0;
    this.shootDelay = 60;  // Shoots every 1 second (was 120)
  }

  update(player) {
    // Chase player slowly
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }

    // Damage player if close (30 HP/sec = 0.5 HP per frame)
    if (dist < this.damageRange) {
      this.damageTimer++;
      if (this.damageTimer >= 60) {  // Once per second
        return this.damage;  // Return damage to apply
      }
    } else {
      this.damageTimer = 0;
    }

    return 0;  // No damage this frame
  }

  shoot(player) {
    if (this.shootCooldown === 0) {
      this.shootCooldown = this.shootDelay;

      // Shoot at player
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const angle = Math.atan2(dy, dx);
      return new Projectile(this.x, this.y, angle, 8, 14, '#ff00ff', 18, false, true);  // Faster, bigger, more damage
    }
    return null;
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
    // Draw ghost (purple circle with fade effect)
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Health bar
    const barWidth = this.size * 2;
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.size - 10;

    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#8b00ff';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }
}

