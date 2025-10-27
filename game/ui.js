// UI Manager for menus, HUD, and screens
class UIManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.selectedLevel = 1;
    this.selectedMenuItem = 0;
    this.levelSelectPage = 0;

    // Menu button positions (for click detection)
    this.menuButtonY = [280, 335, 390, 445, 500]; // Y positions of 5 menu buttons
    this.menuButtonHeight = 40; // Click area height for each button
  }

  drawMainMenu(keys) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BONUS FIGHTER', width / 2, 150);

    // Menu items
    const menuItems = ['Play', 'Shop', 'Level Select', 'Stats', 'How to Play'];
    const startY = 280;
    const spacing = 55;

    menuItems.forEach((item, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedMenuItem;

      ctx.font = isSelected ? 'bold 32px Arial' : '28px Arial';
      ctx.fillStyle = isSelected ? '#74c0fc' : '#868e96';
      ctx.fillText(item, width / 2, y);
    });

    // Instructions
    ctx.font = '16px Arial';
    ctx.fillStyle = '#868e96';
    ctx.fillText('Use W/S or Click to select', width / 2, height - 80);
    ctx.fillText('Press SPACE or Click to confirm', width / 2, height - 50);
  }

  drawLevelSelect(gameData) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT LEVEL', width / 2, 60);

    // Level grid (6 columns x 5 rows = 30 levels)
    const cols = 6;
    const rows = 5;
    const boxSize = 70;
    const spacing = 10;
    const startX = (width - (cols * (boxSize + spacing) - spacing)) / 2;
    const startY = 100;

    for (let i = 0; i < 30; i++) {
      const level = i + 1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (boxSize + spacing);
      const y = startY + row * (boxSize + spacing);

      const levelData = gameData.levels[level];
      const isUnlocked = levelData?.unlocked || false;
      const isCompleted = levelData?.completed || false;
      const isSelected = level === this.selectedLevel;

      // Box
      if (isUnlocked) {
        ctx.fillStyle = isSelected ? '#4dabf7' : (isCompleted ? '#51cf66' : '#495057');
      } else {
        ctx.fillStyle = '#212529';
      }
      ctx.fillRect(x, y, boxSize, boxSize);

      // Border
      ctx.strokeStyle = isSelected ? '#74c0fc' : '#343a40';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(x, y, boxSize, boxSize);

      // Level number
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = isUnlocked ? '#ffffff' : '#495057';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level, x + boxSize / 2, y + boxSize / 2);
    }

    // Instructions
    ctx.textBaseline = 'alphabetic';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#868e96';
    ctx.fillText('Use Arrow Keys or Click to select', width / 2, height - 50);
    ctx.fillText('Press SPACE or Click to start', width / 2, height - 25);
  }

  drawStats(gameData) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPEEDRUN RECORDS', width / 2, 40);

    // Overall stats (compact)
    const stats = gameData.stats;
    const completed = Object.values(gameData.levels).filter(l => l.completed).length;
    const coins = gameData.coins || 0;

    ctx.font = '16px Arial';
    ctx.fillStyle = '#51cf66';
    ctx.fillText(`Completed: ${completed}/30 | Kills: ${stats.totalKills} | Deaths: ${stats.totalDeaths} | Accuracy: ${stats.shotsFired > 0 ? ((stats.shotsHit / stats.shotsFired) * 100).toFixed(1) : 0}%`, width / 2, 70);

    // Coins display
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Total Coins: 💰 ${coins}`, width / 2, 95);

    // Speedrun records grid (3 columns x 10 rows = 30 levels)
    const cols = 3;
    const rows = 10;
    const colWidth = 180;
    const rowHeight = 58;
    const startX = 20;
    const startY = 100;

    ctx.textAlign = 'left';

    for (let i = 0; i < 30; i++) {
      const level = i + 1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * colWidth;
      const y = startY + row * rowHeight;

      const levelData = gameData.levels[level];
      const isCompleted = levelData?.completed || false;
      const bestTime = levelData?.bestTime;

      // Level number
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = isCompleted ? '#51cf66' : '#868e96';
      ctx.fillText(`L${level}:`, x, y);

      // Best time or status
      ctx.font = '14px Arial';
      if (bestTime !== null && bestTime !== undefined) {
        ctx.fillStyle = '#74c0fc';
        ctx.fillText(`${bestTime.toFixed(2)}s`, x + 35, y);

        // Medal for very fast times (under 60 seconds = 1 minute!)
        if (bestTime < 60) {
          ctx.fillStyle = '#ffd43b';
          ctx.fillText('⭐', x + 100, y);
        }
      } else if (isCompleted) {
        ctx.fillStyle = '#adb5bd';
        ctx.fillText('--', x + 35, y);
      } else {
        ctx.fillStyle = '#495057';
        ctx.fillText('Not completed', x + 35, y);
      }
    }

    // Back instruction
    ctx.textAlign = 'center';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#868e96';
    ctx.fillText('Press ESC or Click to return', width / 2, height - 30);
  }

  drawHowToPlay() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HOW TO PLAY', width / 2, 60);

    const instructions = [
      'MOVEMENT:',
      'Use WASD or Arrow Keys to move',
      '',
      'AIMING:',
      'Move your mouse to aim',
      '',
      'SHOOTING:',
      'Press SPACE or Click to shoot',
      '',
      'GOAL:',
      'Defeat all 30 bosses!',
      'Each boss has unique attacks',
      'Avoid red bullets and destroy the boss'
    ];

    const startY = 130;
    const spacing = 35;

    ctx.textAlign = 'center';
    instructions.forEach((line, index) => {
      if (line.endsWith(':')) {
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#74c0fc';
      } else {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#e9ecef';
      }
      ctx.fillText(line, width / 2, startY + index * spacing);
    });

    // Back instruction
    ctx.font = '16px Arial';
    ctx.fillStyle = '#868e96';
    ctx.fillText('Press ESC or Click to return', width / 2, height - 30);
  }

  drawGameHUD(player, boss, level, time, coins, abilityManager, equippedAbilities) {
    const ctx = this.ctx;
    const width = this.canvas.width;

    // Player health bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;
    const barY = 20;

    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.3 ? '#51cf66' : '#ff6b6b';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${Math.ceil(player.health)}/${player.maxHealth}`, barX + 5, barY + 15);

    // Coins display
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`💰 ${coins}`, barX, barY + 40);

    // Ability Cooldown Displays
    const cdY = barY + 60;

    // Healing ability (E key)
    if (equippedAbilities.healing) {
      const healingCooldown = abilityManager.cooldowns.healing || 0;
      const healingReady = healingCooldown === 0;

      ctx.fillStyle = healingReady ? '#51cf66' : '#868e96';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('E:', barX, cdY);

      if (healingReady) {
        ctx.fillStyle = '#51cf66';
        ctx.fillText('READY', barX + 20, cdY);
      } else {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText(`${(healingCooldown / 60).toFixed(1)}s`, barX + 20, cdY);
      }
    }

    // Special ability (R key)
    if (equippedAbilities.special) {
      const specialCooldown = abilityManager.cooldowns.special || 0;
      const specialReady = specialCooldown === 0;

      ctx.fillStyle = specialReady ? '#4dabf7' : '#868e96';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('R:', barX + 100, cdY);

      if (specialReady) {
        ctx.fillStyle = '#4dabf7';
        ctx.fillText('READY', barX + 120, cdY);
      } else {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText(`${(specialCooldown / 60).toFixed(1)}s`, barX + 120, cdY);
      }
    }

    // Active ability duration displays
    let activeAbilityY = cdY + 20;

    // Shield duration
    if (abilityManager.activeEffects.shield.active) {
      const timeLeft = abilityManager.activeEffects.shield.timer / 60;
      ctx.fillStyle = '#51cf66';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🛡️ Shield: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Vampire duration
    if (abilityManager.activeEffects.vampire.active) {
      const timeLeft = abilityManager.activeEffects.vampire.timer / 60;
      ctx.fillStyle = '#e03131';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🩸 Vampire: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Laser duration
    if (abilityManager.activeEffects.laser.active) {
      const timeLeft = abilityManager.activeEffects.laser.timer / 60;
      ctx.fillStyle = '#4dabf7';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`⚡ Laser: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Disarm duration
    if (abilityManager.activeEffects.disarm.active) {
      const timeLeft = abilityManager.activeEffects.disarm.timer / 60;
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🚫 Disarm: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Poison status indicator
    if (player.poisoned && player.poisonDuration > 0) {
      const timeLeft = player.poisonDuration / 60;
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`☠️ Poisoned: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Burn status indicator
    if (player.burning && player.burnDuration > 0) {
      const timeLeft = player.burnDuration / 60;
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🔥 Burning: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Petrified status indicator
    if (player.petrified && player.petrifiedDuration > 0) {
      const timeLeft = player.petrifiedDuration / 60;
      ctx.fillStyle = '#808080';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🗿 Petrified: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Slowed status indicator
    if (player.slowed && player.slowedDuration > 0) {
      const timeLeft = player.slowedDuration / 60;
      ctx.fillStyle = '#00bfff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`❄️ Slowed: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Auto-mode indicator
    if (player.autoMode) {
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('[Q] AUTO-AIM', barX, activeAbilityY);
    }

    // Boss info
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(`${boss.name}`, width - 20, 25);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#e9ecef';
    ctx.fillText(`Level ${level}`, width - 20, 45);

    // Time
    ctx.textAlign = 'center';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#adb5bd';
    ctx.fillText(`Time: ${time.toFixed(1)}s`, width / 2, 25);
  }

  drawVictoryScreen(level, time, bestTime, coinsEarned) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    // Victory text
    ctx.fillStyle = '#51cf66';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', width / 2, 80);

    // Stats
    ctx.font = '20px Arial';
    ctx.fillStyle = '#e9ecef';
    ctx.fillText(`Level ${level} Complete`, width / 2, 130);
    ctx.fillText(`Time: ${time.toFixed(2)}s`, width / 2, 160);

    if (bestTime && time < bestTime) {
      ctx.fillStyle = '#ffd43b';
      ctx.font = '18px Arial';
      ctx.fillText('New Best Time!', width / 2, 190);
    } else if (bestTime) {
      ctx.fillStyle = '#adb5bd';
      ctx.font = '16px Arial';
      ctx.fillText(`Best: ${bestTime.toFixed(2)}s`, width / 2, 190);
    }

    // Coins earned
    if (coinsEarned > 0) {
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`+${coinsEarned} 💰`, width / 2, 225);
    }

    // Buttons
    this.drawVictoryButtons(level);
  }

  drawVictoryButtons(level) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const btnWidth = 140;
    const btnHeight = 45;
    const btnY = this.canvas.height / 2 + 60;
    const spacing = 10;

    // Next Level button (or Menu if level 30)
    const btn1X = width / 2 - btnWidth - spacing / 2;
    ctx.fillStyle = level < 30 ? '#51cf66' : '#495057';
    ctx.fillRect(btn1X, btnY, btnWidth, btnHeight);
    ctx.strokeStyle = level < 30 ? '#2f9e44' : '#343a40';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn1X, btnY, btnWidth, btnHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(level < 30 ? 'Next Level' : 'Menu', btn1X + btnWidth / 2, btnY + 28);

    // Shop button
    const btn2X = width / 2 + spacing / 2;
    ctx.fillStyle = '#4dabf7';
    ctx.fillRect(btn2X, btnY, btnWidth, btnHeight);
    ctx.strokeStyle = '#1971c2';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn2X, btnY, btnWidth, btnHeight);

    ctx.fillStyle = '#fff';
    ctx.fillText('Shop', btn2X + btnWidth / 2, btnY + 28);

    // Retry button (below)
    const btn3X = width / 2 - btnWidth / 2;
    const btn3Y = btnY + btnHeight + 15;
    ctx.fillStyle = '#868e96';
    ctx.fillRect(btn3X, btn3Y, btnWidth, btnHeight);
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn3X, btn3Y, btnWidth, btnHeight);

    ctx.fillStyle = '#fff';
    ctx.fillText('Retry', btn3X + btnWidth / 2, btn3Y + 28);
  }

  drawDefeatScreen(level) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    // Defeat text
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DEFEATED', width / 2, 100);

    // Buttons
    this.drawDefeatButtons();
  }

  drawDefeatButtons() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const btnWidth = 140;
    const btnHeight = 45;
    const btnY = this.canvas.height / 2 + 20;
    const spacing = 10;

    // Retry button
    const btn1X = width / 2 - btnWidth - spacing / 2;
    ctx.fillStyle = '#51cf66';
    ctx.fillRect(btn1X, btnY, btnWidth, btnHeight);
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn1X, btnY, btnWidth, btnHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Retry', btn1X + btnWidth / 2, btnY + 28);

    // Shop button
    const btn2X = width / 2 + spacing / 2;
    ctx.fillStyle = '#4dabf7';
    ctx.fillRect(btn2X, btnY, btnWidth, btnHeight);
    ctx.strokeStyle = '#1971c2';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn2X, btnY, btnWidth, btnHeight);

    ctx.fillStyle = '#fff';
    ctx.fillText('Shop', btn2X + btnWidth / 2, btnY + 28);

    // Menu button (below)
    const btn3X = width / 2 - btnWidth / 2;
    const btn3Y = btnY + btnHeight + 15;
    ctx.fillStyle = '#868e96';
    ctx.fillRect(btn3X, btn3Y, btnWidth, btnHeight);
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn3X, btn3Y, btnWidth, btnHeight);

    ctx.fillStyle = '#fff';
    ctx.fillText('Menu', btn3X + btnWidth / 2, btn3Y + 28);
  }

  drawPauseScreen() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Paused text
    ctx.fillStyle = '#74c0fc';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', width / 2, height / 2 - 20);

    // Resume
    ctx.font = '20px Arial';
    ctx.fillStyle = '#e9ecef';
    ctx.fillText('Press ESC to resume', width / 2, height / 2 + 40);
    ctx.fillText('Click for menu', width / 2, height / 2 + 80);
  }

  drawLaserBeam(player, boss, cerberusHeads = []) {
    const ctx = this.ctx;

    // Determine laser target (prioritize alive Cerberus heads)
    const aliveHeads = cerberusHeads.filter(h => !h.isDead());
    const target = aliveHeads.length > 0 ? aliveHeads[0] : boss;

    if (!target) return;

    // Draw wide pulsing laser beam
    ctx.save();

    // Pulsing effect
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;  // 0.4-1.0

    // Outer glow
    ctx.globalAlpha = 0.3 * pulse;
    ctx.strokeStyle = '#74c0fc';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();

    // Middle beam
    ctx.globalAlpha = 0.6 * pulse;
    ctx.strokeStyle = '#4dabf7';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();

    // Core beam
    ctx.globalAlpha = 0.9 * pulse;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();

    // Target indicator (circle on hit point)
    ctx.globalAlpha = 0.5 * pulse;
    ctx.fillStyle = '#74c0fc';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawTutorialText(tutorialStep) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Big tutorial text (no dark overlay - can see game!)
    ctx.textAlign = 'center';

    const messages = {
      1: 'Use WASD to Move',
      2: 'Dodge Bullets!',
      3: 'Use Your Mouse to Aim the Boss',
      4: 'Use Q to Toggle Auto-Aim',
      5: 'Good to Go Now!'
    };

    const text = messages[tutorialStep] || '';

    // Smaller font for longer messages
    const fontSize = text.length > 25 ? 38 : 52;

    // Black outline for visibility
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.strokeText(text, width / 2, height / 2);

    // Yellow text
    ctx.fillStyle = '#ffd43b';
    ctx.fillText(text, width / 2, height / 2);
  }

  // Check which menu item was clicked based on mouse position
  getClickedMenuItem(mouseX, mouseY) {
    const width = this.canvas.width;

    // Check if click is in horizontal range (centered text area)
    if (mouseX < width / 2 - 150 || mouseX > width / 2 + 150) {
      return -1; // Clicked outside menu buttons
    }

    // Check which button was clicked based on Y position
    for (let i = 0; i < this.menuButtonY.length; i++) {
      const buttonTop = this.menuButtonY[i] - this.menuButtonHeight / 2;
      const buttonBottom = this.menuButtonY[i] + this.menuButtonHeight / 2;

      if (mouseY >= buttonTop && mouseY <= buttonBottom) {
        return i; // Return button index (0=Play, 1=Level Select, etc.)
      }
    }

    return -1; // Clicked outside all buttons
  }

  // Check which level was clicked in the level selection grid
  getClickedLevel(mouseX, mouseY) {
    const width = this.canvas.width;

    // Level grid settings (same as in drawLevelSelect)
    const cols = 6;
    const rows = 5;
    const boxSize = 70;
    const spacing = 10;
    const startX = (width - (cols * (boxSize + spacing) - spacing)) / 2;
    const startY = 100;

    // Check each level box
    for (let i = 0; i < 30; i++) {
      const level = i + 1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (boxSize + spacing);
      const y = startY + row * (boxSize + spacing);

      // Check if mouse is inside this box
      if (mouseX >= x && mouseX <= x + boxSize &&
        mouseY >= y && mouseY <= y + boxSize) {
        return level; // Return level number (1-30)
      }
    }

    return -1; // Clicked outside all level boxes
  }

  // Check which victory button was clicked
  getClickedVictoryButton(mouseX, mouseY, level) {
    const width = this.canvas.width;
    const btnWidth = 140;
    const btnHeight = 45;
    const btnY = this.canvas.height / 2 + 60;
    const spacing = 10;

    // Next Level / Menu button
    const btn1X = width / 2 - btnWidth - spacing / 2;
    if (mouseX >= btn1X && mouseX <= btn1X + btnWidth &&
      mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return level < 30 ? 'nextLevel' : 'menu';
    }

    // Shop button
    const btn2X = width / 2 + spacing / 2;
    if (mouseX >= btn2X && mouseX <= btn2X + btnWidth &&
      mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return 'shop';
    }

    // Retry button
    const btn3X = width / 2 - btnWidth / 2;
    const btn3Y = btnY + btnHeight + 15;
    if (mouseX >= btn3X && mouseX <= btn3X + btnWidth &&
      mouseY >= btn3Y && mouseY <= btn3Y + btnHeight) {
      return 'retry';
    }

    return null;
  }

  // Check which defeat button was clicked
  getClickedDefeatButton(mouseX, mouseY) {
    const width = this.canvas.width;
    const btnWidth = 140;
    const btnHeight = 45;
    const btnY = this.canvas.height / 2 + 20;
    const spacing = 10;

    // Retry button
    const btn1X = width / 2 - btnWidth - spacing / 2;
    if (mouseX >= btn1X && mouseX <= btn1X + btnWidth &&
      mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return 'retry';
    }

    // Shop button
    const btn2X = width / 2 + spacing / 2;
    if (mouseX >= btn2X && mouseX <= btn2X + btnWidth &&
      mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return 'shop';
    }

    // Menu button
    const btn3X = width / 2 - btnWidth / 2;
    const btn3Y = btnY + btnHeight + 15;
    if (mouseX >= btn3X && mouseX <= btn3X + btnWidth &&
      mouseY >= btn3Y && mouseY <= btn3Y + btnHeight) {
      return 'menu';
    }

    return null;
  }

  drawGrindModeHUD(player, wave, bossesLeft, coinsEarned, totalCoins, abilityManager, equippedAbilities) {
    const ctx = this.ctx;
    const width = this.canvas.width;

    // Player health bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;
    const barY = 20;

    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.3 ? '#51cf66' : '#ff6b6b';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${Math.ceil(player.health)}/${player.maxHealth}`, barX + 5, barY + 15);

    // Wave & Boss info
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Wave ${wave}`, barX, barY + 45);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Bosses Left: ${bossesLeft}`, barX, barY + 65);

    ctx.fillStyle = '#74c0fc';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`💰 +${coinsEarned}`, barX, barY + 85);

    // Ability Cooldown Displays
    const cdY = barY + 105;

    // Healing ability (E key)
    if (equippedAbilities.healing) {
      const healingCooldown = abilityManager.cooldowns.healing || 0;
      const healingReady = healingCooldown === 0;

      ctx.fillStyle = healingReady ? '#51cf66' : '#868e96';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('E:', barX, cdY);

      if (healingReady) {
        ctx.fillStyle = '#51cf66';
        ctx.fillText('READY', barX + 20, cdY);
      } else {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText(`${(healingCooldown / 60).toFixed(1)}s`, barX + 20, cdY);
      }
    }

    // Special ability (R key)
    if (equippedAbilities.special) {
      const specialCooldown = abilityManager.cooldowns.special || 0;
      const specialReady = specialCooldown === 0;

      ctx.fillStyle = specialReady ? '#4dabf7' : '#868e96';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('R:', barX + 100, cdY);

      if (specialReady) {
        ctx.fillStyle = '#4dabf7';
        ctx.fillText('READY', barX + 120, cdY);
      } else {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText(`${(specialCooldown / 60).toFixed(1)}s`, barX + 120, cdY);
      }
    }

    // Active ability duration displays
    let activeAbilityY = cdY + 20;

    // Shield duration
    if (abilityManager.activeEffects.shield.active) {
      const timeLeft = abilityManager.activeEffects.shield.timer / 60;
      ctx.fillStyle = '#51cf66';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🛡️ Shield: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Vampire duration
    if (abilityManager.activeEffects.vampire.active) {
      const timeLeft = abilityManager.activeEffects.vampire.timer / 60;
      ctx.fillStyle = '#e03131';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🩸 Vampire: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Laser duration
    if (abilityManager.activeEffects.laser.active) {
      const timeLeft = abilityManager.activeEffects.laser.timer / 60;
      ctx.fillStyle = '#4dabf7';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`⚡ Laser: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Disarm duration
    if (abilityManager.activeEffects.disarm.active) {
      const timeLeft = abilityManager.activeEffects.disarm.timer / 60;
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`🚫 Disarm: ${timeLeft.toFixed(1)}s`, barX, activeAbilityY);
      activeAbilityY += 15;
    }

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('GRIND MODE', width / 2, 25);

    // Auto-aim indicator (always visible in grind mode)
    ctx.textAlign = 'left';
    ctx.fillStyle = player.autoMode ? '#ffd43b' : '#868e96';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('[Q] Auto-Aim: ' + (player.autoMode ? 'ON' : 'OFF'), barX, activeAbilityY || cdY + 20);
  }

  drawGrindBreakScreen(wave, breakTimer) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, width, height);

    // Wave complete text
    ctx.fillStyle = '#51cf66';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Wave ${wave} Complete!`, width / 2, height / 2 - 40);

    // Next wave countdown
    const secondsLeft = Math.ceil(breakTimer / 60);
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`Next wave in ${secondsLeft}...`, width / 2, height / 2 + 20);

    // Get ready hint
    ctx.fillStyle = '#adb5bd';
    ctx.font = '18px Arial';
    ctx.fillText('Get ready for more bosses!', width / 2, height / 2 + 60);
  }
}

