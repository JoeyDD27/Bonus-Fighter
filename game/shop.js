// Shop System - UI and purchase logic

class ShopManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.selectedItem = null;
    this.selectedCategory = 'healing'; // healing, special, passive, stats
  }

  drawShop(gameData, abilityManager) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SHOP', width / 2, 40);

    // Coins display
    const coins = gameData.coins || 0;
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`💰 ${coins} Coins`, width / 2, 70);

    // Caption
    ctx.fillStyle = '#adb5bd';
    ctx.font = '14px Arial';
    ctx.fillText('You can only equip ONE ability of each type', width / 2, 95);

    const startY = 120;
    const sectionHeight = 110;

    // HEALING SECTION
    this.drawAbilitySection(
      gameData, abilityManager, 'healing',
      'HEALING (E Key) - Equip 1',
      ['healthPotion', 'shield', 'vampire'],
      startY
    );

    // SPECIAL SECTION
    this.drawAbilitySection(
      gameData, abilityManager, 'special',
      'SPECIAL (R Key) - Equip 1',
      ['laser', 'bulletStorm', 'timeSlow'],
      startY + sectionHeight
    );

    // PASSIVE SECTION
    this.drawAbilitySection(
      gameData, abilityManager, 'passive',
      'PASSIVE (Always On) - Equip 1',
      ['autoHeal', 'comboDamage', 'berserker'],
      startY + sectionHeight * 2
    );

    // STAT UPGRADES SECTION
    this.drawStatUpgrades(gameData, startY + sectionHeight * 3);

    // Instructions
    ctx.fillStyle = '#868e96';
    ctx.font = '14px Arial';
    ctx.fillText('Click abilities to buy/equip | Click [+] to upgrade stats', width / 2, height - 50);
    ctx.fillText('Press ESC to return', width / 2, height - 25);

    // DEBUG: Draw click areas (remove after testing)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    const boxWidth = 170;
    const boxHeight = 70;
    const spacing = 15;
    const startX = (width - (boxWidth * 3 + spacing * 2)) / 2;
    for (let section = 0; section < 3; section++) {
      for (let i = 0; i < 3; i++) {
        const x = startX + i * (boxWidth + spacing);
        const boxY = startY + section * sectionHeight + 15;
        ctx.strokeRect(x, boxY, boxWidth, boxHeight);
      }
    }
  }

  drawAbilitySection(gameData, abilityManager, type, label, abilityIds, y) {
    const ctx = this.ctx;
    const width = this.canvas.width;

    // Section label
    ctx.fillStyle = '#74c0fc';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, 30, y);

    // Draw ability boxes
    const boxWidth = 170;
    const boxHeight = 70;
    const spacing = 15;
    const startX = (width - (boxWidth * 3 + spacing * 2)) / 2;

    abilityIds.forEach((abilityId, index) => {
      const ability = abilityManager.abilities[abilityId];
      const x = startX + index * (boxWidth + spacing);
      const boxY = y + 15;

      const isOwned = gameData.ownedAbilities && gameData.ownedAbilities.includes(abilityId);
      const isEquipped = gameData.equippedAbilities && gameData.equippedAbilities[type] === abilityId;

      // Box background
      if (isEquipped) {
        ctx.fillStyle = '#1971c2';
      } else if (isOwned) {
        ctx.fillStyle = '#495057';
      } else {
        ctx.fillStyle = '#2b2b2b';
      }
      ctx.fillRect(x, boxY, boxWidth, boxHeight);

      // Border
      ctx.strokeStyle = isEquipped ? '#4dabf7' : '#343a40';
      ctx.lineWidth = isEquipped ? 3 : 1;
      ctx.strokeRect(x, boxY, boxWidth, boxHeight);

      // Ability name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ability.name, x + boxWidth / 2, boxY + 20);

      // Description
      ctx.font = '11px Arial';
      ctx.fillStyle = '#e9ecef';
      ctx.fillText(ability.description, x + boxWidth / 2, boxY + 38);

      // Status/Price
      ctx.font = 'bold 12px Arial';
      if (isEquipped) {
        ctx.fillStyle = '#51cf66';
        ctx.fillText('EQUIPPED', x + boxWidth / 2, boxY + 58);
      } else if (isOwned) {
        ctx.fillStyle = '#74c0fc';
        ctx.fillText('Click to Equip', x + boxWidth / 2, boxY + 58);
      } else {
        ctx.fillStyle = '#ffd43b';
        ctx.fillText('💰 100', x + boxWidth / 2, boxY + 58);
      }
    });
  }

  drawStatUpgrades(gameData, y) {
    const ctx = this.ctx;
    const width = this.canvas.width;

    // Section label
    ctx.fillStyle = '#74c0fc';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('STAT UPGRADES', 30, y);

    const upgrades = gameData.upgrades || { maxHealth: 0, bulletDamage: 0 };
    const costs = [100, 200, 300, 400, 500];  // Much more expensive!

    // Max Health upgrade
    const healthLevel = upgrades.maxHealth || 0;
    const healthValue = 100 + healthLevel * 20;
    const healthMax = 200;
    const healthCost = healthLevel < 5 ? costs[healthLevel] : null;

    this.drawStatUpgradeBox(30, y + 20, 'Max Health', healthValue, healthMax, healthLevel, healthCost);

    // Bullet Damage upgrade
    const damageLevel = upgrades.bulletDamage || 0;
    const damageValue = 25 + damageLevel * 5;
    const damageMax = 50;
    const damageCost = damageLevel < 5 ? costs[damageLevel] : null;

    this.drawStatUpgradeBox(width / 2 + 20, y + 20, 'Bullet Damage', damageValue, damageMax, damageLevel, damageCost);
  }

  drawStatUpgradeBox(x, y, name, current, max, level, cost) {
    const ctx = this.ctx;
    const boxWidth = 240;
    const boxHeight = 60;

    // Box
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(x, y, boxWidth, boxHeight);
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(name, x + 10, y + 20);

    // Current/Max
    ctx.fillStyle = '#74c0fc';
    ctx.font = '13px Arial';
    ctx.fillText(`${current}/${max}`, x + 10, y + 40);

    // Level
    ctx.fillStyle = '#adb5bd';
    ctx.font = '12px Arial';
    ctx.fillText(`Level ${level}/5`, x + 10, y + 55);

    // Upgrade button
    if (cost !== null) {
      const btnX = x + boxWidth - 70;
      const btnY = y + 15;
      const btnWidth = 60;
      const btnHeight = 35;

      ctx.fillStyle = '#51cf66';
      ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
      ctx.strokeStyle = '#2f9e44';
      ctx.lineWidth = 2;
      ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('[+]', btnX + btnWidth / 2, btnY + 15);
      ctx.fillStyle = '#ffd43b';
      ctx.font = '11px Arial';
      ctx.fillText(`${cost}💰`, btnX + btnWidth / 2, btnY + 30);
    } else {
      ctx.fillStyle = '#51cf66';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('MAX', x + boxWidth - 10, y + 40);
    }
  }

  getClickedAbility(mouseX, mouseY, gameData, abilityManager) {
    const width = this.canvas.width;
    const startY = 120;
    const sectionHeight = 110;
    const boxWidth = 170;
    const boxHeight = 70;
    const spacing = 15;
    const startX = (width - (boxWidth * 3 + spacing * 2)) / 2;

    const sections = [
      { type: 'healing', y: startY, abilities: ['healthPotion', 'shield', 'vampire'] },
      { type: 'special', y: startY + sectionHeight, abilities: ['laser', 'bulletStorm', 'timeSlow'] },
      { type: 'passive', y: startY + sectionHeight * 2, abilities: ['autoHeal', 'comboDamage', 'berserker'] }
    ];

    for (const section of sections) {
      section.abilities.forEach((abilityId, index) => {
        const x = startX + index * (boxWidth + spacing);
        const boxY = section.y + 15;

        if (mouseX >= x && mouseX <= x + boxWidth &&
          mouseY >= boxY && mouseY <= boxY + boxHeight) {
          return { type: section.type, abilityId: abilityId };
        }
      });
    }

    return null;
  }

  getClickedStatUpgrade(mouseX, mouseY, gameData) {
    const startY = 120 + 110 * 3;

    // Max Health upgrade button
    const healthBtnX = 30 + 240 - 70;
    const healthBtnY = startY + 20 + 15;
    if (mouseX >= healthBtnX && mouseX <= healthBtnX + 60 &&
      mouseY >= healthBtnY && mouseY <= healthBtnY + 35) {
      const level = gameData.upgrades?.maxHealth || 0;
      if (level < 5) return 'maxHealth';
    }

    // Bullet Damage upgrade button
    const damageBtnX = this.canvas.width / 2 + 20 + 240 - 70;
    const damageBtnY = startY + 20 + 15;
    if (mouseX >= damageBtnX && mouseX <= damageBtnX + 60 &&
      mouseY >= damageBtnY && mouseY <= damageBtnY + 35) {
      const level = gameData.upgrades?.bulletDamage || 0;
      if (level < 5) return 'bulletDamage';
    }

    return null;
  }
}

