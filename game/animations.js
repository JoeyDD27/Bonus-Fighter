// Animation System for Boss Intros and Phase Transitions

class AnimationManager {
  constructor() {
    this.isAnimating = false;
    this.animationType = null; // 'intro' or 'phaseTransition'
    this.animationTimer = 0;
    this.animationDuration = 240; // 4 seconds at 60 FPS
    this.currentBossLevel = 0;
    this.fromPhase = 1;
    this.toPhase = 2;
  }

  startBossIntro(bossLevel) {
    this.isAnimating = true;
    this.animationType = 'intro';
    this.animationTimer = 0;
    this.currentBossLevel = bossLevel;
  }

  startPhaseTransition(bossLevel, fromPhase, toPhase) {
    this.isAnimating = true;
    this.animationType = 'phaseTransition';
    this.animationTimer = 0;
    this.currentBossLevel = bossLevel;
    this.fromPhase = fromPhase;
    this.toPhase = toPhase;
  }

  update() {
    if (this.isAnimating) {
      this.animationTimer++;
      if (this.animationTimer >= this.animationDuration) {
        this.isAnimating = false;
        return true; // Animation complete
      }
    }
    return false;
  }

  draw(ctx, width, height, boss) {
    if (!this.isAnimating) return;

    const progress = this.animationTimer / this.animationDuration; // 0 to 1

    // Dark overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * Math.min(1, progress * 2)})`;
    ctx.fillRect(0, 0, width, height);

    if (this.animationType === 'intro') {
      this.drawBossIntro(ctx, width, height, boss, progress);
    } else if (this.animationType === 'phaseTransition') {
      this.drawPhaseTransition(ctx, width, height, boss, progress);
    }
  }

  drawBossIntro(ctx, width, height, boss, progress) {
    // 0-0.25: Boss name fades in
    if (progress < 0.25) {
      const alpha = progress / 0.25;
      ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(boss.name, width / 2, height / 2);
    }
    // 0.25-0.5: Boss name visible
    else if (progress < 0.5) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(boss.name, width / 2, height / 2);
    }
    // 0.5-0.75: Boss name fades, show "GET READY"
    else if (progress < 0.75) {
      const alpha = 1 - ((progress - 0.5) / 0.25);
      ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(boss.name, width / 2, height / 2 - 30);

      const readyAlpha = (progress - 0.5) / 0.25;
      ctx.fillStyle = `rgba(116, 192, 252, ${readyAlpha})`;
      ctx.font = 'bold 28px Arial';
      ctx.fillText('GET READY!', width / 2, height / 2 + 30);
    }
    // 0.75-1: Fade out
    else {
      const alpha = 1 - ((progress - 0.75) / 0.25);
      ctx.fillStyle = `rgba(116, 192, 252, ${alpha})`;
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GET READY!', width / 2, height / 2);
    }
  }

  drawPhaseTransition(ctx, width, height, boss, progress) {
    // Phase transition animations for bosses 20, 29, 30
    const bossLevel = this.currentBossLevel;

    // 0-0.25: Flash effect
    if (progress < 0.25) {
      const flash = Math.sin(progress * 40) > 0 ? 1 : 0;
      ctx.fillStyle = `rgba(255, 0, 0, ${flash * 0.3})`;
      ctx.fillRect(0, 0, width, height);
    }
    // 0.25-0.5: Show phase text
    else if (progress < 0.5) {
      const alpha = Math.min(1, (progress - 0.25) / 0.1);
      ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';

      if (bossLevel === 20) {
        ctx.fillText('RAGE MODE!', width / 2, height / 2);
      } else if (bossLevel === 29) {
        ctx.fillText(this.toPhase === 2 ? 'PROTOCOL: ESCALATION' : 'FINAL PROTOCOL', width / 2, height / 2);
      } else if (bossLevel === 30) {
        ctx.fillText(this.toPhase === 2 ? 'THE EMPEROR RISES' : 'IMPERIAL WRATH', width / 2, height / 2);
      }
    }
    // 0.5-0.75: Visual effect (boss grows)
    else if (progress < 0.75) {
      const scaleProgress = (progress - 0.5) / 0.25;
      const scale = 1 + scaleProgress * 0.2;

      // Draw enlarged boss preview
      ctx.save();
      ctx.translate(boss.x, boss.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = boss.color;
      ctx.fillRect(-boss.size / 2, -boss.size / 2, boss.size, boss.size);
      ctx.restore();
    }
    // 0.75-1: Fade out
    else {
      const alpha = 1 - ((progress - 0.75) / 0.25);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

