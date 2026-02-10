import type Phaser from "phaser";

/**
 * Register all sprite animations. Called once in BootScene after assets load.
 * Currently using placeholder colored rectangles — actual spritesheets come in Phase 5.
 */
export function registerAnimations(anims: Phaser.Animations.AnimationManager): void {
  // Player animations (will use spritesheet frames later)
  // For now, placeholder — the Player entity uses tint changes to indicate state
  if (!anims.exists("player_idle")) {
    anims.create({ key: "player_idle", frames: [{ key: "player", frame: 0 }], repeat: -1 });
  }
  if (!anims.exists("player_run")) {
    anims.create({ key: "player_run", frames: [{ key: "player", frame: 0 }], repeat: -1 });
  }
  if (!anims.exists("player_jump")) {
    anims.create({ key: "player_jump", frames: [{ key: "player", frame: 0 }], repeat: -1 });
  }
}
