// All 30 boss definitions with unique behaviors
class BossFactory {
  static createBoss(level, playerUpgrades = { maxHealth: 0, bulletDamage: 0 }) {
    const configs = {
      1: {
        name: 'The Awakening',
        size: 35,
        health: 250,  // Fixed HP (as if max upgrades)
        shootDelay: 80,
        updateBehavior: function (player, w, h) {
          // Stationary boss, simple shooting
          this.vx = 0;
          this.vy = 0;
        }
      },

      2: {
        name: 'Sidewinder',
        size: 35,
        health: 313,  // 250 * 1.25 (max scaling)
        shootDelay: 70,
        updateBehavior: function (player, w, h) {
          // Side to side movement
          this.vx = Math.sin(this.behaviorTimer * 0.03) * 3;
          this.vy = 0;
        }
      },

      3: {
        name: 'Triple Threat',
        size: 38,
        health: 375,  // 300 * 1.25
        shootDelay: 90,
        shootPattern: function (player) {
          // Shoots 3 bullets in a spread
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const baseAngle = Math.atan2(dy, dx);
          const spread = 0.3;

          return [
            new Projectile(this.x, this.y, baseAngle - spread, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, baseAngle, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, baseAngle + spread, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false)
          ];
        }
      },

      4: {
        name: 'Orbiter',
        size: 40,
        health: 438,  // 350 * 1.25
        shootDelay: 60,
        updateBehavior: function (player, w, h) {
          // Circular movement
          const centerX = w / 2;
          const centerY = 120;
          const radius = 100;
          const speed = 0.02;

          this.x = centerX + Math.cos(this.behaviorTimer * speed) * radius;
          this.y = centerY + Math.sin(this.behaviorTimer * speed) * radius;
          this.vx = 0;
          this.vy = 0;
        }
      },

      5: {
        name: 'Rapid Fire',
        size: 35,
        health: 500,  // 400 * 1.25
        shootDelay: 30,
        bulletSpeed: 4,
        updateBehavior: function (player, w, h) {
          // Quick side movements
          if (this.behaviorTimer % 60 < 30) {
            this.vx = -3;
          } else {
            this.vx = 3;
          }
          this.vy = 0;
        }
      },

      6: {
        name: 'Wave Master',
        size: 42,
        health: 563,  // 450 * 1.25
        shootDelay: 70,
        updateBehavior: function (player, w, h) {
          // FIXED: Proper wave pattern that bounces off walls

          // Initialize direction if not set
          if (this.waveDirection === undefined) {
            this.waveDirection = 1; // 1 = right, -1 = left
          }

          // Horizontal movement with direction
          this.vx = this.waveDirection * 2.5;

          // Vertical wave pattern (consistent wave motion)
          this.vy = Math.sin(this.behaviorTimer * 0.05) * 2.5;

          // Bounce off walls (change direction when near edges)
          if (this.x <= this.size + 30) {
            // Hit left wall - go right
            this.waveDirection = 1;
          } else if (this.x >= w - this.size - 30) {
            // Hit right wall - go left
            this.waveDirection = -1;
          }

          // Keep away from vertical edges too
          if (this.y <= this.size + 20) {
            this.vy = Math.abs(this.vy); // Force downward
          } else if (this.y >= h / 2 - this.size - 20) {
            this.vy = -Math.abs(this.vy); // Force upward
          }
        }
      },

      7: {
        name: 'Pentashot',
        size: 40,
        health: 625,  // 500 * 1.25
        shootDelay: 100,
        shootPattern: function (player) {
          // 5-way spread shot
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const baseAngle = Math.atan2(dy, dx);
          const bullets = [];

          for (let i = -2; i <= 2; i++) {
            bullets.push(new Projectile(
              this.x, this.y,
              baseAngle + i * 0.25,
              this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false
            ));
          }
          return bullets;
        }
      },

      8: {
        name: 'Zigzag',
        size: 38,
        health: 688,  // 550 * 1.25
        shootDelay: 65,
        updateBehavior: function (player, w, h) {
          // Zigzag pattern
          if (this.behaviorTimer % 40 < 20) {
            this.vx = 3;
            this.vy = -2;
          } else {
            this.vx = -3;
            this.vy = 2;
          }
        }
      },

      9: {
        name: 'Spinner',
        size: 45,
        health: 750,  // 600 * 1.25
        shootDelay: 15,
        bulletSpeed: 6,  // NERFED: Slower bullets (default 10 → 6)
        shootPattern: function (player) {
          // AIMBOT + HIGH DAMAGE but SLOWER bullets
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const playerAngle = Math.atan2(dy, dx);
          const spiralAngle = this.behaviorTimer * 0.1;
          const bullets = [];

          // 2 spiral bullets (slower)
          bullets.push(new Projectile(this.x, this.y, spiralAngle, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false));
          bullets.push(new Projectile(this.x, this.y, spiralAngle + Math.PI, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false));

          // AIMBOT: Always aims at player with HIGH DAMAGE (20) but slower
          bullets.push(new Projectile(this.x, this.y, playerAngle, this.bulletSpeed + 1, this.bulletSize, '#ff4444', 20, false));  // Speed +2 → +1

          return bullets;
        }
      },

      10: {
        name: 'Summoner',
        size: 50,
        health: 750,  // 600 * 1.25
        shootDelay: 120,
        shootPattern: function (player) {
          // AIMBOT + HIGH DAMAGE ring + aimed shot
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const playerAngle = Math.atan2(dy, dx);

          // Ring of 12 bullets with HIGH DAMAGE (15)
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            bullets.push(new Projectile(
              this.x, this.y, angle, 10, 14, '#ff8787', 15, false  // Increased damage 8 → 15
            ));
          }

          // AIMBOT: Perfect aimed shot at player
          bullets.push(new Projectile(this.x, this.y, playerAngle, 12, 14, '#ff4444', 20, false));

          return bullets;
        }
      },

      11: {
        name: 'Sniper',
        size: 35,
        health: 875,  // 700 * 1.25
        shootDelay: 120,
        bulletSpeed: 10,
        bulletSize: 12,
        shootPattern: function (player) {
          // More damage sniper shots
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);
          return [new Projectile(this.x, this.y, angle, this.bulletSpeed, this.bulletSize, '#ff4444', 20, false)];
        },
        updateBehavior: function (player, w, h) {
          // Smart dodging - moves in circles/zigzags instead of straight lines
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // If too close, dodge in a circular pattern
          if (dist < 200) {
            this.vx = -Math.sign(dx) * 4 + Math.sin(this.behaviorTimer * 0.1) * 2;
            this.vy = Math.cos(this.behaviorTimer * 0.1) * 2;
          } else {
            // Far away - strafe sideways
            this.vx = Math.sin(this.behaviorTimer * 0.05) * 3;
            this.vy = Math.cos(this.behaviorTimer * 0.08) * 1.5;
          }
        }
      },

      12: {
        name: 'Fortress',
        size: 55,
        health: 938,  // 750 * 1.25
        shootDelay: 50,
        speed: 1,
        shootPattern: function (player) {
          // Aims at player + shoots in 4 cardinal + 4 diagonal directions (8 total)
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const playerAngle = Math.atan2(dy, dx);

          return [
            // Aimed shot at player
            new Projectile(this.x, this.y, playerAngle, this.bulletSpeed + 2, this.bulletSize, '#ff4444', 10, false),
            // 4 cardinal directions
            new Projectile(this.x, this.y, 0, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, Math.PI / 2, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, Math.PI, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, -Math.PI / 2, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            // 4 diagonal directions
            new Projectile(this.x, this.y, Math.PI / 4, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, 3 * Math.PI / 4, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, 5 * Math.PI / 4, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false),
            new Projectile(this.x, this.y, 7 * Math.PI / 4, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false)
          ];
        }
      },

      13: {
        name: 'Stalker',
        size: 40,
        health: 1000,  // 800 * 1.25
        shootDelay: 80,
        updateBehavior: function (player, w, h) {
          // Follows player horizontally
          const dx = player.x - this.x;
          this.vx = Math.sign(dx) * Math.min(Math.abs(dx) * 0.05, 3);
          this.vy = Math.sin(this.behaviorTimer * 0.04) * 1.5;
        }
      },

      14: {
        name: 'Burst King',
        size: 42,
        health: 1063,  // 850 * 1.25
        shootDelay: 150,
        bulletSpeed: 12,  // BUFFED: Faster bullets (10 → 12)
        shootPattern: function (player) {
          // Fires FASTER burst of shots at player
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);
          const bullets = [];

          for (let i = 0; i < 5; i++) {
            bullets.push(new Projectile(
              this.x, this.y, angle,
              this.bulletSpeed + i * 0.8,  // Faster increment (0.5 → 0.8)
              this.bulletSize, '#ff6b6b', 10, false
            ));
          }
          return bullets;
        }
      },

      15: {
        name: 'Teleporter',
        size: 38,
        health: 1125,  // 900 * 1.25
        shootDelay: 70,
        updateBehavior: function (player, w, h) {
          // Teleports periodically
          if (this.behaviorTimer % 150 === 0) {
            this.x = Math.random() * (w - 100) + 50;
            this.y = Math.random() * 100 + 50;
          }
          this.vx = 0;
          this.vy = 0;
        }
      },

      16: {
        name: 'Helix',
        size: 40,
        health: 1663,  // 950 * 1.75 (medium scaling tier)
        shootDelay: 40,
        shootPattern: function (player) {
          // AIMBOT + HIGH DAMAGE spiral
          const angle1 = this.behaviorTimer * 0.15;
          const angle2 = angle1 + Math.PI;
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const playerAngle = Math.atan2(dy, dx);

          // Spiral bullets
          bullets.push(new Projectile(this.x, this.y, angle1, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false));
          bullets.push(new Projectile(this.x, this.y, angle2, this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false));

          // AIMBOT: ALWAYS aims at player with HIGH DAMAGE (20)
          bullets.push(new Projectile(this.x, this.y, playerAngle, this.bulletSpeed + 2, this.bulletSize, '#ff4444', 20, false));

          return bullets;
        }
      },

      17: {
        name: 'Berserker',
        size: 45,
        health: 1750,  // 1000 * 1.75
        shootDelay: 35,
        speed: 2.5,
        bulletSpeed: 13,  // BUFFED: Faster bullets (10 → 13)
        shootPattern: function (player) {
          // BUFFED: Higher damage bullets
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          return [new Projectile(
            this.x, this.y, angle,
            this.bulletSpeed, this.bulletSize,
            '#ff4444', 18, false  // HIGH DAMAGE (18)
          )];
        },
        updateBehavior: function (player, w, h) {
          // Aggressive movement toward player
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 100) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed * 0.3;
          } else {
            this.vx = Math.sin(this.behaviorTimer * 0.1) * 4;
            this.vy = 0;
          }
        }
      },

      18: {
        name: 'Meteor Shower',
        size: 48,
        health: 1838,  // 1050 * 1.75
        shootDelay: 60,
        shootPattern: function (player) {
          // MASSIVE METEOR SHOWER + AIMBOT
          const bullets = [];
          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            bullets.push(new Projectile(
              this.x, this.y, angle,
              2 + Math.random() * 3,
              this.bulletSize, '#ff6b6b', 20, false, true
            ));
          }

          // AIMBOT meteor (red, fast, big damage)
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);
          bullets.push(new Projectile(this.x, this.y, aimAngle, 10, 19, '#ff0000', 22, false, true));

          return bullets;
        }
      },

      19: {
        name: 'Phase Shifter',
        size: 40,
        health: 1925,  // 1100 * 1.75
        shootDelay: 90,
        updateBehavior: function (player, w, h) {
          // Changes movement pattern every 5 seconds
          const pattern = Math.floor(this.behaviorTimer / 300) % 3;

          if (pattern === 0) {
            this.vx = Math.sin(this.behaviorTimer * 0.03) * 3;
            this.vy = 0;
          } else if (pattern === 1) {
            const centerX = w / 2;
            this.x = centerX + Math.cos(this.behaviorTimer * 0.02) * 120;
            this.vx = 0;
            this.vy = 0;
          } else {
            this.vx = 0;
            this.vy = Math.sin(this.behaviorTimer * 0.04) * 2;
          }
        }
      },

      20: {
        name: 'Twin Terror',
        size: 50,
        health: 2100,  // 1200 * 1.75
        shootDelay: 70,
        maxPhases: 2,
        shootPattern: function (player) {
          // Phase 1: Spread shot, Phase 2: MORE pink/slow/10 damage bullets
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const baseAngle = Math.atan2(dy, dx);
          const bullets = [];

          if (this.phase === 1) {
            for (let i = -1; i <= 1; i++) {
              bullets.push(new Projectile(
                this.x, this.y, baseAngle + i * 0.4,
                this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false
              ));
            }
          } else {
            // Phase 2 - MORE slow pink bullets with 10 damage
            bullets.push(new Projectile(this.x, this.y, baseAngle, this.bulletSpeed + 2, this.bulletSize + 1, '#ff4444', 15, false));

            // 6 slow pink bullets in spiral (increased from 2)
            const spiral = this.behaviorTimer * 0.2;
            for (let i = 0; i < 6; i++) {
              const angle = spiral + (i / 6) * Math.PI * 2;
              bullets.push(new Projectile(this.x, this.y, angle, 3, this.bulletSize, '#ffb3d9', 10, false)); // Pink, slow, 10 damage
            }
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          if (this.phase === 1) {
            this.vx = Math.sin(this.behaviorTimer * 0.02) * 2;
            this.vy = 0;
          } else {
            // More erratic in phase 2
            this.vx = Math.sin(this.behaviorTimer * 0.05) * 3.5;
            this.vy = Math.cos(this.behaviorTimer * 0.03) * 1.5;
          }
        }
      },

      21: {
        name: 'Gatling',
        size: 42,
        health: 2275,  // 1300 * 1.75
        shootDelay: 10,  // Faster fire rate (20 → 10 frames)
        bulletSpeed: 5,
        shootPattern: function (player) {
          // Machine gun fire with increased damage
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
          return [new Projectile(this.x, this.y, angle, this.bulletSpeed, 14, '#ff6b6b', 12, false)];  // Increased damage 8 → 12
        }
      },

      22: {
        name: 'Geometric',
        size: 45,
        health: 2450,  // 1400 * 1.75
        shootDelay: 100,
        shootPattern: function (player) {
          // AIMBOT + HIGH DAMAGE geometric pattern with MORE BULLETS
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const playerAngle = Math.atan2(dy, dx);
          const sides = 16;  // BUFFED: More bullets (10 → 16)

          // Geometric pattern with HIGH DAMAGE (15) - pink/red bullets
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + this.behaviorTimer * 0.05;
            bullets.push(new Projectile(
              this.x, this.y, angle,
              this.bulletSpeed, this.bulletSize, '#ff6b6b', 15, false  // Pink-red bullets
            ));
          }

          // AIMBOT: Perfect aimed shot at player with HIGH DAMAGE (20)
          bullets.push(new Projectile(this.x, this.y, playerAngle, this.bulletSpeed + 2, this.bulletSize, '#ff4444', 20, false));

          return bullets;
        }
      },

      23: {
        name: 'Interceptor',
        size: 38,
        health: 2625,  // 1500 * 1.75
        shootDelay: 60,
        updateBehavior: function (player, w, h) {
          // Tries to intercept player movement
          const dx = player.x - this.x;
          const dy = player.y - this.y;

          // Predict player position
          this.vx = Math.sign(dx) * 3.5;
          this.vy = Math.sign(dy) * 1;
        },
        shootPattern: function (player) {
          // Lead shots
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const time = dist / this.bulletSpeed;

          const leadX = player.x + player.vx * time;
          const leadY = player.y + player.vy * time;
          const angle = Math.atan2(leadY - this.y, leadX - this.x);

          return [new Projectile(this.x, this.y, angle, this.bulletSpeed, this.bulletSize, '#ff6b6b', 12, false)];
        }
      },

      24: {
        name: 'Pulse Wave',
        size: 50,
        health: 2800,  // 1600 * 1.75
        shootDelay: 80,
        shootPattern: function (player) {
          // 2 waves: one aimed at player, one random + more bullets per wave (16)
          const bullets = [];
          const count = 16;  // Increased from 12

          // Wave 1: Aimed at player
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const playerAngle = Math.atan2(dy, dx);
          for (let i = 0; i < count; i++) {
            const angle = playerAngle + (i / count) * Math.PI * 2;
            bullets.push(new Projectile(
              this.x, this.y, angle,
              2.5, this.bulletSize, '#ff6b6b', 10, false
            ));
          }

          // Wave 2: Random rotation
          const randomOffset = Math.random() * Math.PI * 2;
          for (let i = 0; i < count; i++) {
            const angle = randomOffset + (i / count) * Math.PI * 2;
            bullets.push(new Projectile(
              this.x, this.y, angle,
              2, this.bulletSize, '#ff8787', 10, false
            ));
          }

          return bullets;
        }
      },

      25: {
        name: 'Bullet Hell',
        size: 48,
        health: 2975,  // 1700 * 1.75
        shootDelay: 45,
        shootPattern: function (player) {
          // NERFED: Wider gaps between bullets for dodging
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const baseAngle = Math.atan2(dy, dx);

          for (let i = -3; i <= 3; i++) {
            bullets.push(new Projectile(
              this.x, this.y, baseAngle + i * 0.25,  // Increased gap from 0.15 to 0.25
              this.bulletSpeed, this.bulletSize, '#ff6b6b', 10, false
            ));
          }
          return bullets;
        }
      },

      26: {
        name: 'Dimensional',
        size: 45,
        health: 4050,  // 1800 * 2.25 (strong scaling tier)
        shootDelay: 80,  // Faster shooting (100 → 80)
        bulletSpeed: 12,  // Faster bullets
        updateBehavior: function (player, w, h) {
          // SCARY: Teleports to random position CLOSE to player!
          if (this.behaviorTimer % 45 === 0) {  // Fast teleport (0.75 seconds)
            // Generate random position in a circle around the player
            const distance = 100 + Math.random() * 80;  // 100-180 pixels from player (kinda close)
            const angle = Math.random() * Math.PI * 2;  // Random angle

            let targetX = player.x + Math.cos(angle) * distance;
            let targetY = player.y + Math.sin(angle) * distance;

            // Keep boss in valid area (boss zone only)
            targetX = Math.max(this.size + 30, Math.min(w - this.size - 30, targetX));
            targetY = Math.max(this.size + 30, Math.min(h / 2 - this.size - 30, targetY));

            this.x = targetX;
            this.y = targetY;
          }
          this.vx = 0;
          this.vy = 0;
        },
        shootPattern: function (player) {
          // BUFFED: MORE bullets (6 instead of 3) from multiple angles
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);
          const bullets = [];

          for (let i = 0; i < 6; i++) {  // Doubled bullets (3 → 6)
            const offsetAngle = (i / 6) * Math.PI * 2;
            bullets.push(new Projectile(
              this.x + Math.cos(offsetAngle) * 25,
              this.y + Math.sin(offsetAngle) * 25,
              angle, this.bulletSpeed, this.bulletSize, '#ff6b6b', 12, false  // More damage (10 → 12)
            ));
          }
          return bullets;
        }
      },

      27: {
        name: 'Chaos Engine',
        size: 52,
        health: 4275,  // 1900 * 2.25
        shootDelay: 30,
        shootPattern: function (player) {
          // +5 bullets: 7-11 bullets instead of 2-6
          const bullets = [];
          const count = Math.floor(Math.random() * 5) + 7;  // Was +2, now +7

          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            bullets.push(new Projectile(
              this.x, this.y, angle, speed,
              this.bulletSize, '#ff6b6b', 10, false
            ));
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Random erratic movement
          if (this.behaviorTimer % 30 === 0) {
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = (Math.random() - 0.5) * 3;
          }
        }
      },

      28: {
        name: 'Dreadnought',
        size: 60,
        health: 4500,  // 2000 * 2.25
        shootDelay: 40,
        speed: 1.5,
        shootPattern: function (player) {
          // Massive firepower
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          // Main cannon
          bullets.push(new Projectile(this.x, this.y, angle, 6, 12, '#ff4444', 20, false));

          // Side cannons
          for (let i = -2; i <= 2; i++) {
            if (i !== 0) {
              bullets.push(new Projectile(
                this.x, this.y, angle + i * 0.3,
                10, 14, '#ff6b6b', 12, false
              ));
            }
          }
          return bullets;
        }
      },

      29: {
        name: 'Omega Protocol',
        size: 55,
        health: 4950,  // 2200 * 2.25
        shootDelay: 50,
        maxPhases: 3,
        shootPattern: function (player) {
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          if (this.phase === 1) {
            // Spread pattern
            for (let i = -2; i <= 2; i++) {
              bullets.push(new Projectile(
                this.x, this.y, angle + i * 0.25,
                this.bulletSpeed, this.bulletSize, '#ff6b6b', 12, false
              ));
            }
          } else if (this.phase === 2) {
            // Spiral + direct
            bullets.push(new Projectile(this.x, this.y, angle, 5, 6, '#ff4444', 15, false));
            const spiral = this.behaviorTimer * 0.15;
            for (let i = 0; i < 4; i++) {
              bullets.push(new Projectile(
                this.x, this.y, spiral + i * Math.PI / 2,
                10, 14, '#ff8787', 10, false
              ));
            }
          } else {
            // All out assault
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2 + this.behaviorTimer * 0.05;
              bullets.push(new Projectile(this.x, this.y, a, 10, 14, '#ff6b6b', 10, false));
            }
            bullets.push(new Projectile(this.x, this.y, angle, 6, 7, '#ff4444', 18, false));
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          if (this.phase === 1) {
            this.vx = Math.sin(this.behaviorTimer * 0.02) * 2;
            this.vy = 0;
          } else if (this.phase === 2) {
            const centerX = w / 2;
            this.x = centerX + Math.cos(this.behaviorTimer * 0.025) * 100;
            this.vx = 0;
            this.vy = 0;
          } else {
            this.vx = Math.sin(this.behaviorTimer * 0.04) * 3;
            this.vy = Math.cos(this.behaviorTimer * 0.03) * 1.5;
          }
        }
      },

      30: {
        name: 'THE CRIMSON EMPEROR',
        size: 70,
        health: 5625,  // 2500 * 2.25 (final boss!)
        shootDelay: 50,  // NERFED: 35 → 50 (slower fire rate)
        maxPhases: 3,
        color: '#cc0000',
        shootPattern: function (player) {
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          if (this.phase === 1) {
            // NERFED: Fewer bullets (5 instead of 7)
            for (let i = -2; i <= 2; i++) {
              bullets.push(new Projectile(
                this.x, this.y, angle + i * 0.25,  // Wider spread
                8, 14, '#ff6b6b', 10, false  // Slower, less damage (12 → 10)
              ));
            }
          } else if (this.phase === 2) {
            // NERFED: Fewer bullets (3 instead of 5)
            for (let i = -1; i <= 1; i++) {
              bullets.push(new Projectile(
                this.x, this.y, angle + i * 0.35,  // Wider spread
                5, 6, '#ff4444', 12, false  // Less damage (15 → 12)
              ));
            }
            // NERFED: Fewer spiral bullets (4 instead of 6)
            const spiral = this.behaviorTimer * 0.1;
            for (let i = 0; i < 4; i++) {
              bullets.push(new Projectile(
                this.x, this.y, spiral + i * Math.PI / 2,
                8, 14, '#ff8787', 10, false  // Slower
              ));
            }
          } else {
            // NERFED FINAL PHASE
            // Fewer aimed shots (5 instead of 9)
            for (let i = -2; i <= 2; i++) {
              bullets.push(new Projectile(
                this.x, this.y, angle + i * 0.2,  // Wider gaps
                5, 6, '#ff4444', 12, false  // Less damage (15 → 12)
              ));
            }
            // NERFED: Smaller ring (8 instead of 12)
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2 + this.behaviorTimer * 0.08;
              bullets.push(new Projectile(this.x, this.y, a, 8, 14, '#ff6b6b', 10, false));  // Slower, less damage
            }
            // NERFED: Slower direct shot, less damage
            bullets.push(new Projectile(this.x, this.y, angle, 7, 12, '#cc0000', 18, false));  // 25 → 18 damage
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          if (this.phase === 1) {
            this.vx = Math.sin(this.behaviorTimer * 0.025) * 2.5;
            this.vy = Math.cos(this.behaviorTimer * 0.02) * 1;
          } else if (this.phase === 2) {
            // Circular movement
            const centerX = w / 2;
            const centerY = 120;
            const radius = 120;
            this.x = centerX + Math.cos(this.behaviorTimer * 0.03) * radius;
            this.y = centerY + Math.sin(this.behaviorTimer * 0.03) * radius * 0.5;
            this.vx = 0;
            this.vy = 0;
          } else {
            // Erratic aggressive movement
            const dx = player.x - this.x;
            this.vx = Math.sin(this.behaviorTimer * 0.05) * 4 + Math.sign(dx) * 1;
            this.vy = Math.cos(this.behaviorTimer * 0.04) * 2;
          }
        }
      },

      // LEVELS 31-50: NIGHTMARE BOSSES (Harder than Crimson Emperor!)
      31: {
        name: 'Hellfire',
        size: 65,
        health: 6000,
        shootDelay: 65,  // Even slower (was 55)
        maxPhases: 3,
        shootPattern: function (player) {
          // Different patterns per phase
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);

          if (this.phase === 1) {
            // Phase 1: Ring + aimed shot
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              bullets.push(new Projectile(this.x, this.y, angle, 7, 15, '#ff4500', 14, false, true));
            }
            bullets.push(new Projectile(this.x, this.y, aimAngle, 10, 16, '#ff0000', 16, false, true));
          } else if (this.phase === 2) {
            // Phase 2: Slow homing + aimed
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const bullet = new Projectile(this.x, this.y, angle, 7, 15, '#ff4500', 14, false, true);
              bullet.homing = true;
              bullet.homingStrength = 0.006;
              bullets.push(bullet);
            }
            bullets.push(new Projectile(this.x, this.y, aimAngle, 11, 16, '#ff0000', 17, false, true));
          } else {
            // Phase 3: Dense homing swarm + aimbot
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2;
              const bullet = new Projectile(this.x, this.y, angle, 8, 16, '#ff4500', 15, false, true);
              bullet.homing = true;
              bullet.homingStrength = 0.009;  // Faster homing in final phase
              bullets.push(bullet);
            }
            // Double aimbot in phase 3
            bullets.push(new Projectile(this.x, this.y, aimAngle, 12, 17, '#ff0000', 18, false, true));
            bullets.push(new Projectile(this.x, this.y, aimAngle + 0.3, 11, 16, '#ff3300', 17, false, true));
          }

          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Slow predictable movement
          this.vx = Math.sin(this.behaviorTimer * 0.03) * 3;
          this.vy = Math.cos(this.behaviorTimer * 0.02) * 1.5;
        }
      },

      32: {
        name: 'Absolute Zero',
        size: 62,
        health: 6500,
        shootDelay: 60,  // Slower for dodging (was 50)
        maxPhases: 3,
        shootPattern: function (player) {
          // Ice shards - dodgeable bullet hell
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          const count = this.phase === 1 ? 7 : this.phase === 2 ? 10 : 13;  // Reduced density
          for (let i = 0; i < count; i++) {
            const spread = (i - count / 2) * 0.25;  // Wider gaps for dodging (was 0.15)
            bullets.push(new Projectile(this.x, this.y, angle + spread, 8, 14, '#00ffff', 14, false));  // Slower (was 10)
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Slower, more predictable movement
          this.vx = Math.sin(this.behaviorTimer * 0.05) * 3.5;  // Was 4.5
          this.vy = Math.cos(this.behaviorTimer * 0.04) * 2;    // Was 2.5
        }
      },

      33: {
        name: 'Black Hole',
        size: 70,
        health: 7000,
        shootDelay: 45,
        maxPhases: 3,
        shootPattern: function (player) {
          // Spiral bullets + gravity effect + aimbot
          const bullets = [];
          const spirals = this.phase === 1 ? 2 : this.phase === 2 ? 3 : 4;

          for (let s = 0; s < spirals; s++) {
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2 + s * Math.PI / spirals + this.behaviorTimer * 0.08;
              bullets.push(new Projectile(this.x, this.y, angle, 6 + s, 16, '#9c27b0', 16, false, true));
            }
          }

          // AIMBOT bullet (red, high damage, fast)
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);
          bullets.push(new Projectile(this.x, this.y, aimAngle, 12, 18, '#ff0066', 20, false, true));

          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Stationary at center
          this.x = w / 2;
          this.y = 120;
          this.vx = 0;
          this.vy = 0;
        }
      },

      34: {
        name: 'Lightning Strike',
        size: 55,
        health: 7500,
        shootDelay: 60,
        maxPhases: 3,
        shootPattern: function (player) {
          // Lightning bolts - slower and wider spread
          const bullets = [];
          const count = this.phase * 4; // 4, 8, 12 bullets

          // Aimed at player current position
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          for (let i = 0; i < count; i++) {
            const spread = (i - count / 2) * 0.2;  // Wider spread (was 0.1)
            bullets.push(new Projectile(this.x, this.y, angle + spread, 11, 12, '#ffeb3b', 17, false));  // Slower (was 15)
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Quick dashes
          if (this.behaviorTimer % 30 === 0) {
            this.vx = (Math.random() - 0.5) * 10;
          }
          this.vx *= 0.9;
          this.vy = Math.sin(this.behaviorTimer * 0.06) * 2;
        }
      },

      35: {
        name: 'Plague Doctor',
        size: 60,
        health: 8000,
        shootDelay: 55,
        maxPhases: 3,
        shootPattern: function (player) {
          // Poison cloud bullets (GREEN with poison effect!)
          const bullets = [];
          const count = 12 + this.phase * 4; // 16, 20, 24

          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + this.behaviorTimer * 0.04;
            const bullet = new Projectile(this.x, this.y, angle, 7, 18, '#00ff00', 14, false, true);  // forceColor!
            bullet.poison = true;
            bullet.poisonDuration = 180;  // 3 seconds of poison
            bullet.poisonDamage = 2;  // 2 damage per tick (every 0.5s)
            bullets.push(bullet);
          }

          // Add aimed poison bolt (BRIGHT GREEN, stronger poison)
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);
          const aimBullet = new Projectile(this.x, this.y, aimAngle, 11, 20, '#33ff33', 18, false, true);  // forceColor!
          aimBullet.poison = true;
          aimBullet.poisonDuration = 300;  // 5 seconds
          aimBullet.poisonDamage = 3;  // 3 damage per tick
          bullets.push(aimBullet);

          return bullets;
        },
        updateBehavior: function (player, w, h) {
          this.vx = Math.sin(this.behaviorTimer * 0.03) * 3;
          this.vy = Math.cos(this.behaviorTimer * 0.04) * 2;
        }
      },

      36: {
        name: 'War Machine',
        size: 72,
        health: 8500,
        shootDelay: 45,  // Medium fire rate (between 35 and 55)
        maxPhases: 3,
        shootPattern: function (player) {
          // Dual cannon barrage - balanced difficulty
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          // Main cannons (bigger bullets for visibility)
          const cannonCount = this.phase === 1 ? 3 : this.phase === 2 ? 5 : 7;
          for (let i = 0; i < cannonCount; i++) {
            const spread = (i - cannonCount / 2) * 0.3;
            bullets.push(new Projectile(this.x, this.y, angle + spread, 8, 22, '#607d8b', 17, false, true));  // Bigger (20 was 16)
          }

          // AIMBOT rocket (red, high damage)
          bullets.push(new Projectile(this.x, this.y, angle, 10, 20, '#ff0000', 20, false, true));

          // Side missiles (bigger)
          if (this.phase >= 2) {
            const missileCount = this.phase === 2 ? 2 : 4;
            for (let i = 0; i < missileCount; i++) {
              const sideAngle = (i / missileCount) * Math.PI * 2;
              bullets.push(new Projectile(this.x, this.y, sideAngle, 6, 20, '#ff9800', 15, false, true));  // Bigger (18 was 14)
            }
          }

          return bullets;
        }
      },

      37: {
        name: 'Necromancer',
        size: 65,
        health: 9000,
        shootDelay: 90,  // Slower since summons ghosts
        maxPhases: 3,
        summonsGhosts: true,  // Flag for ghost summoning
        shootPattern: function (player) {
          // Summons 2 ghosts + aimbot
          const bullets = [];

          // AIMBOT dark magic bolt
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);
          bullets.push(new Projectile(this.x, this.y, aimAngle, 11, 18, '#ff00ff', 18, false, true));

          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Floats menacingly
          this.vx = Math.sin(this.behaviorTimer * 0.02) * 2;
          this.vy = Math.cos(this.behaviorTimer * 0.03) * 1.5;
        }
      },

      38: {
        name: 'Dragon',
        size: 75,
        health: 9500,
        shootDelay: 90,
        maxPhases: 3,
        spawnsFirePools: true,
        shootPattern: function (player) {
          // Aimbot fire breath
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          // Fire aimbot bullets
          const count = 1 + this.phase;  // 2, 3, 4 bullets
          for (let i = 0; i < count; i++) {
            const spread = (i - count / 2) * 0.2;
            bullets.push(new Projectile(this.x, this.y, angle + spread, 10, 18, '#ff4400', 19, false, true));
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Aggressive chase
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          this.vx = Math.sign(dx) * 2.5 + Math.sin(this.behaviorTimer * 0.03) * 1;
          this.vy = Math.cos(this.behaviorTimer * 0.04) * 1.5;
        }
      },

      39: {
        name: 'Hydra',
        size: 78,
        health: 10000,
        shootDelay: 45,
        maxPhases: 4,
        shootPattern: function (player) {
          // 3 heads shoot independently
          const bullets = [];
          const headsCount = 3;
          const bulletsPerHead = 4 + this.phase * 2; // 6, 8, 10, 12

          for (let head = 0; head < headsCount; head++) {
            const headAngle = (head / headsCount) * Math.PI * 2 - Math.PI / 2;
            const headX = this.x + Math.cos(headAngle) * 40;
            const headY = this.y + Math.sin(headAngle) * 40;

            const dx = player.x - headX;
            const dy = player.y - headY;
            const angle = Math.atan2(dy, dx);

            for (let i = 0; i < bulletsPerHead; i++) {
              const spread = (i - bulletsPerHead / 2) * 0.2;
              bullets.push(new Projectile(headX, headY, angle + spread, 10, 14, '#4caf50', 17, false));
            }
          }
          return bullets;
        }
      },

      40: {
        name: 'Demon King',
        size: 80,
        health: 10500,
        shootDelay: 40,
        maxPhases: 4,
        shootPattern: function (player) {
          // Screen-wide demonic attacks
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          if (this.phase === 1) {
            // Phase 1: Pentagram pattern
            for (let i = 0; i < 20; i++) {
              const a = (i / 20) * Math.PI * 2;
              bullets.push(new Projectile(this.x, this.y, a, 9, 16, '#8b0000', 18, false));
            }
          } else if (this.phase === 2) {
            // Phase 2: Aimed + rings
            for (let i = -3; i <= 3; i++) {
              bullets.push(new Projectile(this.x, this.y, angle + i * 0.2, 12, 15, '#ff0000', 18, false));
            }
            for (let i = 0; i < 16; i++) {
              bullets.push(new Projectile(this.x, this.y, (i / 16) * Math.PI * 2, 7, 14, '#cc0000', 16, false));
            }
          } else if (this.phase === 3) {
            // Phase 3: Chaos
            for (let i = 0; i < 25; i++) {
              const a = (i / 25) * Math.PI * 2 + this.behaviorTimer * 0.05;
              bullets.push(new Projectile(this.x, this.y, a, 8, 16, '#990000', 17, false));
            }
          } else {
            // Phase 4: HELL
            for (let i = 0; i < 32; i++) {
              const a = (i / 32) * Math.PI * 2;
              bullets.push(new Projectile(this.x, this.y, a, 6 + (i % 4), 17, '#660000', 19, false));
            }
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Teleports aggressively
          if (this.behaviorTimer % 60 === 0) {
            this.x = Math.random() * (w - 160) + 80;
            this.y = Math.random() * 100 + 60;
          }
        }
      },

      // LEVELS 41-50: IMPOSSIBLE Tier
      41: {
        name: 'Angel of Death',
        size: 68,
        health: 11000,
        shootDelay: 70,  // Slower (was 50)
        maxPhases: 4,
        shootPattern: function (player) {
          // Divine judgment (nerfed)
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          const wingsCount = 10 + this.phase * 6; // 16, 22, 28, 34 (was 26, 32, 38, 44)
          for (let i = 0; i < wingsCount; i++) {
            const a = (i / wingsCount) * Math.PI * 2;
            bullets.push(new Projectile(this.x, this.y, a, 7, 15, '#ffd700', 18, false, true));  // Slower (was 9)
          }

          // Holy beam (fewer)
          for (let i = -1; i <= 1; i++) {  // 3 instead of 5
            bullets.push(new Projectile(this.x, this.y, angle + i * 0.2, 10, 14, '#ffffff', 19, false, true));  // Slower (was 13)
          }
          return bullets;
        }
      },

      42: {
        name: 'Leviathan',
        size: 85,
        health: 11500,
        shootDelay: 45,
        maxPhases: 4,
        shootPattern: function (player) {
          // Tidal wave bullets
          const bullets = [];
          const waveSize = 15 + this.phase * 5; // 20, 25, 30, 35

          for (let i = 0; i < waveSize; i++) {
            const angle = (i / waveSize) * Math.PI * 2 + this.behaviorTimer * 0.03;
            const speed = 7 + Math.sin((i / waveSize) * Math.PI * 4) * 3; // Wave pattern speeds
            bullets.push(new Projectile(this.x, this.y, angle, speed, 17, '#006994', 18, false));
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Undulating movement
          this.vx = Math.sin(this.behaviorTimer * 0.04) * 4;
          this.vy = Math.cos(this.behaviorTimer * 0.02) * 2;
        }
      },

      43: {
        name: 'Phoenix',
        size: 70,
        health: 12000,
        shootDelay: 85,  // Even slower (was 70)
        maxPhases: 5,  // Revives once!
        shootPattern: function (player) {
          // Fire rebirth patterns (fewer, slower bullets)
          const bullets = [];
          const fireCount = 12 + this.phase * 3; // 15, 18, 21, 24, 27 (was 22-38)

          for (let i = 0; i < fireCount; i++) {
            const angle = (i / fireCount) * Math.PI * 2 + this.behaviorTimer * 0.06;
            bullets.push(new Projectile(this.x, this.y, angle, 5, 16, '#ff6600', 16, false, true));  // Even slower (was 6)
          }

          // Aimed fire blast (weaker burn)
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);
          for (let i = -1; i <= 1; i++) {
            const fireball = new Projectile(this.x, this.y, aimAngle + i * 0.3, 9, 18, '#ff3300', 19, false, true);  // Slower (was 10)
            fireball.burn = true;
            fireball.burnDuration = 240;  // 4 seconds (was 6)
            fireball.burnDamage = 4;  // 4 damage per tick (was 8)
            bullets.push(fireball);
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Swooping flight
          this.vx = Math.sin(this.behaviorTimer * 0.05) * 4;
          this.vy = Math.cos(this.behaviorTimer * 0.04) * 3;
        }
      },

      44: {
        name: 'Medusa',
        size: 66,
        health: 12500,
        shootDelay: 60,  // Regular attacks
        maxPhases: 4,
        gazeCooldown: 0,
        gazeDelay: 240,  // Gaze every 4 seconds
        shootPattern: function (player) {
          // Snake bullets + triple aimbot
          const bullets = [];
          const snakeCount = 8 + this.phase * 2; // 10, 12, 14, 16

          for (let i = 0; i < snakeCount; i++) {
            const angle = (i / snakeCount) * Math.PI * 2 + Math.sin(this.behaviorTimer * 0.05) * 0.5;
            const bullet = new Projectile(this.x, this.y, angle, 6, 14, '#00ff7f', 15, false, true);
            bullet.homing = true;
            bullet.homingStrength = 0.008;
            bullets.push(bullet);
          }

          // Triple aimbot bullets (middle one stronger)
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const aimAngle = Math.atan2(dy, dx);

          // Side bullets
          bullets.push(new Projectile(this.x, this.y, aimAngle - 0.15, 11, 16, '#ff0066', 19, false, true));  // Left
          bullets.push(new Projectile(this.x, this.y, aimAngle + 0.15, 11, 16, '#ff0066', 19, false, true));  // Right

          // Middle bullet (STRONGER!)
          bullets.push(new Projectile(this.x, this.y, aimAngle, 12, 19, '#ff0000', 25, false, true));  // Bigger, faster, more damage!

          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Slow stalking
          const dx = player.x - this.x;
          this.vx = Math.sign(dx) * 1.5 + Math.sin(this.behaviorTimer * 0.03) * 1;
          this.vy = Math.cos(this.behaviorTimer * 0.04) * 1.5;
        }
      },

      45: {
        name: 'Kraken',
        size: 90,
        health: 13000,
        shootDelay: 40,
        maxPhases: 5,
        shootPattern: function (player) {
          // 8 tentacles + whirlpool
          const bullets = [];
          const tentacles = 8;
          const bulletsPerTentacle = 3 + this.phase; // 4-8 bullets per tentacle

          for (let t = 0; t < tentacles; t++) {
            const tentacleAngle = (t / tentacles) * Math.PI * 2 + this.behaviorTimer * 0.04;
            const tentacleX = this.x + Math.cos(tentacleAngle) * 60;
            const tentacleY = this.y + Math.sin(tentacleAngle) * 60;

            for (let i = 0; i < bulletsPerTentacle; i++) {
              const angle = tentacleAngle + (i - bulletsPerTentacle / 2) * 0.3;
              bullets.push(new Projectile(tentacleX, tentacleY, angle, 9, 16, '#004d7a', 19, false));
            }
          }
          return bullets;
        }
      },

      46: {
        name: 'Cerberus',
        size: 50,  // Main body
        health: 4500,  // Body HP (vulnerable after heads die)
        shootDelay: 120,  // Body fires weak bullets
        maxPhases: 1,
        multiEntity: true,  // Special multi-part boss
        invulnerableUntilHeadsDead: true,
        shootPattern: function (player) {
          // Main body fires weak bullets
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          // 3 weak bullets
          for (let i = -1; i <= 1; i++) {
            bullets.push(new Projectile(this.x, this.y, angle + i * 0.25, 7, 14, '#8b0000', 14, false, true));
          }

          return bullets;
        }
      },

      47: {
        name: 'Behemoth',
        size: 95,
        health: 14000,
        shootDelay: 60,
        maxPhases: 5,
        shootPattern: function (player) {
          // Earthquake waves
          const bullets = [];
          const waves = this.phase; // 1-5 waves

          for (let w = 0; w < waves; w++) {
            const waveOffset = w * 0.4;
            for (let i = 0; i < 12; i++) {  // 12 instead of 20
              const angle = (i / 12) * Math.PI * 2 + waveOffset;
              bullets.push(new Projectile(this.x, this.y, angle, 4 + w, 12, '#8d6e63', 16, false, true));
            }
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Slow but unstoppable
          this.vx = Math.sin(this.behaviorTimer * 0.02) * 1.5;
          this.vy = 0;
        }
      },

      48: {
        name: 'Armageddon',
        size: 88,
        health: 14500,
        shootDelay: 60,  // Slower (was 35)
        maxPhases: 5,
        shootPattern: function (player) {
          // End of world - balanced difficulty
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          // Aimed barrage (40% fewer)
          const aimedCount = 6 + this.phase * 2;  // 8-16 (was 13-25)
          for (let i = 0; i < aimedCount; i++) {
            const spread = (i - aimedCount / 2) * 0.15;  // Wider spread
            bullets.push(new Projectile(this.x, this.y, angle + spread, 10, 15, '#ff1744', 19, false, true));  // Slower (was 13)
          }

          // Omnidirectional wave (40% fewer)
          const ringCount = 14 + this.phase * 3;  // 17-29 (was 28-44)
          for (let i = 0; i < ringCount; i++) {
            const a = (i / ringCount) * Math.PI * 2 + this.behaviorTimer * 0.07;
            bullets.push(new Projectile(this.x, this.y, a, 6, 14, '#d50000', 18, false, true));  // Slower (was 8)
          }

          return bullets;
        }
      },

      49: {
        name: 'Ragnarok',
        size: 92,
        health: 15000,
        shootDelay: 100,  // Very slow (was 70)
        maxPhases: 5,
        shootPattern: function (player) {
          // Norse apocalypse - dual spiral + aimed (all slower)
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          // Dual spirals (even slower)
          const spiralSize = 15 + this.phase * 5; // 20, 25, 30, 35, 40
          for (let s = 0; s < 2; s++) {
            for (let i = 0; i < spiralSize; i++) {
              const a = (i / spiralSize) * Math.PI * 2 + s * Math.PI + this.behaviorTimer * 0.1;
              bullets.push(new Projectile(this.x, this.y, a, 4 + s * 0.5, 17, '#673ab7', 20, false, true));  // Much slower (was 5 + s)
            }
          }

          // Aimed thunder (much slower)
          for (let i = -4; i <= 4; i++) {
            bullets.push(new Projectile(this.x, this.y, angle + i * 0.18, 8, 16, '#9c27b0', 21, false, true));  // Much slower (was 10)
          }

          return bullets;
        }
      },

      50: {
        name: 'GOD MODE',
        size: 100,
        health: 20000,
        shootDelay: 70,  // Balanced fire rate
        maxPhases: 6,
        color: '#ffffff',
        godMode: true,  // Special ultimate boss
        shootPattern: function (player) {
          // ULTIMATE BOSS - Phase-based creative mechanics
          const bullets = [];
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);

          if (this.phase === 1) {
            // PHASE 1: Elemental Tri-Force (Fire/Ice/Poison)
            // Fire bullets (burn)
            for (let i = 0; i < 8; i++) {
              const spread = (i - 4) * 0.2;
              const fireBullet = new Projectile(this.x, this.y, angle + spread, 8, 16, '#ff4500', 18, false, true);
              fireBullet.burn = true;
              fireBullet.burnDuration = 180;
              fireBullet.burnDamage = 3;
              bullets.push(fireBullet);
            }
            // Ice bullets (slow)
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2;
              const iceBullet = new Projectile(this.x, this.y, a, 7, 15, '#00bfff', 17, false, true);
              iceBullet.slow = true;
              iceBullet.slowDuration = 180;
              bullets.push(iceBullet);
            }
            // Poison bullets
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
              const poisonBullet = new Projectile(this.x, this.y, a, 7, 15, '#00ff00', 17, false, true);
              poisonBullet.poison = true;
              poisonBullet.poisonDuration = 240;
              poisonBullet.poisonDamage = 4;
              bullets.push(poisonBullet);
            }
          } else if (this.phase === 2) {
            // PHASE 2: Summoner (continues from Phase 1 + spawns)
            // Purple aimed bullets
            for (let i = -5; i <= 5; i++) {
              bullets.push(new Projectile(this.x, this.y, angle + i * 0.15, 9, 16, '#8b00ff', 18, false, true));
            }
          } else if (this.phase === 3) {
            // PHASE 3: Stone Gaze Terror (petrify handled in engine)
            // Homing snake bullets
            for (let i = 0; i < 16; i++) {
              const a = (i / 16) * Math.PI * 2;
              const snake = new Projectile(this.x, this.y, a, 6, 14, '#00ff7f', 16, false, true);
              snake.homing = true;
              snake.homingStrength = 0.008;
              bullets.push(snake);
            }
          } else if (this.phase === 4) {
            // PHASE 4: Multi-Position (shoots from 3 positions)
            const positions = [
              { x: this.x, y: this.y },
              { x: this.x - 120, y: this.y },
              { x: this.x + 120, y: this.y }
            ];

            positions.forEach(pos => {
              for (let i = -2; i <= 2; i++) {
                const dx2 = player.x - pos.x;
                const dy2 = player.y - pos.y;
                const a2 = Math.atan2(dy2, dx2);
                bullets.push(new Projectile(pos.x, pos.y, a2 + i * 0.2, 8, 15, '#ff00ff', 19, false, true));
              }
            });
          } else if (this.phase === 5) {
            // PHASE 5: Apocalyptic Patterns (waves + spirals)
            // Earthquake waves
            for (let w = 0; w < 2; w++) {
              for (let i = 0; i < 10; i++) {
                const a = (i / 10) * Math.PI * 2 + w * 0.3;
                bullets.push(new Projectile(this.x, this.y, a, 5 + w, 14, '#8d6e63', 17, false, true));
              }
            }
            // Dual spirals
            for (let s = 0; s < 2; s++) {
              for (let i = 0; i < 15; i++) {
                const a = (i / 15) * Math.PI * 2 + s * Math.PI + this.behaviorTimer * 0.08;
                bullets.push(new Projectile(this.x, this.y, a, 4 + s * 0.5, 15, '#673ab7', 18, false, true));
              }
            }
          } else {
            // PHASE 6: DIVINE FINALE (everything combined but balanced)
            // Mixed elemental
            for (let i = 0; i < 10; i++) {
              const a = (i / 10) * Math.PI * 2;
              const colors = ['#ff4500', '#00bfff', '#00ff00'];
              const color = colors[i % 3];
              bullets.push(new Projectile(this.x, this.y, a, 6, 15, color, 17, false, true));
            }
            // Spirals
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * Math.PI * 2 + this.behaviorTimer * 0.1;
              bullets.push(new Projectile(this.x, this.y, a, 5, 14, '#ffffff', 18, false, true));
            }
          }
          return bullets;
        },
        updateBehavior: function (player, w, h) {
          // Erratic godlike movement
          if (this.phase <= 3) {
            this.vx = Math.sin(this.behaviorTimer * 0.04) * 3;
            this.vy = Math.cos(this.behaviorTimer * 0.05) * 2;
          } else {
            // Aggressive pursuit
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            this.vx = Math.sign(dx) * 3 + Math.sin(this.behaviorTimer * 0.06) * 2;
            this.vy = Math.sign(dy) * 1.5 + Math.cos(this.behaviorTimer * 0.04) * 2;
          }
        }
      }
    };

    const config = configs[level] || configs[1];

    // Apply boss scaling based on player upgrades
    const scaledConfig = this.applyScaling(config, level, playerUpgrades);

    return new Boss(level, scaledConfig);
  }

  static applyScaling(config, level, playerUpgrades) {
    // NO SCALING - bosses have fixed HP for fair, consistent battles
    // All bosses balanced as if player has max upgrades
    const scaled = { ...config };
    scaled.damageMultiplier = 1.0; // No damage scaling either
    return scaled;
  }
}

