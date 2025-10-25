# Boss Fighter - Technical Architecture

## Overview
Boss Fighter is a Chrome Extension game built with vanilla JavaScript, HTML5 Canvas, and the Chrome Storage API.

## Architecture Design

### Game States
The game uses a finite state machine with these states:
- **MENU**: Main menu navigation
- **LEVEL_SELECT**: Level selection grid
- **PLAYING**: Active gameplay
- **PAUSED**: Game paused
- **VICTORY**: Level complete screen
- **DEFEAT**: Death screen
- **STATS**: Statistics display
- **HOW_TO_PLAY**: Instructions screen

### Core Components

#### 1. GameEngine (`game/engine.js`)
- Main game loop using `requestAnimationFrame`
- State management
- Coordinates all game systems
- Handles transitions between states
- 60 FPS update cycle

#### 2. Player (`game/player.js`)
- Movement: 8-directional with WASD/Arrow keys
- Shooting: Mouse-aimed projectiles
- Health system (100 HP)
- Collision detection with enemy bullets
- Visual: Blue square (20x20px)

#### 3. Boss System (`game/boss.js`, `game/bosses.js`)
- **Base Boss Class**: Provides common functionality
  - Movement behaviors
  - Shooting patterns
  - Health management
  - Multi-phase support
- **BossFactory**: Creates 30 unique boss instances
- **Behavior Composition**: Bosses combine different behaviors
  - Movement controllers
  - Attack patterns
  - Phase transitions

#### 4. Projectile System (`game/projectile.js`)
- Player bullets: Blue, fast, small damage
- Enemy bullets: Red, varied speeds and patterns
- Collision detection using circle collision
- Automatic cleanup of off-screen bullets

#### 5. Controls (`game/controls.js`)
- **Keyboard**: WASD/Arrow keys for movement, Space for shooting
- **Mouse**: Cursor position for aiming, click for shooting
- **Touch**: Touch position for aiming (mobile support)
- Input buffering and state management

#### 6. UI Manager (`game/ui.js`)
- Menu rendering
- HUD (health bars, level info, time)
- Level selection grid
- Stats display
- Victory/defeat screens
- Pause overlay

#### 7. Storage Manager (`game/storage.js`)
- Chrome Storage API integration
- Persistent save data:
  - Level unlock/completion status
  - Best times per level
  - Global statistics
- Async/await pattern for storage operations

## Data Flow

```
User Input → Controls → GameEngine → Update Game State
                                   ↓
                         Update Entities (Player, Boss, Bullets)
                                   ↓
                         Collision Detection
                                   ↓
                         Render to Canvas
                                   ↓
                         Save Progress (on victory/defeat)
```

## Boss Behavior System

### Behavior Types
1. **Movement Patterns**
   - Stationary
   - Side-to-side
   - Circular orbit
   - Zigzag
   - Chase player
   - Teleportation
   - Random

2. **Attack Patterns**
   - Single aimed shot
   - Spread shots (3, 5, 7-way)
   - Circular bullet rings
   - Spiral patterns
   - Bullet hell (dense)
   - Predictive aiming
   - Machine gun spray
   - Multi-phase combinations

3. **Special Mechanics**
   - Phase transitions based on health
   - Behavior changes over time
   - Multiple simultaneous patterns
   - Adaptive difficulty

## Collision Detection

### AABB (Axis-Aligned Bounding Box)
Used for rectangular entities (player, bosses)

### Circle Collision
Used for projectiles:
```javascript
distance = sqrt((x1-x2)² + (y1-y2)²)
collision = distance < (radius1 + radius2)
```

## Performance Optimizations

1. **Object Pooling Candidate**: Currently creates/destroys bullets
2. **Culling**: Off-screen bullets are removed
3. **Fixed Timestep**: 60 FPS target with requestAnimationFrame
4. **Minimal DOM**: Canvas-only rendering (no DOM manipulation per frame)

## Save Data Structure

```javascript
{
  levels: {
    1: { 
      unlocked: true, 
      completed: true, 
      bestTime: 45.2 
    },
    // ... 30 levels
  },
  stats: {
    totalKills: 15,
    totalDeaths: 8,
    shotsFired: 450,
    shotsHit: 180,
    totalPlayTime: 1200
  }
}
```

## Extension Manifest (V3)

```json
{
  "manifest_version": 3,
  "permissions": ["storage"],
  "action": { "default_popup": "popup.html" }
}
```

## Canvas Layout

```
600x700px canvas
├─ Top 350px: Boss area (red zone)
├─ Middle: Dividing line
└─ Bottom 350px: Player area (safe zone)

HUD Elements:
- Top-left: Player health bar
- Top-right: Boss name and level
- Top-center: Time elapsed
```

## Boss Difficulty Curve

- Levels 1-5: Tutorial/Easy (simple patterns)
- Levels 6-10: Normal (combined patterns)
- Levels 11-15: Hard (unpredictable movement)
- Levels 16-20: Expert (multi-phase, dense bullets)
- Levels 21-25: Master (complex combinations)
- Levels 26-30: Ultimate (all mechanics combined)

## Future Enhancement Ideas

### Gameplay
- [ ] Power-ups (speed, rapid fire, shield)
- [ ] Different player characters
- [ ] Boss weakpoints
- [ ] Combo system
- [ ] Time attack mode
- [ ] Daily challenges

### Technical
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] Screen shake on hits
- [ ] Boss entry animations
- [ ] Replay system
- [ ] Leaderboards (if backend added)

### Visual
- [ ] Sprite graphics instead of shapes
- [ ] Background variations per level
- [ ] Boss telegraphing (attack warnings)
- [ ] Bullet trail effects
- [ ] Victory animations

### Mobile
- [ ] Virtual joystick for touch
- [ ] Responsive canvas sizing
- [ ] Touch feedback
- [ ] Gyroscope aiming

## File Dependencies

```
popup.html
  └─ popup.css (styling)
  └─ popup.js (initialization)
      └─ game/engine.js
          ├─ game/storage.js
          ├─ game/player.js
          ├─ game/boss.js
          │   └─ game/bosses.js (factory)
          ├─ game/projectile.js
          ├─ game/controls.js
          └─ game/ui.js
```

## Testing Checklist

- [ ] All 30 bosses load correctly
- [ ] Progress saves and loads
- [ ] Level unlock system works
- [ ] Stats tracking is accurate
- [ ] Mouse aiming is precise
- [ ] Keyboard controls responsive
- [ ] Touch controls work on tablet
- [ ] Victory/defeat transitions
- [ ] Menu navigation
- [ ] Pause functionality
- [ ] Collision detection accurate
- [ ] No memory leaks (bullets cleaned up)

## Browser Compatibility

- ✅ Chrome (primary target)
- ✅ Edge (Chromium)
- ✅ Brave
- ✅ Opera
- ❌ Firefox (requires manifest conversion)
- ❌ Safari (different extension system)

## License

Open source - modify and extend as desired!

