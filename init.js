// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new GameEngine(canvas);

  // Make game accessible globally
  window.gameInstance = game;

  // Create HTML menu manager
  const htmlMenus = new HTMLMenuManager(game);
  game.htmlMenus = htmlMenus;

  // Start with main menu visible
  htmlMenus.showMainMenu();

  game.start();
});

