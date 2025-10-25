// HTML Menu Manager - Handles all HTML menu interactions

class HTMLMenuManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Main Menu buttons
    document.getElementById('btn-play').addEventListener('click', () => this.onPlayClick());
    document.getElementById('btn-grind').addEventListener('click', () => this.onGrindModeClick());

    // Fullscreen button
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.onFullscreenClick());
    }

    document.getElementById('btn-shop').addEventListener('click', () => this.onShopClick());
    document.getElementById('btn-quests').addEventListener('click', () => this.onQuestsClick());
    document.getElementById('btn-level-select').addEventListener('click', () => this.onLevelSelectClick());
    document.getElementById('btn-stats').addEventListener('click', () => this.onStatsClick());
    document.getElementById('btn-how-to-play').addEventListener('click', () => this.onHowToPlayClick());

    // Shop buttons (with null checks)
    const shopBackBtn = document.getElementById('btn-shop-back');
    if (shopBackBtn) shopBackBtn.addEventListener('click', () => this.showMainMenu());

    const upgradeHealthBtn = document.getElementById('btn-upgrade-health');
    if (upgradeHealthBtn) upgradeHealthBtn.addEventListener('click', () => this.upgradeHealth());

    const upgradeDamageBtn = document.getElementById('btn-upgrade-damage');
    if (upgradeDamageBtn) upgradeDamageBtn.addEventListener('click', () => this.upgradeDamage());

    // Ability boxes - delegated event listener
    document.querySelectorAll('.ability-box').forEach(box => {
      box.addEventListener('click', () => {
        const abilityId = box.getAttribute('data-ability');
        const type = box.getAttribute('data-type');
        this.onAbilityClick(type, abilityId, box);
      });
    });

    // Level Select back
    const levelSelectBackBtn = document.getElementById('btn-levelselect-back');
    if (levelSelectBackBtn) levelSelectBackBtn.addEventListener('click', () => this.showMainMenu());

    // Stats back
    const statsBackBtn = document.getElementById('btn-stats-back');
    if (statsBackBtn) statsBackBtn.addEventListener('click', () => this.showMainMenu());

    // How to Play back
    const howToPlayBackBtn = document.getElementById('btn-howtoplay-back');
    if (howToPlayBackBtn) howToPlayBackBtn.addEventListener('click', () => this.showMainMenu());

    // Quests back
    const questsBackBtn = document.getElementById('btn-quests-back');
    if (questsBackBtn) questsBackBtn.addEventListener('click', () => this.showMainMenu());

    // Victory overlay buttons
    const victoryNextBtn = document.getElementById('btn-victory-next');
    if (victoryNextBtn) victoryNextBtn.addEventListener('click', () => this.onVictoryNext());

    const victoryShopBtn = document.getElementById('btn-victory-shop');
    if (victoryShopBtn) victoryShopBtn.addEventListener('click', () => this.onShopClick());

    const victoryRetryBtn = document.getElementById('btn-victory-retry');
    if (victoryRetryBtn) victoryRetryBtn.addEventListener('click', () => this.onRetry());

    // Defeat overlay buttons
    const defeatRetryBtn = document.getElementById('btn-defeat-retry');
    if (defeatRetryBtn) defeatRetryBtn.addEventListener('click', () => this.onRetry());

    const defeatShopBtn = document.getElementById('btn-defeat-shop');
    if (defeatShopBtn) defeatShopBtn.addEventListener('click', () => this.onShopClick());

    const defeatMenuBtn = document.getElementById('btn-defeat-menu');
    if (defeatMenuBtn) defeatMenuBtn.addEventListener('click', () => this.showMainMenu());

    // Grind mode overlay buttons
    const grindRetryBtn = document.getElementById('btn-grind-retry');
    if (grindRetryBtn) grindRetryBtn.addEventListener('click', () => this.onGrindModeClick());

    const grindShopBtn = document.getElementById('btn-grind-shop');
    if (grindShopBtn) grindShopBtn.addEventListener('click', () => this.onShopClick());

    const grindMenuBtn = document.getElementById('btn-grind-menu');
    if (grindMenuBtn) grindMenuBtn.addEventListener('click', () => this.showMainMenu());
  }

  onGrindModeClick() {
    this.game.startGrindMode();
    this.showScreen('canvas');
  }

  onFullscreenClick() {
    // Open fullscreen.html in a new tab
    chrome.tabs.create({ url: 'fullscreen.html' });
  }

  showGrindOverlay(waves, coinsEarned, bestWave) {
    const overlay = document.getElementById('grindOverlay');
    document.getElementById('grindWaves').textContent = `Waves Survived: ${waves}`;
    document.getElementById('grindCoins').textContent = `+${coinsEarned} 💰`;

    if (bestWave && waves > bestWave) {
      document.getElementById('grindBest').textContent = 'New Best Wave!';
      document.getElementById('grindBest').style.color = '#ffd43b';
    } else if (bestWave) {
      document.getElementById('grindBest').textContent = `Best: Wave ${bestWave}`;
      document.getElementById('grindBest').style.color = '#adb5bd';
    } else {
      document.getElementById('grindBest').textContent = '';
    }

    overlay.classList.remove('hidden');
  }

  hideGrindOverlay() {
    document.getElementById('grindOverlay').classList.add('hidden');
  }

  showVictoryOverlay(level, time, bestTime, coinsEarned) {
    const overlay = document.getElementById('victoryOverlay');
    document.getElementById('victoryLevel').textContent = `Level ${level} Complete`;
    document.getElementById('victoryTime').textContent = `Time: ${time.toFixed(2)}s`;

    if (bestTime && time < bestTime) {
      document.getElementById('victoryBest').textContent = 'New Best Time!';
      document.getElementById('victoryBest').style.color = '#ffd43b';
    } else if (bestTime) {
      document.getElementById('victoryBest').textContent = `Best: ${bestTime.toFixed(2)}s`;
      document.getElementById('victoryBest').style.color = '#adb5bd';
    } else {
      document.getElementById('victoryBest').textContent = '';
    }

    document.getElementById('victoryCoins').textContent = coinsEarned > 0 ? `+${coinsEarned} 💰` : '';

    // Update button text
    const nextBtn = document.getElementById('btn-victory-next');
    if (level >= 50) {
      nextBtn.textContent = 'Menu';
    } else {
      nextBtn.textContent = 'Next Level';
    }

    overlay.classList.remove('hidden');
  }

  hideVictoryOverlay() {
    document.getElementById('victoryOverlay').classList.add('hidden');
  }

  showDefeatOverlay() {
    document.getElementById('defeatOverlay').classList.remove('hidden');
  }

  hideDefeatOverlay() {
    document.getElementById('defeatOverlay').classList.add('hidden');
  }

  onVictoryNext() {
    this.hideVictoryOverlay();
    if (this.game.currentLevel < 50) {
      this.game.currentLevel++;
      if (this.game.gameData.levels[this.game.currentLevel].unlocked) {
        this.game.state = 'PLAYING';
        this.game.startLevel(this.game.currentLevel);
      } else {
        this.showMainMenu();
      }
    } else {
      this.showMainMenu();
    }
  }

  onRetry() {
    this.hideVictoryOverlay();
    this.hideDefeatOverlay();
    this.game.state = 'PLAYING';
    this.game.startLevel(this.game.currentLevel);
  }

  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById('gameCanvas').classList.remove('active');

    // Hide all overlays
    document.getElementById('victoryOverlay').classList.add('hidden');
    document.getElementById('defeatOverlay').classList.add('hidden');
    document.getElementById('grindOverlay').classList.add('hidden');

    // Show requested screen
    if (screenId === 'canvas') {
      document.getElementById('gameCanvas').classList.add('active');
    } else {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.classList.remove('hidden');
      }
    }
  }

  showMainMenu() {
    this.game.state = 'MENU';
    this.showScreen('mainMenu');
  }

  async onPlayClick() {
    // Find highest unlocked level
    let highestUnlocked = 1;
    for (let i = 50; i >= 1; i--) {
      if (this.game.gameData.levels[i] && this.game.gameData.levels[i].unlocked) {
        highestUnlocked = i;
        break;
      }
    }
    this.game.currentLevel = highestUnlocked;
    this.game.state = 'PLAYING';
    this.showScreen('canvas');
    this.game.startLevel(this.game.currentLevel);
  }

  onShopClick() {
    this.game.state = 'SHOP';
    this.showScreen('shopScreen');
    this.updateShopDisplay();
  }

  onLevelSelectClick() {
    this.game.state = 'LEVEL_SELECT';
    this.showScreen('levelSelectScreen');
    this.generateLevelGrid();
  }

  onStatsClick() {
    this.game.state = 'STATS';
    this.showScreen('statsScreen');
    this.generateStatsDisplay();
  }

  onHowToPlayClick() {
    this.game.state = 'HOW_TO_PLAY';
    this.showScreen('howToPlayScreen');
  }

  onQuestsClick() {
    this.game.state = 'QUESTS';
    this.showScreen('questsScreen');
    this.generateQuestsDisplay();
  }

  async onAbilityClick(type, abilityId, element) {
    const gameData = this.game.gameData;
    const isOwned = gameData.ownedAbilities && gameData.ownedAbilities.includes(abilityId);
    const ability = this.game.abilityManager.abilities[abilityId];
    const cost = ability.cost || 100;

    if (!isOwned) {
      // Buy ability
      if (gameData.coins >= cost) {
        await this.game.storage.buyAbility(abilityId, cost);
        await this.game.storage.equipAbility(type, abilityId);
        this.game.gameData = await this.game.storage.loadData();
        this.updateShopDisplay();
      } else {
        alert(`Not enough coins! Need ${cost} coins.`);
      }
    } else {
      // Equip ability
      await this.game.storage.equipAbility(type, abilityId);
      this.game.gameData = await this.game.storage.loadData();
      this.updateShopDisplay();
    }
  }

  async upgradeHealth() {
    const success = await this.game.storage.upgradeStat('maxHealth');
    if (success) {
      this.game.gameData = await this.game.storage.loadData();
      this.updateShopDisplay();
    }
  }

  async upgradeDamage() {
    const success = await this.game.storage.upgradeStat('bulletDamage');
    if (success) {
      this.game.gameData = await this.game.storage.loadData();
      this.updateShopDisplay();
    }
  }

  updateShopDisplay() {
    const gameData = this.game.gameData;

    // Update coins display
    document.getElementById('shopCoins').textContent = `💰 ${gameData.coins || 0} Coins`;

    // Update ability boxes
    document.querySelectorAll('.ability-box').forEach(box => {
      const abilityId = box.getAttribute('data-ability');
      const type = box.getAttribute('data-type');
      const isOwned = gameData.ownedAbilities && gameData.ownedAbilities.includes(abilityId);
      const isEquipped = gameData.equippedAbilities && gameData.equippedAbilities[type] === abilityId;

      // Update classes
      box.classList.remove('owned', 'equipped');
      if (isEquipped) {
        box.classList.add('equipped');
      } else if (isOwned) {
        box.classList.add('owned');
      }

      // Update status text
      const statusSpan = box.querySelector('.ability-status');
      const ability = this.game.abilityManager.abilities[abilityId];
      const cost = ability?.cost || 100;

      if (isEquipped) {
        statusSpan.textContent = '✓ EQUIPPED';
      } else if (isOwned) {
        statusSpan.textContent = '▶ Click to Equip';
      } else {
        statusSpan.textContent = `💰 ${cost}`;
      }
    });

    // Update stat upgrades
    const costs = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100];
    const upgrades = gameData.upgrades || { maxHealth: 0, bulletDamage: 0 };

    // Health
    const healthLevel = upgrades.maxHealth || 0;
    document.getElementById('healthValue').textContent = `${100 + healthLevel * 20}/320`;
    document.getElementById('healthLevel').textContent = `Level ${healthLevel}/11`;
    const healthBtn = document.getElementById('btn-upgrade-health');
    if (healthLevel < 11) {
      healthBtn.disabled = false;
      document.getElementById('healthCost').textContent = `${costs[healthLevel]}💰`;
    } else {
      healthBtn.disabled = true;
      healthBtn.textContent = 'MAX';
    }

    // Damage
    const damageLevel = upgrades.bulletDamage || 0;
    document.getElementById('damageValue').textContent = `${25 + damageLevel * 5}/80`;
    document.getElementById('damageLevel').textContent = `Level ${damageLevel}/11`;
    const damageBtn = document.getElementById('btn-upgrade-damage');
    if (damageLevel < 11) {
      damageBtn.disabled = false;
      document.getElementById('damageCost').textContent = `${costs[damageLevel]}💰`;
    } else {
      damageBtn.disabled = true;
      damageBtn.textContent = 'MAX';
    }
  }

  generateLevelGrid() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= 50; i++) {
      const levelData = this.game.gameData.levels[i];
      const box = document.createElement('div');
      box.className = 'level-box';
      box.textContent = i;

      if (levelData && levelData.unlocked) {
        if (levelData.completed) {
          box.classList.add('completed');
        }
        box.addEventListener('click', () => {
          this.game.currentLevel = i;
          this.game.state = 'PLAYING';
          this.showScreen('canvas');
          this.game.startLevel(i);
        });
      } else {
        box.classList.add('locked');
      }

      grid.appendChild(box);
    }
  }

  generateStatsDisplay() {
    const content = document.getElementById('statsContent');
    const gameData = this.game.gameData;
    const stats = gameData.stats;
    const completed = Object.values(gameData.levels).filter(l => l.completed).length;
    const coins = gameData.coins || 0;

    let html = `
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #51cf66; font-size: 16px;">
          Completed: ${completed}/50 | Kills: ${stats.totalKills} | Deaths: ${stats.totalDeaths} | 
          Accuracy: ${stats.shotsFired > 0 ? ((stats.shotsHit / stats.shotsFired) * 100).toFixed(1) : 0}%
        </p>
        <p style="color: #ffd43b; font-size: 20px; margin-top: 10px;">
          Total Coins: 💰 ${coins}
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 13px;">
    `;

    for (let i = 1; i <= 50; i++) {
      const levelData = gameData.levels[i];
      const bestTime = levelData?.bestTime;
      const isCompleted = levelData?.completed || false;

      html += `<div style="padding: 8px; background: #2b2b2b; border-radius: 5px;">`;
      html += `<span style="color: ${isCompleted ? '#51cf66' : '#868e96'}; font-weight: bold;">L${i}:</span> `;

      if (bestTime !== null && bestTime !== undefined) {
        html += `<span style="color: #74c0fc;">${bestTime.toFixed(2)}s</span>`;
        if (bestTime < 60) {
          html += ` <span style="color: #ffd43b;">⭐</span>`;
        }
      } else if (isCompleted) {
        html += `<span style="color: #adb5bd;">--</span>`;
      } else {
        html += `<span style="color: #495057;">Not completed</span>`;
      }

      html += `</div>`;
    }

    html += `</div>`;
    content.innerHTML = html;
  }

  generateQuestsDisplay() {
    const content = document.getElementById('questsContent');
    const gameData = this.game.gameData;
    const quests = this.game.questManager.quests;
    const completedQuests = gameData.quests?.completed || [];

    let html = '';

    // Group quests by series
    const series = {
      'Star Collector': ['starCollector1', 'starCollector2', 'starCollector3'],
      'Untouchable': ['untouchable1', 'untouchable2', 'untouchable3', 'untouchable4', 'untouchable5', 'untouchable6'],
      'Speed Demon': ['speedDemon1', 'speedDemon2', 'speedDemon3', 'speedDemon4'],
      'Sharpshooter': ['sharpshooter1', 'sharpshooter2', 'sharpshooter3', 'sharpshooter4', 'sharpshooter5', 'sharpshooter6'],
      'Simple Achievements': ['firstBlood', 'halfwayThere', 'bossSlayer', 'survivor', 'notEvenClose', 'rich', 'tank', 'glassCannon']
    };

    for (const [seriesName, questIds] of Object.entries(series)) {
      html += `<h2 style="color: #4dabf7; margin: 20px 0 10px 0;">${seriesName}</h2>`;

      for (const questId of questIds) {
        const quest = quests[questId];
        if (!quest) continue;

        const isCompleted = completedQuests.includes(questId);
        const isClaimable = !isCompleted && quest.check && quest.check(gameData);

        // Get progress info
        let progress = '';
        let levels = '';

        if (questId.startsWith('starCollector')) {
          const stars = this.game.questManager.countStars(gameData);
          const target = questId === 'starCollector1' ? 5 : questId === 'starCollector2' ? 15 : 30;
          progress = `${stars}/${target} stars`;

          // Show which levels have stars
          const starLevels = [];
          for (let i = 1; i <= 50; i++) {
            if (gameData.levels[i]?.bestTime && gameData.levels[i].bestTime < 60) {
              starLevels.push(i);
            }
          }
          if (starLevels.length > 0 && starLevels.length <= 20) {
            levels = `Levels: ${starLevels.join(', ')}`;
          } else if (starLevels.length > 20) {
            levels = `${starLevels.length} levels with stars`;
          }
        } else if (questId.startsWith('untouchable')) {
          // Count DIFFERENT levels cleared without damage
          const noDamageLevels = [];
          for (let i = 1; i <= 50; i++) {
            if (gameData.levels[i]?.noDamageCleared) {
              noDamageLevels.push(i);
            }
          }

          const target = questId === 'untouchable1' ? 1 : questId === 'untouchable2' ? 10 :
            questId === 'untouchable3' ? 15 : questId === 'untouchable4' ? 25 :
              questId === 'untouchable5' ? 50 : 11;

          if (questId === 'untouchable6') {
            const specificLevels = noDamageLevels.filter(l => l >= 40 && l <= 50);
            progress = `${specificLevels.length}/11 (Levels 40-50)`;
            levels = `Complete: ${specificLevels.join(', ') || 'None'}`;
          } else {
            progress = `${noDamageLevels.length}/${target} different levels`;
            if (noDamageLevels.length > 0 && noDamageLevels.length <= 20) {
              levels = `Levels: ${noDamageLevels.join(', ')}`;
            }
          }
        } else if (questId.startsWith('speedDemon')) {
          // Show which DIFFERENT levels have fast times
          const fastLevels = [];
          const threshold = questId === 'speedDemon1' ? 30 : questId === 'speedDemon2' ? 45 :
            questId === 'speedDemon3' ? 50 : 60;

          for (let i = 1; i <= 50; i++) {
            const time = gameData.levels[i]?.bestTime;
            if (time && time < threshold) {
              fastLevels.push(i);
            }
          }

          const target = questId === 'speedDemon1' ? 1 : questId === 'speedDemon2' ? 10 :
            questId === 'speedDemon3' ? 20 : 10;

          if (questId === 'speedDemon4') {
            const lateLevels = fastLevels.filter(l => l >= 40 && l <= 50);
            progress = `${lateLevels.length}/11 (Levels 40-50)`;
            levels = `Complete: ${lateLevels.join(', ') || 'None'}`;
          } else {
            progress = `${fastLevels.length}/${target} different levels`;
            if (fastLevels.length > 0 && fastLevels.length <= 20) {
              levels = `Levels: ${fastLevels.join(', ')}`;
            }
          }
        } else if (questId.startsWith('sharpshooter')) {
          // Show accuracy progress
          const accuracyLevels = [];
          const threshold = questId === 'sharpshooter1' ? 80 : questId === 'sharpshooter2' ? 90 :
            questId.includes('3') || questId.includes('4') || questId.includes('5') || questId.includes('6') ?
              (questId.includes('3') ? 95 : 100) : 80;

          let count = 0;
          for (let i = 1; i <= 50; i++) {
            const acc = gameData.levels[i]?.bestAccuracy;
            if (acc >= threshold) {
              count++;
              if (questId === 'sharpshooter6' && i >= 40 && i <= 50) {
                accuracyLevels.push(i);
              } else if (questId !== 'sharpshooter6') {
                accuracyLevels.push(i);
              }
            }
          }

          const target = questId.includes('3') ? 10 : questId.includes('5') ? 5 : questId === 'sharpshooter6' ? 11 : 1;
          progress = `${count}/${target} levels`;
          if (accuracyLevels.length > 0 && accuracyLevels.length <= 10) {
            levels = `Levels: ${accuracyLevels.join(', ')}`;
          }
        } else if (questId === 'notEvenClose') {
          // Show Not Even Close progress
          const above50Levels = [];
          for (let i = 1; i <= 50; i++) {
            if (gameData.levels[i]?.above50PercentCleared) {
              above50Levels.push(i);
            }
          }
          progress = `${above50Levels.length}/50 levels above 50% HP`;
          if (above50Levels.length > 0 && above50Levels.length <= 20) {
            levels = `Levels: ${above50Levels.join(', ')}`;
          }
        } else {
          // Simple achievements - check directly
          progress = isCompleted ? 'Complete!' : isClaimable ? 'Ready to claim!' : 'In progress...';
        }

        const cardClass = isCompleted ? 'completed' : isClaimable ? 'claimable' : '';

        html += `
          <div class="quest-card ${cardClass}">
            <div class="quest-info">
              <div class="quest-name">${quest.name}</div>
              <div class="quest-desc">${quest.description}</div>
              <div class="quest-progress ${isCompleted ? 'complete' : ''}">${progress}</div>
              ${levels ? `<div class="quest-levels">${levels}</div>` : ''}
            </div>
            <div class="quest-reward">+${quest.reward}💰</div>
            ${isCompleted ? '<span style="color: #51cf66; font-size: 24px;">✓</span>' :
            isClaimable ? `<button class="claim-btn" data-quest-id="${questId}">CLAIM</button>` :
              '<span style="color: #868e96; font-size: 14px;">Locked</span>'}
          </div>
        `;
      }
    }

    content.innerHTML = html;

    // Add event listeners to all CLAIM buttons (CSP-safe way)
    const claimButtons = content.querySelectorAll('.claim-btn');
    claimButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const questId = e.target.getAttribute('data-quest-id');
        await this.claimQuest(questId);
      });
    });
  }

  async claimQuest(questId) {
    const quest = this.game.questManager.quests[questId];
    if (!quest) return;

    const success = await this.game.storage.completeQuest(questId, quest.reward);

    if (success) {
      this.game.gameData = await this.game.storage.loadData();
      this.generateQuestsDisplay();
      // Silent claim - no alert popup!
    }
  }
}

