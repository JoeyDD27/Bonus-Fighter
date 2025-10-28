// Bullet color system based on damage
// Higher damage = darker/redder, Lower damage = pinker/lighter

function getBulletColor(damage, isPlayerBullet = false) {
  if (isPlayerBullet) {
    // Player bullets
    return '#7ec4f2';
  }

  // Enemy bullet colors based on damage
  if (damage <= 8) {
    return '#f0b6c8';  // Soft pink (low damage)
  } else if (damage <= 10) {
    return '#f58b8b';  // Soft coral (low-medium damage)
  } else if (damage <= 12) {
    return '#ef7676';  // Soft red (medium damage)
  } else if (damage <= 15) {
    return '#e06b6b';  // Medium red (medium-high damage)
  } else if (damage <= 20) {
    return '#d45a5a';  // Dark red (high damage)
  } else {
    return '#c44e4e';  // Very dark red (very high damage)
  }
}

