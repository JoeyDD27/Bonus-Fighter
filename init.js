// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new GameEngine(canvas);

  // Make game accessible globally
  window.gameInstance = game;

  // Create HTML menu manager
  const htmlMenus = new HTMLMenuManager(game);
  game.htmlMenus = htmlMenus;

  // Check if new player (show tutorial)
  const data = await game.storage.loadData();
  if (!data.hasSeenTutorial) {
    // New player - show How to Play
    htmlMenus.showScreen('howToPlayScreen');
    game.state = 'HOW_TO_PLAY';

    // Mark tutorial as seen
    data.hasSeenTutorial = true;
    await game.storage.saveData(data);
  } else {
    // Returning player - show main menu
    htmlMenus.showMainMenu();
  }

  game.start();
});

