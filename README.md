# Boss Fighter - Chrome Extension Game

A thrilling boss-rush game where you play as a blue block fighting through 30 unique boss battles! Each boss has distinct attack patterns and behaviors.

## Features

- **30 Unique Boss Fights**: Each level features a special boss with unique mechanics
- **Mouse Aiming**: Aim with your mouse cursor for precise shooting
- **Keyboard/Touch Controls**: WASD movement + spacebar/click to shoot
- **Mobile Friendly**: Touch controls for tablets and phones
- **Progress Saving**: Your progress and stats are automatically saved
- **Statistics Tracking**: Track kills, deaths, accuracy, and playtime

## Installation

### Method 1: Load Unpacked Extension (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the "bonus fighter" folder
5. The extension icon should appear in your toolbar

### Method 2: Generate Icons First

1. Open `create-icons.html` in your browser
2. The icons will auto-download after 2 seconds
3. Create an `icons` folder in the project directory
4. Move the three downloaded PNG files into the `icons` folder
5. Follow Method 1 steps above

## How to Play

### Controls

**Movement:**
- Use WASD or Arrow Keys to move your blue block
- Move in 8 directions (including diagonals)

**Aiming & Shooting:**
- Move your mouse to aim - your bullets will shoot towards the cursor
- Press SPACEBAR or CLICK to shoot
- A thin blue line shows your aim direction

**Touch Controls (Mobile/Tablet):**
- Touch anywhere to aim in that direction
- Touch to shoot automatically

### Game Modes

- **Play**: Start from level 1
- **Level Select**: Choose any unlocked level
- **Stats**: View your statistics and progress
- **How to Play**: In-game instructions

### Gameplay Tips

1. Stay in the bottom half of the screen - that's your safe zone
2. Watch boss movement patterns to predict attacks
3. Keep moving to dodge bullets
4. Each boss changes behavior as it takes damage
5. Some bosses have multiple phases - adapt your strategy!

## Boss List

1. **The Awakening** - Simple stationary shooter (tutorial)
2. **Sidewinder** - Side-to-side movement
3. **Triple Threat** - Three-way spread shot
4. **Orbiter** - Circular movement pattern
5. **Rapid Fire** - Fast shooting rate
6. **Wave Master** - Wave pattern movement
7. **Pentashot** - Five-way spread attack
8. **Zigzag** - Erratic movement
9. **Spinner** - Rotating bullet spray
10. **Summoner** - Spawns bullet rings
11. **Sniper** - Fast, precise shots
12. **Fortress** - Shoots in cardinal directions
13. **Stalker** - Follows your position
14. **Burst King** - Multi-speed burst fire
15. **Teleporter** - Blinks around arena
16. **Helix** - Spiral bullet pattern
17. **Berserker** - Aggressive movement
18. **Meteor Shower** - Random bullet spray
19. **Phase Shifter** - Changes patterns over time
20. **Twin Terror** - Two-phase boss fight
21. **Gatling** - Machine gun fire
22. **Geometric** - Geometric bullet patterns
23. **Interceptor** - Predictive aiming
24. **Pulse Wave** - Expanding bullet rings
25. **Bullet Hell** - Dense bullet patterns
26. **Dimensional** - Multi-position attacks
27. **Chaos Engine** - Completely random
28. **Dreadnought** - Massive firepower
29. **Omega Protocol** - Three-phase challenge
30. **THE CRIMSON EMPEROR** - Final boss with all mechanics

## File Structure

```
bonus-fighter/
├── manifest.json          # Chrome extension configuration
├── popup.html            # Main game interface
├── popup.css             # Game styling
├── popup.js              # Game initialization
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── game/                 # Game logic
│   ├── engine.js         # Main game loop
│   ├── player.js         # Player mechanics
│   ├── projectile.js     # Bullet system
│   ├── boss.js           # Base boss class
│   ├── bosses.js         # All 30 boss definitions
│   ├── controls.js       # Input handling
│   ├── storage.js        # Save system
│   └── ui.js             # Menus and HUD
├── create-icons.html     # Icon generator
└── README.md             # This file
```

## Technical Details

- **Canvas Rendering**: HTML5 Canvas with 60 FPS game loop
- **Storage**: Chrome Storage API for persistent saves
- **Collision Detection**: AABB and circle collision
- **Input**: Keyboard, mouse, and touch support
- **Architecture**: Object-oriented with behavior composition

## Development

### Adding New Bosses

Edit `game/bosses.js` and add a new configuration in the `BossFactory.createBoss()` method:

```javascript
levelNumber: {
    name: 'Boss Name',
    size: 40,
    health: 200,
    shootDelay: 60,
    updateBehavior: function(player, w, h) {
        // Movement logic
    },
    shootPattern: function(player) {
        // Shooting logic
        return [bullets];
    }
}
```

### Customization

- Adjust difficulty in `game/boss.js` and `game/bosses.js`
- Modify player stats in `game/player.js`
- Change colors and styling in `popup.css`
- Customize canvas size in `popup.html`

## Credits

Created as a Chrome Extension game featuring:
- 30 unique boss fights
- Progressive difficulty
- Full stat tracking
- Cross-platform support

Enjoy the battle! Can you defeat all 30 bosses?

