// Initialize the game when popup loads
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new GameEngine(canvas);

  // Make game accessible globally for quest claiming
  window.gameInstance = game;

  // Create HTML menu manager
  const htmlMenus = new HTMLMenuManager(game);
  game.htmlMenus = htmlMenus;

  // Start with main menu visible
  htmlMenus.showMainMenu();

  game.start();
});

