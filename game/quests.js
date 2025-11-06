// Quest System - Permanent achievements for earning coins

class QuestManager {
  constructor() {
    this.quests = this.defineQuests();
  }

  defineQuests() {
    return {
      // Simple achievements
      firstBlood: {
        id: 'firstBlood',
        name: 'First Blood',
        description: 'Defeat your first boss',
        reward: 20,
        check: (data) => data.stats.totalKills >= 1
      },

      halfwayThere: {
        id: 'halfwayThere',
        name: 'Halfway There',
        description: 'Complete 15 levels',
        reward: 100,
        check: (data) => Object.values(data.levels).filter(l => l.completed).length >= 15
      },

      bossSlayer: {
        id: 'bossSlayer',
        name: 'Boss Slayer',
        description: 'Complete all 42 levels',
        reward: 10000,
        check: (data) => Object.values(data.levels).filter(l => l.completed).length >= 42
      },

      survivor: {
        id: 'survivor',
        name: 'Survivor',
        description: 'Beat 5 levels in a row without dying',
        reward: 100,
        check: (data) => data.stats.consecutiveWins >= 5
      },

      notEvenClose: {
        id: 'notEvenClose',
        name: 'Not Even Close',
        description: 'Complete all 42 levels without going below 50% HP',
        reward: 100000,
        check: (data) => {
          for (let i = 1; i <= 42; i++) {
            if (!data.levels[i]?.above50PercentCleared) return false;
          }
          return true;
        }
      },

      rich: {
        id: 'rich',
        name: 'Rich',
        description: 'Collect 500 total coins',
        reward: 200,
        check: (data) => data.coins >= 500
      },

      tank: {
        id: 'tank',
        name: 'Tank',
        description: 'Win with full health upgrades',
        reward: 500,
        check: (data) => data.upgrades && data.upgrades.maxHealth >= 11
      },

      glassCannon: {
        id: 'glassCannon',
        name: 'Glass Cannon',
        description: 'Win with full damage upgrades',
        reward: 500,
        check: (data) => data.upgrades && data.upgrades.bulletDamage >= 11
      },

      // Star Collector Series
      starCollector1: {
        id: 'starCollector1',
        name: 'Star Collector I',
        description: 'Get 5 stars',
        reward: 50,
        check: (data) => this.countStars(data) >= 5
      },

      starCollector2: {
        id: 'starCollector2',
        name: 'Star Collector II',
        description: 'Get 15 stars',
        reward: 150,
        check: (data) => this.countStars(data) >= 15
      },

      starCollector3: {
        id: 'starCollector3',
        name: 'Star Collector III',
        description: 'Get all 42 stars',
        reward: 500,
        check: (data) => this.countStars(data) >= 42
      },

      // Untouchable Series (requires DIFFERENT levels)
      untouchable1: {
        id: 'untouchable1',
        name: 'Untouchable I',
        description: 'Beat 1 different level without taking damage',
        reward: 30,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.noDamageCleared) count++;
          }
          return count >= 1;
        }
      },

      untouchable2: {
        id: 'untouchable2',
        name: 'Untouchable II',
        description: 'Beat 10 different levels without damage',
        reward: 500,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.noDamageCleared) count++;
          }
          return count >= 10;
        }
      },

      untouchable3: {
        id: 'untouchable3',
        name: 'Untouchable III',
        description: 'Beat 15 different levels without damage',
        reward: 1050,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.noDamageCleared) count++;
          }
          return count >= 15;
        }
      },

      untouchable4: {
        id: 'untouchable4',
        name: 'Untouchable IV',
        description: 'Beat 25 different levels without damage',
        reward: 1400,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.noDamageCleared) count++;
          }
          return count >= 25;
        }
      },

      untouchable5: {
        id: 'untdouchable5',
        name: 'Untouchable V',
        description: 'Beat all 42 levels without damage',
        reward: 99999999,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 42; i++) {
            if (data.levels[i]?.noDamageCleared) count++;
          }
          return count >= 42;
        }
      },

      untouchable6: {
        id: 'untouchable6',
        name: 'Untouchable VI',
        description: 'Beat levels 35-42 without damage',
        reward: 99900,
        check: (data) => {
          for (let i = 35; i <= 42; i++) {
            if (!data.levels[i]?.noDamageCleared) return false;
          }
          return true;
        }
      },

      // Speed Demon Series (requires DIFFERENT levels)
      speedDemon1: {
        id: 'speedDemon1',
        name: 'Speed Demon I',
        description: 'Beat 1 different level in under 30s',
        reward: 30,
        check: (data) => this.countFastTimes(data, 30) >= 1
      },

      speedDemon2: {
        id: 'speedDemon2',
        name: 'Speed Demon II',
        description: 'Beat 10 different levels in under 45s',
        reward: 300,
        check: (data) => this.countFastTimes(data, 45) >= 10
      },

      speedDemon3: {
        id: 'speedDemon3',
        name: 'Speed Demon III',
        description: 'Beat 20 different levels in under 50s',
        reward: 700,
        check: (data) => this.countFastTimes(data, 50) >= 20
      },

      speedDemon4: {
        id: 'speedDemon4',
        name: 'Speed Demon IV',
        description: 'Beat all levels 35-42 in under 100s',
        reward: 99999999,
        check: (data) => {
          for (let i = 35; i <= 42; i++) {
            const time = data.levels[i]?.bestTime;
            if (!time || time >= 100) return false;
          }
          return true;
        }
      },

      // Sharpshooter Series (requires DIFFERENT levels)
      sharpshooter1: {
        id: 'sharpshooter1',
        name: 'Sharpshooter I',
        description: 'Get 80% accuracy in 1 different level',
        reward: 40,
        check: (data) => {
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.bestAccuracy >= 80) return true;
          }
          return false;
        }
      },

      sharpshooter2: {
        id: 'sharpshooter2',
        name: 'Sharpshooter II',
        description: 'Get 90% accuracy in 1 different level',
        reward: 70,
        check: (data) => {
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.bestAccuracy >= 90) return true;
          }
          return false;
        }
      },

      sharpshooter3: {
        id: 'sharpshooter3',
        name: 'Sharpshooter III',
        description: 'Get 95% accuracy in 10 different levels',
        reward: 150,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.bestAccuracy >= 95) count++;
          }
          return count >= 10;
        }
      },

      sharpshooter4: {
        id: 'sharpshooter4',
        name: 'Sharpshooter IV',
        description: 'Get 100% accuracy in 1 different level',
        reward: 200,
        check: (data) => {
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.bestAccuracy >= 100) return true;
          }
          return false;
        }
      },

      sharpshooter5: {
        id: 'sharpshooter5',
        name: 'Sharpshooter V',
        description: 'Get 100% accuracy in 5 different levels',
        reward: 400,
        check: (data) => {
          let count = 0;
          for (let i = 1; i <= 30; i++) {
            if (data.levels[i]?.bestAccuracy >= 100) count++;
          }
          return count >= 5;
        }
      },

      sharpshooter6: {
        id: 'sharpshooter6',
        name: 'Sharpshooter VI',
        description: 'Get 100% accuracy in all levels 35-42',
        reward: 99999,
        check: (data) => {
          for (let i = 35; i <= 42; i++) {
            if (!data.levels[i]?.bestAccuracy || data.levels[i].bestAccuracy < 100) return false;
          }
          return true;
        }
      }
    };
  }

  countStars(data) {
    let count = 0;
    for (let i = 1; i <= 42; i++) {
      if (data.levels[i]?.bestTime && data.levels[i].bestTime < 60) {
        count++;
      }
    }
    return count;
  }

  countFastTimes(data, threshold) {
    let count = 0;
    for (let i = 1; i <= 42; i++) {
      if (data.levels[i]?.bestTime && data.levels[i].bestTime < threshold) {
        count++;
      }
    }
    return count;
  }

  async checkAndCompleteQuests(data, storage) {
    let coinsEarned = 0;
    if (!data.quests) data.quests = { completed: [] };

    for (const questId in this.quests) {
      const quest = this.quests[questId];
      if (quest.tracked) continue; // Tracked quests checked during gameplay

      if (!data.quests.completed.includes(questId)) {
        if (quest.check(data)) {
          const success = await storage.completeQuest(questId, quest.reward);
          if (success) {
            coinsEarned += quest.reward;
          }
        }
      }
    }

    return coinsEarned;
  }
}

