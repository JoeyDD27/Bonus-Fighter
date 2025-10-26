// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new GameEngine(canvas);

  // Make game accessible globally
  window.gameInstance = game;

  // Create HTML menu manager
  const htmlMenus = new HTMLMenuManager(game);
  game.htmlMenus = htmlMenus;

  // Always show main menu (no auto-tutorial)
  htmlMenus.showMainMenu();

  game.start();
});

