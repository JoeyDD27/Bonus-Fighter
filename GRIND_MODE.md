# Grind Mode - Wave Survival System

## 🌊 Overview

**Grind Mode** is an endless wave survival mode where you fight increasing numbers of random bosses to earn coins!

---

## How It Works

### Wave System
- **Wave 1:** 1 random boss
- **Wave 2:** 2 random bosses simultaneously
- **Wave 3:** 3 random bosses simultaneously
- **Wave X:** X random bosses
- **Continues until you die!**

### Boss Selection
- Completely random from all 30 boss types
- Each wave picks new random bosses
- Could get easy bosses or hard bosses - it's random!

### Between Waves
- **3 second break** after clearing all bosses in a wave
- No healing
- No ability reset
- Countdown: "Wave X Complete! Next wave in 3..."

### Coin Rewards (Escalating)
- **Wave 1:** 10 coins
- **Wave 2:** 20 coins
- **Wave 3:** 30 coins
- **Wave X:** X × 10 coins
- **Total formula:** Wave coins = wave number × 10

### Game Over
- **One life** - die once and grind ends
- Collect all earned coins
- Track best wave reached

### High Scores
- Best wave survived
- Total coins earned in grind mode
- Displayed on stats screen

---

## Gameplay Loop

```
Start Grind Mode
  ↓
Wave 1: Fight 1 boss → Earn 10 coins
  ↓
3 second break
  ↓
Wave 2: Fight 2 bosses → Earn 20 coins
  ↓
3 second break
  ↓
Wave 3: Fight 3 bosses → Earn 30 coins
  ↓
Continue...
  ↓
Die → Collect all coins!
```

---

## Strategy

### Early Waves (1-5)
- Easy - few bosses
- Focus on not getting hit
- Save abilities for later

### Mid Waves (6-10)
- Getting harder - many bosses
- Use abilities strategically
- Manage health carefully

### Late Waves (11+)
- Extremely hard - tons of bosses
- Bullet hell
- Perfect dodging required
- All abilities on cooldown management

---

## Example Run

**Wave 1:** 1 boss (Spinner) → **+10 coins**
**Wave 2:** 2 bosses (Fortress, Meteor Shower) → **+20 coins**
**Wave 3:** 3 bosses (Random) → **+30 coins**
**Wave 4:** 4 bosses (Random) → **+40 coins**
**Wave 5:** 5 bosses (Random) → **+50 coins**
**Die on Wave 6**

**Total earned:** 10+20+30+40+50 = **150 coins!**
**Best wave:** 5

---

## Coin Potential

| Waves Survived | Total Coins Earned |
|----------------|-------------------|
| **5 waves** | 150 coins |
| **10 waves** | 550 coins |
| **15 waves** | 1200 coins |
| **20 waves** | 2100 coins |

**Formula:** Total = (waves × (waves + 1) × 5)

---

## UI Elements

### HUD (Top-Left):
```
HP: 150/200 ████████░░
Wave 5
Bosses Left: 3
💰 +150
E: READY    R: 12.5s
```

### Between Waves:
```
Wave 5 Complete!
Next wave in 2...
Get ready for more bosses!
```

### Game Over Screen:
```
GRIND MODE COMPLETE
Waves Survived: 5
+150 💰
Best: Wave 3  (or "New Best Wave!")

[Play Again]  [Shop]
   [Menu]
```

---

## Access

**Main Menu:**
```
Play
Grind Mode  ← Click here!
Shop
Quests
Level Select
Stats
How to Play
```

**Available from the start** - no unlocking required!

---

## Best Strategies

**Tank Build:**
- Revenge passive (deal damage when hit)
- Health Potion (50% heal)
- Let bosses hit you for revenge damage

**Survival Build:**
- Shield (invincibility + auto-save)
- Auto-Heal passive
- Focus on dodging

**DPS Build:**
- Bullet Storm (12 homing bullets)
- Combo Damage passive
- Kill bosses quickly before overwhelmed

---

**Grind Mode is perfect for farming coins!** 🌊💰

