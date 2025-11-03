# Boss Fighter - Chrome Extension Game

A thrilling boss-rush game where you play as a blue block fighting through 42 unique boss battles! Each boss has distinct attack patterns and behaviors.

## Features

- **42 Unique Boss Fights**: Each level features a special boss with unique mechanics
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


## How to Play

### Controls

**Movement:**
- Use WASD or Arrow Keys to move your blue block
- Move in 8 directions (including diagonals)

**Aiming & Shooting:**
- Move your mouse to aim - your bullets will shoot towards the cursor
- Press SPACEBAR or CLICK to shoot
- A thin blue line shows your aim direction
- Use E and R to use special abilities
- Use Q for toggle auto aim and auto shoot
- 
### Game Modes

- **Play**: Start from level 1
- **Grind Mode**: grind your money

### Gameplay Tips

1. Stay in the bottom half of the screen - that's your safe zone
2. Watch boss movement patterns to predict attacks
3. Keep moving to dodge bullets
5. Some bosses have multiple phases - adapt your strategy!

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
- 42 unique boss fights
- Progressive difficulty
- Full stat tracking
- Cross-platform support

Enjoy the battle! Can you defeat all 42 bosses?

