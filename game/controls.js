// Input handling for keyboard, mouse, and touch
class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.touch = { active: false, x: 0, y: 0 };

    // Touch control elements
    this.touchDpad = null;
    this.touchShootButton = null;

    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  setupMouse() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      e.preventDefault();
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.down = false;
    });
  }

  setupTouch() {
    // Detect if device supports touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      this.createTouchControls();
    }

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.active = true;
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
      this.mouse.x = this.touch.x;
      this.mouse.y = this.touch.y;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
      this.mouse.x = this.touch.x;
      this.mouse.y = this.touch.y;
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touch.active = false;
    }, { passive: false });
  }

  createTouchControls() {
    // Virtual D-pad for movement (could be enhanced with visual UI)
    // For now, we'll use touch position as aim and add virtual buttons
    // This is a simplified version - can be enhanced with on-screen controls
  }

  isKeyPressed(key) {
    return this.keys[key] === true;
  }

  isShooting() {
    return this.keys[' '] || this.keys['spacebar'] || this.mouse.down || this.touch.active;
  }

  getAimPosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  reset() {
    this.keys = {};
    this.mouse.down = false;
    this.touch.active = false;
  }
}

