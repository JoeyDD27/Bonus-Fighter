// Projectile class for player and boss bullets
class Projectile {
  constructor(x, y, angle, speed, size, color, damage = 1, isPlayerBullet = true, forceColor = false) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.size = size;
    this.damage = damage;
    this.isPlayerBullet = isPlayerBullet;
    this.active = true;
    this.bounces = false;  // Flag for bouncing bullets
    this.homing = false;   // Flag for homing bullets
    this.homingStrength = 0.02;  // How quickly bullet homes to target
    this.poison = false;  // Flag for poison bullets
    this.poisonDuration = 0;
    this.poisonDamage = 0;

    // Use custom color if forceColor is true, otherwise use damage-based color
    if (forceColor || isPlayerBullet) {
      this.color = color;  // Use provided color
    } else if (typeof getBulletColor === 'function') {
      this.color = getBulletColor(damage, isPlayerBullet);
    } else {
      this.color = color;  // Fallback to provided color
    }

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(target = null) {
    // Homing behavior - ONLY if homing flag is explicitly true
    if (this.homing === true && target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        // Gradually adjust velocity toward target
        this.vx += (dx / dist) * this.homingStrength * this.speed;
        this.vy += (dy / dist) * this.homingStrength * this.speed;

        // Maintain constant speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > 0) {
          this.vx = (this.vx / currentSpeed) * this.speed;
          this.vy = (this.vy / currentSpeed) * this.speed;
        }
      }
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isOffScreen(width, height) {
    // Bouncing bullets never go off-screen
    if (this.bounces) {
      // Bounce off walls
      if (this.x <= this.size || this.x >= width - this.size) {
        this.vx = -this.vx;
        this.x = Math.max(this.size, Math.min(width - this.size, this.x));
      }
      if (this.y <= this.size || this.y >= height - this.size) {
        this.vy = -this.vy;
        this.y = Math.max(this.size, Math.min(height - this.size, this.y));
      }
      return false; // Never remove bouncing bullets (they bounce forever until hitting boss)
    }

    return this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20;
  }

  checkCollision(target) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size + target.size;
  }
}

