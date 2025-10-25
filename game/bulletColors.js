// Bullet color system based on damage
// Higher damage = darker/redder, Lower damage = pinker/lighter

function getBulletColor(damage, isPlayerBullet = false) {
  if (isPlayerBullet) {
    // Player bullets always blue
    return '#74c0fc';
  }

  // Enemy bullet colors based on damage
  if (damage <= 8) {
    return '#ffb3d9';  // Light pink (low damage)
  } else if (damage <= 10) {
    return '#ff8787';  // Pink-red (low-medium damage)
  } else if (damage <= 12) {
    return '#ff6b6b';  // Medium red (medium damage)
  } else if (damage <= 15) {
    return '#ff4444';  // Bright red (medium-high damage)
  } else if (damage <= 20) {
    return '#e03131';  // Dark red (high damage)
  } else {
    return '#c92a2a';  // Very dark red (very high damage)
  }
}

