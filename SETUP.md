# Boss Fighter - Setup Guide

## Quick Start (5 minutes)

### Step 1: Generate Icons

The extension needs three icon files. Choose one method:

#### Option A: Using the HTML Generator (Recommended)
1. Open `create-icons.html` in any web browser
2. Click "Download All Icons" button
3. Move the three downloaded PNG files from your Downloads folder to the `icons/` folder

#### Option B: Using Python (if Pillow is installed)
```bash
python3 generate_icons.py
```

#### Option C: Using Node.js (if canvas package is installed)
```bash
npm install canvas
node generate-icons.js
```

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle switch in top-right corner)
3. Click "Load unpacked" button
4. Select the `bonus fighter` folder
5. The Boss Fighter icon should appear in your extensions toolbar

### Step 3: Play!

1. Click the Boss Fighter extension icon in your toolbar
2. The game will open in a popup window
3. Use WASD to move, mouse to aim, SPACE or click to shoot
4. Defeat all 30 bosses!

## Troubleshooting

### Icons Not Loading
- Make sure all three icon files (icon16.png, icon48.png, icon128.png) are in the `icons/` folder
- The icons folder should be directly inside the `bonus fighter` folder

### Extension Not Appearing
- Check that you selected the correct folder (should contain manifest.json)
- Look for any error messages in chrome://extensions/
- Make sure Developer mode is enabled

### Game Not Starting
- Open Chrome DevTools (F12) on the popup to see any errors
- Make sure all JavaScript files are in the `game/` folder
- Try reloading the extension

### Controls Not Working
- Make sure the game canvas has focus (click on it)
- Check that you're using a supported browser (Chrome, Edge, or other Chromium-based)

## File Structure Check

Your folder should look like this:
```
bonus fighter/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── game/
│   ├── engine.js
│   ├── player.js
│   ├── projectile.js
│   ├── boss.js
│   ├── bosses.js
│   ├── controls.js
│   ├── storage.js
│   └── ui.js
├── README.md
├── SETUP.md
└── create-icons.html
```

## Next Steps

- Read README.md for complete game documentation
- Check out the boss list to see what challenges await
- Track your stats in the game's Stats menu

Happy gaming! 🎮

