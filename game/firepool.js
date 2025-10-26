// Fire Pool - area hazard created by Dragon
class FirePool {
  constructor(x, y, size = 50, duration = 360, damagePerSec = 12) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.duration = duration;  // Frames remaining
    this.maxDuration = duration;
    this.damagePerSec = damagePerSec;
    this.damageTimer = 0;
  }

  update() {
    this.duration--;
  }

  isExpired() {
    return this.duration <= 0;
  }

  checkPlayerInside(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < this.size;
  }

  getDamageThisFrame() {
    // Damage every frame (continuous)
    return this.damagePerSec / 60;  // Convert per-second to per-frame
  }

  draw(ctx) {
    // Draw fire pool with gradient and fade
    const alpha = Math.min(1, this.duration / 60);  // Fade in first second

    // Outer glow
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, '#ff4500');
    gradient.addColorStop(0.5, '#ff6600');
    gradient.addColorStop(1, '#ff8800');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Inner fire
    ctx.globalAlpha = alpha * 0.6;
    const innerGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 0.6);
    innerGradient.addColorStop(0, '#ffff00');
    innerGradient.addColorStop(0.7, '#ff4500');
    innerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

