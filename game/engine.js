// Main Game Engine
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Game state
    this.state = 'MENU'; // MENU, LEVEL_SELECT, PLAYING, PAUSED, VICTORY, DEFEAT, STATS, HOW_TO_PLAY, SHOP, GRIND_MODE, GRIND_BREAK
    this.currentLevel = 1;
    this.levelTime = 0;

    // Grind mode state
    this.isGrindMode = false;
    this.grindWave = 0;
    this.grindCoinsEarned = 0;
    this.grindBosses = [];
    this.grindBreakTimer = 0;

    // Tutorial state
    this.tutorialActive = false;
    this.tutorialStep = 0;
    this.tutorialHasMoved = false;
    this.tutorialHasHitBoss = false;
    this.tutorialHasToggledQ = false;

    // Game objects
    this.player = null;
    this.boss = null;
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ghosts = [];  // Ghost minions
    this.firePools = [];  // Fire pools from Dragon
    this.cerberusHeads = [];  // Cerberus heads (multi-entity boss)

    // Systems
    this.storage = new StorageManager();
    this.controls = new Controls(canvas);
    this.ui = new UIManager(canvas, this.ctx);
    this.abilityManager = new AbilityManager();
    this.questManager = new QuestManager();
    this.shopManager = new ShopManager(canvas, this.ctx);
    this.animationManager = new AnimationManager();

    // Game data
    this.gameData = null;

    // Session stats
    this.sessionStats = {
      shotsFired: 0,
      shotsHit: 0
    };

    // Menu navigation
    this.menuCooldown = 0;
    this.clickCooldown = 0;

    // Coins earned this victory
    this.coinsEarned = 0;

    // Initialize
    this.init();
  }

  async init() {
    this.gameData = await this.storage.loadData();
  }

  start() {
    this.gameLoop();
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (!this.gameData) return;

    // Update cooldowns
    if (this.menuCooldown > 0) this.menuCooldown--;
    if (this.clickCooldown > 0) this.clickCooldown--;

    // Only update gameplay states - HTML menus handle themselves
    switch (this.state) {
      case 'PLAYING':
      case 'GRIND_MODE':
        this.updatePlaying();
        break;
      case 'GRIND_BREAK':
        this.updateGrindBreak();
        break;
      case 'PAUSED':
        this.updatePaused();
        break;
      case 'VICTORY':
        this.updateVictory();
        break;
      case 'DEFEAT':
        this.updateDefeat();
        break;
    }
  }

  updateGrindBreak() {
    if (this.grindBreakTimer > 0) {
      this.grindBreakTimer--;
    }
    if (this.grindBreakTimer <= 0) {
      // Start next wave
      this.startGrindWave();
    }
  }

  updateMenu() {
    const keys = this.controls.keys;

    // Navigation
    if (this.menuCooldown === 0) {
      if (keys['w'] || keys['ArrowUp']) {
        this.ui.selectedMenuItem = Math.max(0, this.ui.selectedMenuItem - 1);
        this.menuCooldown = 15;
      }
      if (keys['s'] || keys['ArrowDown']) {
        this.ui.selectedMenuItem = Math.min(4, this.ui.selectedMenuItem + 1);  // Changed from 3 to 4
        this.menuCooldown = 15;
      }
    }

    // Keyboard selection (spacebar)
    if (keys[' '] && this.menuCooldown === 0) {
      this.selectMenuItem();
      this.menuCooldown = 15;
    }

    // Mouse click selection - check WHERE the mouse clicked
    if (this.controls.mouse.down && this.clickCooldown === 0) {
      const mousePos = this.controls.getAimPosition();
      const clickedItem = this.ui.getClickedMenuItem(mousePos.x, mousePos.y);

      if (clickedItem >= 0) {
        // Valid button was clicked - select and activate it
        this.ui.selectedMenuItem = clickedItem;
        this.selectMenuItem();
      }

      this.clickCooldown = 15;
    }
  }

  selectMenuItem() {
    switch (this.ui.selectedMenuItem) {
      case 0: // Play
        // Find the highest unlocked level
        let highestUnlocked = 1;
        for (let i = 30; i >= 1; i--) {
          if (this.gameData.levels[i] && this.gameData.levels[i].unlocked) {
            highestUnlocked = i;
            break;
          }
        }
        this.currentLevel = highestUnlocked;
        this.startLevel(this.currentLevel);
        break;
      case 1: // Shop
        this.state = 'SHOP';
        break;
      case 2: // Level Select
        this.state = 'LEVEL_SELECT';
        break;
      case 3: // Stats
        this.state = 'STATS';
        break;
      case 4: // How to Play
        this.state = 'HOW_TO_PLAY';
        break;
    }
  }

  updateLevelSelect() {
    const keys = this.controls.keys;

    if (this.menuCooldown === 0) {
      // Navigation
      let changed = false;
      if (keys['ArrowLeft'] || keys['a']) {
        if (this.ui.selectedLevel > 1) {
          this.ui.selectedLevel--;
          changed = true;
        }
      }
      if (keys['ArrowRight'] || keys['d']) {
        if (this.ui.selectedLevel < 30) {
          this.ui.selectedLevel++;
          changed = true;
        }
      }
      if (keys['ArrowUp'] || keys['w']) {
        if (this.ui.selectedLevel > 6) {
          this.ui.selectedLevel -= 6;
          changed = true;
        }
      }
      if (keys['ArrowDown'] || keys['s']) {
        if (this.ui.selectedLevel <= 24) {
          this.ui.selectedLevel += 6;
          changed = true;
        }
      }

      if (changed) {
        this.menuCooldown = 10;
      }

      // Back to menu
      if (keys['Escape']) {
        this.state = 'MENU';
        this.menuCooldown = 15;
      }
    }

    // Keyboard selection (spacebar)
    if (keys[' '] && this.menuCooldown === 0) {
      const levelData = this.gameData.levels[this.ui.selectedLevel];
      if (levelData && levelData.unlocked) {
        this.currentLevel = this.ui.selectedLevel;
        this.startLevel(this.currentLevel);
      }
      this.menuCooldown = 15;
    }

    // Mouse click selection - check WHICH level box was clicked
    if (this.controls.mouse.down && this.clickCooldown === 0) {
      const mousePos = this.controls.getAimPosition();
      const clickedLevel = this.ui.getClickedLevel(mousePos.x, mousePos.y);

      if (clickedLevel > 0) {
        // Valid level box was clicked
        const levelData = this.gameData.levels[clickedLevel];
        if (levelData && levelData.unlocked) {
          // Start the clicked level
          this.currentLevel = clickedLevel;
          this.startLevel(this.currentLevel);
        }
        // Also update selected level for visual feedback
        this.ui.selectedLevel = clickedLevel;
      }

      this.clickCooldown = 15;
    }
  }

  updateStats() {
    if (this.controls.keys['Escape'] || (this.controls.mouse.down && this.clickCooldown === 0)) {
      this.state = 'MENU';
      this.clickCooldown = 15;
    }
  }

  updateHowToPlay() {
    if (this.controls.keys['Escape'] || (this.controls.mouse.down && this.clickCooldown === 0)) {
      this.state = 'MENU';
      this.clickCooldown = 15;
    }
  }

  updateShop() {
    const keys = this.controls.keys;

    // Back to menu
    if (keys['Escape'] && this.menuCooldown === 0) {
      this.state = 'MENU';
      this.menuCooldown = 15;
      return;
    }

    // Handle clicks (must check on click DOWN, not while held)
    if (this.controls.mouse.down && this.clickCooldown === 0) {
      const mousePos = this.controls.getAimPosition();

      console.log('Shop click at:', mousePos.x, mousePos.y);  // Debug

      // Check ability click
      const clickedAbility = this.shopManager.getClickedAbility(mousePos.x, mousePos.y, this.gameData, this.abilityManager);
      console.log('Clicked ability:', clickedAbility);  // Debug

      if (clickedAbility) {
        this.handleAbilityClick(clickedAbility);
      }

      // Check stat upgrade click
      const clickedStat = this.shopManager.getClickedStatUpgrade(mousePos.x, mousePos.y, this.gameData);
      if (clickedStat) {
        this.handleStatUpgrade(clickedStat);
      }

      this.clickCooldown = 15;
    }
  }

  async handleAbilityClick(clickedAbility) {
    const { type, abilityId } = clickedAbility;
    const isOwned = this.gameData.ownedAbilities && this.gameData.ownedAbilities.includes(abilityId);
    const ability = this.abilityManager.abilities[abilityId];
    const cost = ability.cost || 100;

    console.log('Handle ability click:', type, abilityId, 'Owned:', isOwned, 'Cost:', cost, 'Coins:', this.gameData.coins);

    if (!isOwned) {
      // Buy ability
      if (this.gameData.coins >= cost) {
        console.log('Buying ability:', abilityId, 'for', cost);
        await this.storage.buyAbility(abilityId, cost);
        await this.storage.equipAbility(type, abilityId);
        this.gameData = await this.storage.loadData();
        console.log('Purchase complete! New coins:', this.gameData.coins);
      } else {
        console.log('Not enough coins! Need', cost, 'have', this.gameData.coins);
      }
    } else {
      // Equip ability
      console.log('Equipping ability:', abilityId);
      await this.storage.equipAbility(type, abilityId);
      this.gameData = await this.storage.loadData();
      console.log('Equipped!');
    }
  }

  async handleStatUpgrade(statType) {
    const success = await this.storage.upgradeStat(statType);
    if (success) {
      this.gameData = await this.storage.loadData();
    }
  }

  async startLevel(level) {
    this.currentLevel = level;
    this.state = 'PLAYING';
    this.levelTime = 0;
    this.startingHealth = 0;
    this.wentBelow50Percent = false;
    this.isGrindMode = false;

    // Check if this is first time on level 1 (tutorial)
    const data = await this.storage.loadData();
    if (level === 1 && !data.hasCompletedInGameTutorial) {
      this.tutorialActive = true;
      this.tutorialStep = 1;
      this.tutorialHasMoved = false;
      this.tutorialHasHitBoss = false;
      this.tutorialHasToggledQ = false;
      console.log('Tutorial activated!');
    } else {
      this.tutorialActive = false;
    }

    // Show canvas, hide HTML menus
    if (this.htmlMenus) {
      this.htmlMenus.showScreen('canvas');
    }

    // Create player with stat upgrades + equipped abilities
    const upgrades = this.gameData.upgrades || { maxHealth: 0, bulletDamage: 0 };
    const equippedAbilities = this.gameData.equippedAbilities || {};
    this.player = new Player(this.width / 2, this.height - 100, upgrades, equippedAbilities);
    this.startingHealth = this.player.health;

    // Create boss with scaling based on player upgrades
    this.boss = BossFactory.createBoss(level, upgrades);

    // Clear bullets, ghosts, fire pools, and cerberus heads
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ghosts = [];  // Clear ghost minions
    this.firePools = [];  // Clear fire pools
    this.cerberusHeads = [];  // Clear old cerberus heads

    // Spawn Cerberus heads if this is Cerberus (level 38)
    if (this.boss.multiEntity && level === 38) {
      this.cerberusHeads = [
        new CerberusHead(this.width / 2 - 100, 100, 'fire', this.boss.phase),
        new CerberusHead(this.width / 2 + 100, 100, 'ice', this.boss.phase),
        new CerberusHead(this.width / 2, 70, 'poison', this.boss.phase)
      ];
      console.log('Cerberus heads spawned:', this.cerberusHeads.length);
    }

    // Reset session stats
    this.sessionStats = {
      shotsFired: 0,
      shotsHit: 0
    };

    // Reset ability cooldowns and durations
    this.abilityManager.cooldowns = { healing: 0, special: 0 };
    this.abilityManager.activeEffects = {
      shield: { active: false, timer: 0 },
      vampire: { active: false, timer: 0 },
      laser: { active: false, timer: 0 },
      disarm: { active: false, timer: 0 },
      vulnerability: { active: false, timer: 0 }
    };
    this.abilityManager.comboCounter = 0;

    // Reset controls
    this.controls.reset();
  }

  startGrindMode() {
    this.isGrindMode = true;
    this.grindWave = 0;
    this.grindCoinsEarned = 0;
    this.grindBosses = [];
    this.state = 'GRIND_MODE';

    // Create player
    const upgrades = this.gameData.upgrades || { maxHealth: 0, bulletDamage: 0 };
    const equippedAbilities = this.gameData.equippedAbilities || {};
    this.player = new Player(this.width / 2, this.height - 100, upgrades, equippedAbilities);

    // Clear bullets and ghosts
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ghosts = [];

    // Reset abilities
    this.abilityManager.cooldowns = { healing: 0, special: 0 };
    this.abilityManager.activeEffects = {
      shield: { active: false, timer: 0 },
      vampire: { active: false, timer: 0 },
      laser: { active: false, timer: 0 },
      disarm: { active: false, timer: 0 },
      vulnerability: { active: false, timer: 0 }
    };

    // Start first wave
    this.startGrindWave();
  }

  startGrindWave() {
    this.grindWave++;
    this.state = 'GRIND_MODE';
    const upgrades = this.gameData.upgrades || { maxHealth: 0, bulletDamage: 0 };

    // Spawn single random boss per wave
    this.grindBosses = [];
    const bossCount = 1; // Always 1 boss per wave

    console.log('Starting wave', this.grindWave, 'with', bossCount, 'boss');

    // Determine boss level range based on wave number (every 5 waves = new boss tier)
    const tier = Math.floor((this.grindWave - 1) / 5);
    const minLevel = Math.min(tier * 5 + 1, 38); // Max starts at 38
    const maxLevel = Math.min((tier + 1) * 5, 42); // Max ends at 42

    console.log('Wave', this.grindWave, '- Boss range:', minLevel, 'to', maxLevel);

    for (let i = 0; i < bossCount; i++) {
      const randomLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
      const boss = BossFactory.createBoss(randomLevel, upgrades);

      console.log('Created boss', boss.name, 'Level', randomLevel);

      // Position bosses spread out if multiple
      if (bossCount > 1) {
        boss.x = (this.width / (bossCount + 1)) * (i + 1);
        boss.y = 100 + Math.random() * 50;
      }

      this.grindBosses.push(boss);
    }

    this.boss = this.grindBosses[0]; // Set first boss as main boss
    console.log('Main boss set:', this.boss.name);

    // Clear bullets and ghosts
    this.enemyBullets = [];
    this.ghosts = [];
  }

  updatePlaying() {
    // Tutorial logic
    if (this.tutorialActive) {
      // Step 1: Wait for movement
      if (this.tutorialStep === 1) {
        if (this.controls.keys['w'] || this.controls.keys['a'] || this.controls.keys['s'] || this.controls.keys['d'] ||
          this.controls.keys['ArrowUp'] || this.controls.keys['ArrowLeft'] || this.controls.keys['ArrowDown'] || this.controls.keys['ArrowRight']) {
          this.tutorialHasMoved = true;
          this.tutorialStep = 2;
          console.log('Player moved! Step 2');
        }
        return;  // Pause game until moved
      }

      // Step 2: Boss shoots one bullet, show dodge message
      if (this.tutorialStep === 2) {
        // Wait 2 seconds then progress
        if (this.levelTime > 1) {
          this.tutorialStep = 3;
          console.log('Step 3: Aim at boss');
        }
      }

      // Step 3: Wait for player to hit boss
      if (this.tutorialStep === 3) {
        if (this.tutorialHasHitBoss) {
          this.tutorialStep = 4;
          console.log('Hit boss! Step 4');
        }
      }

      // Step 4: Wait for Q toggle
      if (this.tutorialStep === 4) {
        if (this.tutorialHasToggledQ) {
          this.tutorialStep = 5;
          setTimeout(async () => {
            this.tutorialActive = false;
            const data = await this.storage.loadData();
            data.hasCompletedInGameTutorial = true;
            await this.storage.saveData(data);
            console.log('Tutorial complete!');
          }, 2000);  // Show "Good to go" for 2 seconds
        }
      }
    }

    // Update time
    this.levelTime += 1 / 60;

    // Toggle auto-mode with 'Q' key
    if (this.controls.keys['q'] && this.menuCooldown === 0) {
      this.player.toggleAutoMode();
      this.menuCooldown = 15;
      if (this.tutorialActive) {
        this.tutorialHasToggledQ = true;
      }
    }

    // Activate healing ability (E key) - blocked when petrified
    if (this.controls.keys['e'] && this.menuCooldown === 0 && !this.player.petrified) {
      console.log('E pressed! Equipped:', this.gameData.equippedAbilities?.healing, 'Cooldown:', this.abilityManager.cooldowns.healing);
      const result = this.abilityManager.activateAbility('healing', this.gameData.equippedAbilities || {}, this.player);
      console.log('Healing result:', result);
      if (result) {
        this.menuCooldown = 15;
      }
    }

    // Activate special ability (R key) - blocked when petrified
    if (this.controls.keys['r'] && this.menuCooldown === 0 && !this.player.petrified) {
      console.log('R pressed! Equipped:', this.gameData.equippedAbilities?.special, 'Cooldown:', this.abilityManager.cooldowns.special);
      const result = this.abilityManager.activateAbility('special', this.gameData.equippedAbilities || {}, this.player);
      console.log('Special result:', result);
      if (result && result.bullets) {
        this.playerBullets.push(...result.bullets);
      }
      if (result && result.clearBullets) {
        // Disarm ability - clear all enemy bullets + deal damage
        this.enemyBullets = [];
        if (this.boss) {
          this.boss.takeDamage(this.player.bulletDamage, 'disarm');
          this.applyVampireHeal(this.player.bulletDamage);
        }
      }
      if (result) {
        this.menuCooldown = 15;
      }
    }

    // Update ability manager (cooldowns, passive effects)
    this.abilityManager.update(this.player, this.gameData.equippedAbilities || {});

    // Update player aim (with auto-aim if enabled, prioritize Cerberus heads)
    if (this.player) {
      const aimPos = this.controls.getAimPosition();
      this.player.setAimPosition(aimPos.x, aimPos.y, this.boss, this.cerberusHeads);
    }

    // Update player
    this.player.update(this.controls.keys, this.width, this.height);

    // Track if player went below 50% health
    if (this.player.health < this.player.maxHealth * 0.5) {
      this.wentBelow50Percent = true;
    }

    // Player shooting (auto-shoot or manual)
    if (this.controls.isShooting() || this.player.shouldAutoShoot()) {
      const bullet = this.player.shoot();
      if (bullet) {
        // Apply combo damage if equipped
        if (this.gameData.equippedAbilities?.passive === 'comboDamage') {
          const isCombo = this.abilityManager.incrementCombo();
          if (isCombo) {
            bullet.damage *= 2;  // 100% bonus damage on 3rd hit
          }
        }

        this.playerBullets.push(bullet);
        this.sessionStats.shotsFired++;
      }
    }

    // Update Cerberus heads
    for (const head of this.cerberusHeads) {
      head.update();

      // Heads shoot
      const headBullets = head.shoot(this.player);
      if (headBullets && headBullets.length > 0) {
        this.enemyBullets.push(...headBullets);
      }
    }

    // Update boss(es)
    if (this.isGrindMode) {
      // Update all bosses in grind mode
      this.grindBosses.forEach(boss => {
        boss.update(this.player, this.width, this.height);

        // Laser beam damage if active (distributed across all bosses)
        if (this.abilityManager.isLaserActive()) {
          const laserDamage = this.player.bulletDamage * 0.0375 / this.grindBosses.length * this.abilityManager.getVulnerabilityMultiplier();
          boss.takeDamage(laserDamage, 'laser');
          this.applyVampireHeal(laserDamage);
        }

        // Boss shooting (unless disarmed)
        if (!this.abilityManager.isDisarmActive()) {
          const newBullets = boss.shoot(this.player);
          if (newBullets && newBullets.length > 0) {
            this.enemyBullets.push(...newBullets);
          }
        }
      });
    } else {
      // Normal mode - single boss
      this.boss.update(this.player, this.width, this.height);

      // Laser beam damage if active (targets heads if alive, otherwise body)
      if (this.abilityManager.isLaserActive()) {
        const laserDamage = this.player.bulletDamage * 0.0375 * this.abilityManager.getVulnerabilityMultiplier();

        // Prioritize heads if they exist
        const aliveHeads = this.cerberusHeads.filter(h => !h.isDead());
        if (aliveHeads.length > 0) {
          // Split laser damage among alive heads
          aliveHeads.forEach(head => {
            head.takeDamage(laserDamage / aliveHeads.length);
            this.applyVampireHeal(laserDamage / aliveHeads.length);
          });
        } else {
          // No heads, damage boss normally
          this.boss.takeDamage(laserDamage, 'laser');
          this.applyVampireHeal(laserDamage);
        }
      }

      // Necromancer ghost spawning (1 ghost every 5 seconds, max 4)
      if (this.boss.summonsGhosts) {
        this.boss.ghostSpawnTimer++;
        if (this.boss.ghostSpawnTimer >= 300 && this.ghosts.length < 4) {  // 300 frames = 5 seconds
          console.log('Spawning ghost! Current:', this.ghosts.length);
          const offsetAngle = Math.random() * Math.PI * 2;
          const spawnX = this.boss.x + Math.cos(offsetAngle) * 50;
          const spawnY = this.boss.y + Math.sin(offsetAngle) * 50;
          this.ghosts.push(new Ghost(spawnX, spawnY));
          this.boss.ghostSpawnTimer = 0;  // Reset timer
          console.log('Ghosts after spawn:', this.ghosts.length);
        }
      }

      // Dragon fire pool spawning (2-4 pools every 2 seconds)
      if (this.boss.spawnsFirePools) {
        this.boss.firePoolTimer++;
        if (this.boss.firePoolTimer >= 120) {  // 120 frames = 2 seconds
          const poolCount = 2 + this.boss.phase;  // 3, 4, 5 pools per spawn
          for (let i = 0; i < poolCount; i++) {
            const poolX = Math.random() * (this.width - 100) + 50;
            const poolY = Math.random() * (this.height - 200) + 100;
            this.firePools.push(new FirePool(poolX, poolY, 50, 360, 30));  // 30 HP/sec (same as ghosts)
          }
          this.boss.firePoolTimer = 0;
        }
      }

      // Medusa stone gaze (every 4 seconds)
      if (this.boss.gazeDelay > 0) {
        this.boss.gazeCooldown++;
        if (this.boss.gazeCooldown >= this.boss.gazeDelay) {
          // Shoot petrify beam
          const dx = this.player.x - this.boss.x;
          const dy = this.player.y - this.boss.y;
          const angle = Math.atan2(dy, dx);

          const gazeBullet = new Projectile(this.boss.x, this.boss.y, angle, 10, 24, '#ffffff', 0, false, true);
          gazeBullet.petrify = true;
          gazeBullet.petrifyDuration = 180;  // 3 seconds frozen
          this.enemyBullets.push(gazeBullet);

          this.boss.gazeCooldown = 0;
        }
      }

      // GOD MODE special mechanics based on phase
      if (this.boss.godMode) {
        // Phase 2+: Spawn ghosts (max 2)
        if (this.boss.phase >= 2 && this.boss.phase <= 6) {
          this.boss.ghostSpawnTimer = (this.boss.ghostSpawnTimer || 0) + 1;
          if (this.boss.ghostSpawnTimer >= 300 && this.ghosts.length < 2) {
            const offsetAngle = Math.random() * Math.PI * 2;
            const spawnX = this.boss.x + Math.cos(offsetAngle) * 60;
            const spawnY = this.boss.y + Math.sin(offsetAngle) * 60;
            this.ghosts.push(new Ghost(spawnX, spawnY));
            this.boss.ghostSpawnTimer = 0;
          }
        }

        // Phase 2+: Spawn fire pools
        if (this.boss.phase >= 2 && this.boss.phase <= 6) {
          this.boss.firePoolTimer = (this.boss.firePoolTimer || 0) + 1;
          if (this.boss.firePoolTimer >= 180) {  // Every 3 seconds
            const poolCount = this.boss.phase === 6 ? 3 : 2;
            for (let i = 0; i < poolCount; i++) {
              const poolX = Math.random() * (this.width - 100) + 50;
              const poolY = Math.random() * (this.height - 200) + 100;
              this.firePools.push(new FirePool(poolX, poolY, 50, 360, 30));
            }
            this.boss.firePoolTimer = 0;
          }
        }

        // Phase 3+: Petrify beams
        if (this.boss.phase >= 3 && this.boss.phase <= 6) {
          this.boss.petrifyTimer = (this.boss.petrifyTimer || 0) + 1;
          const petrifyDelay = this.boss.phase === 6 ? 180 : 210;  // Faster in phase 6
          if (this.boss.petrifyTimer >= petrifyDelay) {
            const dx = this.player.x - this.boss.x;
            const dy = this.player.y - this.boss.y;
            const angle = Math.atan2(dy, dx);

            const petrifySpeed = this.boss.phase === 6 ? 12 : 10;
            const gazeBullet = new Projectile(this.boss.x, this.boss.y, angle, petrifySpeed, 24, '#ffffff', 0, false, true);
            gazeBullet.petrify = true;
            gazeBullet.petrifyDuration = 150;  // 2.5 seconds
            this.enemyBullets.push(gazeBullet);

            this.boss.petrifyTimer = 0;
          }
        }
      }

      // Boss shooting (unless disarmed or tutorial step 1)
      if (!this.abilityManager.isDisarmActive() && !(this.tutorialActive && this.tutorialStep === 1)) {
        // Tutorial: Only shoot 1 bullet in step 2
        if (this.tutorialActive && this.tutorialStep === 2 && this.enemyBullets.length === 0) {
          const dx = this.player.x - this.boss.x;
          const dy = this.player.y - this.boss.y;
          const angle = Math.atan2(dy, dx);
          this.enemyBullets.push(new Projectile(this.boss.x, this.boss.y, angle, 8, 12, '#ff6b6b', 10, false, true));
        } else if (!this.tutorialActive || this.tutorialStep >= 3) {
          // Normal shooting
          const newBullets = this.boss.shoot(this.player);
          if (newBullets && newBullets.length > 0) {
            this.enemyBullets.push(...newBullets);
          }
        }

        // Medusa burst fire ONCE when player first gets petrified
        if (this.boss.gazeDelay > 0 && this.player.justPetrified) {
          // Fire burst at newly frozen player (total ~250 damage)
          const dx = this.player.x - this.boss.x;
          const dy = this.player.y - this.boss.y;
          const angle = Math.atan2(dy, dx);

          // Fire 14 bullets at 18 damage each = 252 total damage
          for (let i = -6; i <= 6; i += 0.5) {
            const burstBullet = new Projectile(this.boss.x, this.boss.y, angle + i * 0.08, 9, 15, '#00ffff', 18, false, true);
            this.enemyBullets.push(burstBullet);
          }

          this.player.justPetrified = false;  // Only fire once
        }
      }
    }

    // Update fire pools
    for (let i = this.firePools.length - 1; i >= 0; i--) {
      const pool = this.firePools[i];
      pool.update();

      // Check if player is standing in fire
      if (pool.checkPlayerInside(this.player)) {
        const poolDamage = pool.getDamageThisFrame();
        if (poolDamage > 0) {
          this.player.takeDamage(poolDamage);
        }
      }

      // Remove expired pools
      if (pool.isExpired()) {
        this.firePools.splice(i, 1);
      }
    }

    // Update ghosts
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const ghost = this.ghosts[i];
      const ghostDamage = ghost.update(this.player);

      // Apply ghost damage if in range
      if (ghostDamage > 0) {
        this.player.takeDamage(ghostDamage / 60);  // 30 HP/sec = 0.5 HP/frame
      }

      // Ghost shooting
      const ghostBullet = ghost.shoot(this.player);
      if (ghostBullet) {
        this.enemyBullets.push(ghostBullet);
      }

      // Remove dead ghosts
      if (ghost.isDead()) {
        this.ghosts.splice(i, 1);
      }
    }

    // Update player bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      bullet.update(this.boss);  // Pass boss for homing bullets

      // Check collision with Cerberus heads first
      let hitHead = false;
      for (const head of this.cerberusHeads) {
        if (bullet.checkCollision(head)) {
          head.takeDamage(bullet.damage);
          this.applyVampireHeal(bullet.damage);
          hitHead = true;
          break;
        }
      }

      if (hitHead) {
        this.playerBullets.splice(i, 1);
        this.sessionStats.shotsHit++;
        continue;
      }

      // Check collision with ghosts
      let hitGhost = false;
      for (const ghost of this.ghosts) {
        if (bullet.checkCollision(ghost)) {
          ghost.takeDamage(bullet.damage);
          this.applyVampireHeal(bullet.damage);
          hitGhost = true;
          break;
        }
      }

      if (hitGhost) {
        this.playerBullets.splice(i, 1);
        this.sessionStats.shotsHit++;
        continue;
      }

      // Check collision with boss(es)
      let hitBoss = false;

      if (this.isGrindMode) {
        // Check collision with all grind bosses
        for (const boss of this.grindBosses) {
          if (bullet.checkCollision(boss)) {
            const finalDamage = bullet.damage * this.abilityManager.getVulnerabilityMultiplier();
            boss.takeDamage(finalDamage, 'bullet');
            this.applyVampireHeal(finalDamage);
            hitBoss = true;
            break;
          }
        }
      } else {
        // Normal mode - single boss
        // Check if boss is invulnerable (Cerberus with heads alive)
        const allHeadsDead = this.cerberusHeads.length === 0 || this.cerberusHeads.every(h => h.isDead());
        const canDamageBoss = !this.boss.invulnerableUntilHeadsDead || allHeadsDead;

        if (bullet.checkCollision(this.boss) && canDamageBoss) {
          const finalDamage = bullet.damage * this.abilityManager.getVulnerabilityMultiplier();
          this.boss.takeDamage(finalDamage, 'bullet');
          this.applyVampireHeal(finalDamage);
          hitBoss = true;

          // Track for tutorial
          if (this.tutorialActive && this.tutorialStep === 3) {
            this.tutorialHasHitBoss = true;
          }
        }
      }

      if (hitBoss) {
        this.playerBullets.splice(i, 1);
        this.sessionStats.shotsHit++;
        continue;
      }

      // Remove off-screen bullets
      if (bullet.isOffScreen(this.width, this.height)) {
        this.playerBullets.splice(i, 1);
      }
    }

    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.update(this.player);  // Pass player for homing bullets!

      // Check collision with player
      if (bullet.checkCollision(this.player)) {
        // Apply shield damage reduction if active
        const damageMultiplier = this.abilityManager.getShieldDamageMultiplier();
        const finalDamage = bullet.damage * damageMultiplier;
        this.player.takeDamage(finalDamage);

        // Apply poison effect if bullet has poison
        if (bullet.poison) {
          this.player.applyPoison(bullet.poisonDuration, bullet.poisonDamage);
        }

        // Apply burn effect if bullet has burn
        if (bullet.burn) {
          this.player.applyBurn(bullet.burnDuration, bullet.burnDamage);
        }

        // Apply petrify effect if bullet has petrify
        if (bullet.petrify) {
          this.player.applyPetrify(bullet.petrifyDuration);
        }

        // Apply slow effect if bullet has slow
        if (bullet.slow) {
          this.player.applySlow(bullet.slowDuration);
        }

        // Auto-activate Shield if player would die and shield is equipped + ready
        if (this.player.health <= 0 &&
          this.gameData.equippedAbilities?.healing === 'shield' &&
          this.abilityManager.cooldowns.healing === 0) {
          // Second chance! Auto-activate shield
          this.player.health = 1; // Set to 1 HP
          const result = this.abilityManager.activateAbility('healing', this.gameData.equippedAbilities, this.player);
          console.log('Shield auto-activated! Second chance!');
        }

        // Revenge passive - deal damage back to boss (scales with damage upgrades)
        if (this.gameData.equippedAbilities?.passive === 'revenge') {
          const damageLevel = this.gameData.upgrades?.bulletDamage || 0;
          const revengeMultipliers = [3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 16];  // Extends to level 11
          const multiplier = revengeMultipliers[damageLevel];
          const revengeDamage = finalDamage * multiplier;

          // Check if boss can be damaged (Cerberus body invulnerable with heads alive)
          const allHeadsDead = this.cerberusHeads.length === 0 || this.cerberusHeads.every(h => h.isDead());
          const canDamageBoss = !this.boss.invulnerableUntilHeadsDead || allHeadsDead;

          if (canDamageBoss) {
            this.boss.takeDamage(revengeDamage);
          }

          // Vampire does NOT heal from Revenge damage at all (prevents OP combo)
          // No vampire healing here!
        }

        this.enemyBullets.splice(i, 1);
        continue;
      }

      // Remove off-screen bullets
      if (bullet.isOffScreen(this.width, this.height)) {
        this.enemyBullets.splice(i, 1);
      }
    }

    // Check victory / wave complete (all heads must be dead for Cerberus)
    const allHeadsDead = this.cerberusHeads.length === 0 || this.cerberusHeads.every(h => h.isDead());
    const bossActuallyDead = this.boss && this.boss.isDead() && allHeadsDead;

    if (bossActuallyDead) {
      if (this.isGrindMode) {
        // Remove defeated boss from grind bosses
        const index = this.grindBosses.indexOf(this.boss);
        if (index > -1) {
          this.grindBosses.splice(index, 1);
        }

        // Check if all bosses in wave defeated
        if (this.grindBosses.length === 0) {
          // Wave complete! Award coins immediately
          const waveReward = this.grindWave * 10;
          this.grindCoinsEarned += waveReward;

          // Award coins to player immediately
          this.awardGrindCoins(waveReward);

          this.state = 'GRIND_BREAK';
          this.grindBreakTimer = 180; // 3 seconds
        } else {
          // Switch to next boss in wave
          this.boss = this.grindBosses[0];
        }
      } else {
        this.onVictory();
      }
    }

    // Check defeat / grind mode end
    if (this.player.health <= 0) {
      if (this.isGrindMode) {
        this.onGrindModeEnd();
      } else {
        this.onDefeat();
      }
    }

    // Pause
    if (this.controls.keys['Escape'] && this.menuCooldown === 0) {
      this.state = 'PAUSED';
      this.menuCooldown = 15;
    }
  }

  updatePaused() {
    if (this.controls.keys['Escape'] && this.menuCooldown === 0) {
      this.state = 'PLAYING';
      this.menuCooldown = 15;
    }

    if (this.controls.mouse.down && this.clickCooldown === 0) {
      this.state = 'MENU';
      this.clickCooldown = 15;
    }
  }

  async onVictory() {
    this.state = 'VICTORY';

    // Clear all fire pools on victory
    this.firePools = [];

    // Track if completed without damage
    const noDamageTaken = (this.player.health >= this.startingHealth);

    // Calculate accuracy
    const accuracy = this.sessionStats.shotsFired > 0 ?
      (this.sessionStats.shotsHit / this.sessionStats.shotsFired) * 100 : 0;

    // Check if player stayed above 50% health
    const stayedAbove50Percent = !this.wentBelow50Percent;

    // Update storage and get coins earned
    const levelData = this.gameData.levels[this.currentLevel];
    this.coinsEarned = await this.storage.completeLevel(this.currentLevel, this.levelTime, accuracy, stayedAbove50Percent);

    // Update stats
    const statsUpdate = {
      totalKills: 1,
      shotsFired: this.sessionStats.shotsFired,
      shotsHit: this.sessionStats.shotsHit,
      totalPlayTime: Math.floor(this.levelTime),
      consecutiveWins: (this.gameData.stats.consecutiveWins || 0) + 1
    };

    if (noDamageTaken) {
      statsUpdate.levelsWithoutDamage = (this.gameData.stats.levelsWithoutDamage || 0) + 1;
      // Mark level as cleared without damage
      const data = await this.storage.loadData();
      if (data.levels[this.currentLevel]) {
        data.levels[this.currentLevel].noDamageCleared = true;
      }
      await this.storage.saveData(data);
    }

    await this.storage.updateStats(statsUpdate);

    // Reload game data (quests are manually claimed now, not auto)
    this.gameData = await this.storage.loadData();

    // Show HTML victory overlay
    if (this.htmlMenus) {
      const bestTime = this.gameData.levels[this.currentLevel]?.bestTime;
      this.htmlMenus.showVictoryOverlay(this.currentLevel, this.levelTime, bestTime, this.coinsEarned);
    }
  }

  async onDefeat() {
    this.state = 'DEFEAT';

    // Clear all fire pools on defeat
    this.firePools = [];

    // Update stats (reset consecutive wins)
    await this.storage.updateStats({
      totalDeaths: 1,
      shotsFired: this.sessionStats.shotsFired,
      shotsHit: this.sessionStats.shotsHit,
      totalPlayTime: Math.floor(this.levelTime)
    });

    // Reset consecutive wins on defeat
    const data = await this.storage.loadData();
    data.stats.consecutiveWins = 0;
    await this.storage.saveData(data);

    // Reload game data
    this.gameData = await this.storage.loadData();

    // Show HTML defeat overlay
    if (this.htmlMenus) {
      this.htmlMenus.showDefeatOverlay();
    }
  }

  async awardGrindCoins(amount) {
    // Award coins immediately when wave completes
    const data = await this.storage.loadData();
    if (!data.grindMode) {
      data.grindMode = { bestWave: 0, totalCoinsEarned: 0 };
    }

    data.coins += amount;
    data.grindMode.totalCoinsEarned += amount;

    await this.storage.saveData(data);
    this.gameData = await this.storage.loadData();

    console.log(`Wave ${this.grindWave} complete! +${amount} coins. Total: ${this.gameData.coins}`);
  }

  applyVampireHeal(damage) {
    // Apply vampire lifesteal if active (50%), capped at 20% max HP per second
    if (this.abilityManager.isVampireActive()) {
      const potentialHeal = damage * 0.5;
      const maxHealPerSec = this.player.maxHealth * 0.2; // 20% of max HP
      const remainingCap = Math.max(0, maxHealPerSec - this.abilityManager.vampireHealThisSecond);
      const actualHeal = Math.min(potentialHeal, remainingCap);

      if (actualHeal > 0) {
        this.player.heal(actualHeal);
        this.abilityManager.vampireHealThisSecond += actualHeal;
      }
    }
  }

  async onGrindModeEnd() {
    this.state = 'DEFEAT';
    const wavesSurvived = this.grindWave - 1; // Last wave wasn't completed

    // Clear all fire pools on grind mode end
    this.firePools = [];

    // Update best wave (coins already awarded during gameplay)
    const data = await this.storage.loadData();
    if (!data.grindMode) {
      data.grindMode = { bestWave: 0, totalCoinsEarned: 0 };
    }

    const bestWave = data.grindMode.bestWave;
    if (wavesSurvived > bestWave) {
      data.grindMode.bestWave = wavesSurvived;
    }

    await this.storage.saveData(data);
    this.gameData = await this.storage.loadData();

    // Show grind overlay
    if (this.htmlMenus) {
      this.htmlMenus.showGrindOverlay(wavesSurvived, this.grindCoinsEarned, bestWave);
    }
  }

  updateVictory() {
    // ESC to return to menu
    if (this.controls.keys['Escape'] && this.menuCooldown === 0) {
      this.state = 'MENU';
      this.menuCooldown = 15;
      return;
    }

    // Handle button clicks
    if (this.controls.mouse.down && this.clickCooldown === 0) {
      const mousePos = this.controls.getAimPosition();
      const button = this.ui.getClickedVictoryButton(mousePos.x, mousePos.y, this.currentLevel);

      if (button === 'nextLevel') {
        // Go to next level
        if (this.currentLevel < 30) {
          this.currentLevel++;
          if (this.gameData.levels[this.currentLevel].unlocked) {
            this.startLevel(this.currentLevel);
          } else {
            this.state = 'MENU';
          }
        }
      } else if (button === 'menu') {
        this.state = 'MENU';
      } else if (button === 'shop') {
        this.state = 'SHOP';
      } else if (button === 'retry') {
        this.startLevel(this.currentLevel);
      }

      this.clickCooldown = 15;
    }
  }

  updateDefeat() {
    // ESC to return to menu
    if (this.controls.keys['Escape'] && this.menuCooldown === 0) {
      this.state = 'MENU';
      this.menuCooldown = 15;
      return;
    }

    // Handle button clicks
    if (this.controls.mouse.down && this.clickCooldown === 0) {
      const mousePos = this.controls.getAimPosition();
      const button = this.ui.getClickedDefeatButton(mousePos.x, mousePos.y);

      if (button === 'retry') {
        this.startLevel(this.currentLevel);
      } else if (button === 'shop') {
        this.state = 'SHOP';
      } else if (button === 'menu') {
        this.state = 'MENU';
      }

      this.clickCooldown = 15;
    }
  }

  render() {
    // Only render canvas during gameplay states
    if (this.state === 'PLAYING' || this.state === 'PAUSED' ||
      this.state === 'VICTORY' || this.state === 'DEFEAT' ||
      this.state === 'GRIND_MODE' || this.state === 'GRIND_BREAK') {
      // Clear canvas
      this.ctx.fillStyle = '#222838';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.renderGame();
    }
    // HTML screens handle menu states automatically
  }

  renderGame() {
    // Draw game area separator
    this.ctx.strokeStyle = '#3a4558';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height / 2);
    this.ctx.lineTo(this.width, this.height / 2);
    this.ctx.stroke();

    // Draw laser beam visual (before entities)
    if (this.player && this.abilityManager && this.abilityManager.isLaserActive()) {
      this.ui.drawLaserBeam(this.player, this.boss, this.cerberusHeads);
    }

    // Draw boss(es)
    if (this.isGrindMode) {
      this.grindBosses.forEach(boss => boss.draw(this.ctx));
    } else if (this.boss) {
      this.boss.draw(this.ctx);
    }

    // Draw player
    if (this.player) {
      this.player.draw(this.ctx);
    }

    // Draw fire pools (under everything)
    this.firePools.forEach(pool => pool.draw(this.ctx));

    // Draw bullets
    this.playerBullets.forEach(bullet => bullet.draw(this.ctx));
    this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw ghosts
    this.ghosts.forEach(ghost => ghost.draw(this.ctx));

    // Draw Cerberus heads
    this.cerberusHeads.forEach(head => head.draw(this.ctx));

    // Draw HUD
    if (this.player) {
      const coins = this.gameData?.coins || 0;
      const equippedAbilities = this.gameData?.equippedAbilities || { healing: null, special: null, passive: null };

      if (this.isGrindMode) {
        // Grind mode HUD
        this.ui.drawGrindModeHUD(this.player, this.grindWave, this.grindBosses.length, this.grindCoinsEarned, coins, this.abilityManager, equippedAbilities);
      } else if (this.boss) {
        // Normal mode HUD
        this.ui.drawGameHUD(this.player, this.boss, this.currentLevel, this.levelTime, coins, this.abilityManager, equippedAbilities);
      }
    }

    // Draw overlays
    if (this.state === 'PAUSED') {
      this.ui.drawPauseScreen();
    } else if (this.state === 'GRIND_BREAK') {
      this.ui.drawGrindBreakScreen(this.grindWave, this.grindBreakTimer);
    }

    // Draw tutorial overlay
    if (this.tutorialActive && this.tutorialStep > 0) {
      this.ui.drawTutorialText(this.tutorialStep);
    }

    // Victory and Defeat overlays are now HTML elements!
  }
}

