// Chrome Storage Manager for game progress and stats
class StorageManager {
  constructor() {
    this.defaultData = {
      levels: {},
      stats: {
        totalKills: 0,
        totalDeaths: 0,
        shotsFired: 0,
        shotsHit: 0,
        totalPlayTime: 0,
        levelsWithoutDamage: 0,  // For Untouchable quests
        consecutiveWins: 0  // For Survivor quest
      },
      coins: 0,  // Start with 0 coins - earn through gameplay!
      ownedAbilities: [],  // Array of owned ability IDs
      equippedAbilities: {
        healing: null,  // 'healthPotion', 'shield', 'vampire'
        special: null,  // 'laser', 'bulletStorm', 'timeSlow'
        passive: null   // 'autoHeal', 'tactician', 'Revenge'
      },
      upgrades: {
        maxHealth: 0,      // 0-5 levels
        bulletDamage: 0    // 0-5 levels
      },
      quests: {
        completed: []  // Array of completed quest IDs
      },
      hasSeenTutorial: false  // Track if player has seen How to Play
    };

    // Initialize all 50 levels
    for (let i = 1; i <= 50; i++) {
      this.defaultData.levels[i] = {
        unlocked: i === 1,  // Only level 1 unlocked at start
        completed: false,  // No levels pre-beaten
        bestTime: null,
        hasStarReward: false,
        noDamageCleared: false,  // For Untouchable tracking
        bestAccuracy: null,  // For Sharpshooter tracking
        above50PercentCleared: false  // For Not Even Close quest
      };
    }
  }

  async loadData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['gameData'], (result) => {
        if (result.gameData) {
          resolve(result.gameData);
        } else {
          resolve(this.defaultData);
        }
      });
    });
  }

  async saveData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ gameData: data }, () => {
        resolve();
      });
    });
  }

  async unlockLevel(levelNumber) {
    const data = await this.loadData();
    if (data.levels[levelNumber]) {
      data.levels[levelNumber].unlocked = true;
    }
    await this.saveData(data);
  }

  async completeLevel(levelNumber, time, accuracy, stayedAbove50Percent = false) {
    const data = await this.loadData();
    let coinsEarned = 0;

    if (data.levels[levelNumber]) {
      const wasCompleted = data.levels[levelNumber].completed;
      const oldBestTime = data.levels[levelNumber].bestTime;
      const hadStar = data.levels[levelNumber].hasStarReward;

      data.levels[levelNumber].completed = true;

      // Track if player stayed above 50% health
      if (stayedAbove50Percent) {
        data.levels[levelNumber].above50PercentCleared = true;
      }

      // Award coins for first completion
      if (!wasCompleted) {
        if (levelNumber <= 10) {
          coinsEarned += 10;
        } else if (levelNumber <= 20) {
          coinsEarned += 20;
        } else if (levelNumber <= 30) {
          coinsEarned += 30;
        } else if (levelNumber <= 40) {
          coinsEarned += 40;
        } else {
          coinsEarned += 50; // Levels 41-50
        }
      }

      // Update best time
      if (!data.levels[levelNumber].bestTime || time < data.levels[levelNumber].bestTime) {
        data.levels[levelNumber].bestTime = time;
      }

      // Update best accuracy
      if (!data.levels[levelNumber].bestAccuracy || accuracy > data.levels[levelNumber].bestAccuracy) {
        data.levels[levelNumber].bestAccuracy = accuracy;
      }

      // Award coins for NEW star (time under 60 seconds = 1 minute)
      if (time < 60 && !hadStar) {
        data.levels[levelNumber].hasStarReward = true;
        if (levelNumber <= 10) {
          coinsEarned += 5;
        } else if (levelNumber <= 20) {
          coinsEarned += 10;
        } else if (levelNumber <= 30) {
          coinsEarned += 15;
        } else if (levelNumber <= 40) {
          coinsEarned += 20;
        } else {
          coinsEarned += 25; // Levels 41-50
        }
      }

      // Add coins
      if (!data.coins) data.coins = 0;
      data.coins += coinsEarned;

      // Unlock next level
      if (levelNumber < 50 && data.levels[levelNumber + 1]) {
        data.levels[levelNumber + 1].unlocked = true;
      }
    }

    await this.saveData(data);
    return coinsEarned;  // Return how many coins were earned
  }

  async updateStats(stats) {
    const data = await this.loadData();
    Object.keys(stats).forEach(key => {
      if (data.stats[key] !== undefined) {
        data.stats[key] += stats[key];
      }
    });
    await this.saveData(data);
  }

  async resetProgress() {
    await this.saveData(this.defaultData);
  }

  // Buy an ability
  async buyAbility(abilityId, cost) {
    const data = await this.loadData();
    if (!data.ownedAbilities) data.ownedAbilities = [];
    if (!data.ownedAbilities.includes(abilityId)) {
      if (data.coins >= cost) {
        data.ownedAbilities.push(abilityId);
        data.coins -= cost;
        await this.saveData(data);
        return true;
      }
    }
    return false;
  }

  // Equip an ability
  async equipAbility(abilityType, abilityId) {
    const data = await this.loadData();
    if (!data.equippedAbilities) data.equippedAbilities = { healing: null, special: null, passive: null };
    data.equippedAbilities[abilityType] = abilityId;
    await this.saveData(data);
  }

  // Upgrade a stat
  async upgradeStat(statType) {
    const data = await this.loadData();
    if (!data.upgrades) data.upgrades = { maxHealth: 0, bulletDamage: 0 };

    const currentLevel = data.upgrades[statType] || 0;
    if (currentLevel >= 11) return false;  // Max 11 levels now!

    const costs = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100];
    const cost = costs[currentLevel];

    if (data.coins >= cost) {
      data.upgrades[statType]++;
      data.coins -= cost;
      await this.saveData(data);
      return true;
    }
    return false;
  }

  // Complete a quest
  async completeQuest(questId, reward) {
    const data = await this.loadData();
    if (!data.quests) data.quests = { completed: [] };
    if (!data.quests.completed.includes(questId)) {
      data.quests.completed.push(questId);
      data.coins += reward;
      await this.saveData(data);
      return true;
    }
    return false;
  }
}

