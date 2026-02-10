import Phaser from "phaser";

/**
 * Generate placeholder spritesheet textures using Graphics.
 * Each "frame" is a colored rectangle with slight variations.
 */
export function generatePlaceholderSprites(scene: Phaser.Scene): void {
  // ── Player spritesheet: 6 frames (24x32 each) ──
  const pw = 24, ph = 32, frames = 6;
  const canvas = scene.textures.createCanvas("player_sheet", pw * frames, ph);
  const ctx = canvas!.context;

  for (let i = 0; i < frames; i++) {
    const x = i * pw;
    // Body
    ctx.fillStyle = "#4488ff";
    ctx.fillRect(x + 2, 4, 20, 24);
    // Head
    ctx.fillStyle = "#66aaff";
    ctx.fillRect(x + 6, 0, 12, 10);
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 8, 3, 3, 3);
    ctx.fillRect(x + 14, 3, 3, 3);
    // Legs (alternate for run animation)
    ctx.fillStyle = "#3366cc";
    if (i % 2 === 0) {
      ctx.fillRect(x + 4, 28, 6, 4);
      ctx.fillRect(x + 14, 26, 6, 6);
    } else {
      ctx.fillRect(x + 4, 26, 6, 6);
      ctx.fillRect(x + 14, 28, 6, 4);
    }
  }
  canvas!.refresh();

  // Add spritesheet config
  scene.textures.get("player_sheet").add("__BASE", 0, 0, 0, pw * frames, ph);
  for (let i = 0; i < frames; i++) {
    scene.textures.get("player_sheet").add(i, 0, i * pw, 0, pw, ph);
  }

  // ── Simple single-frame textures ──
  createRect(scene, "player", 0x4488ff, 24, 32);
  createRect(scene, "tile_ground", 0x444455, 32, 32, 0x555566);
  createRect(scene, "tile_platform", 0x555577, 32, 16);
  createRect(scene, "tile_wall", 0x333344, 32, 32, 0x444455);

  // Enemy textures
  createRect(scene, "enemy_slime", 0x44cc44, 28, 20);
  createRect(scene, "enemy_bat", 0x8844cc, 24, 18);
  createRect(scene, "enemy_skeleton", 0xccccaa, 24, 32);
  createRect(scene, "enemy_demon", 0xcc2222, 36, 40);

  // Item textures
  createCircle(scene, "item_health", 0xff4444, 10);
  createCircle(scene, "item_shield", 0x4488ff, 10);
  createCircle(scene, "item_speed", 0xffcc00, 10);
  createCircle(scene, "item_damage", 0xff8800, 10);
  createCircle(scene, "item_coin", 0xffdd00, 8);

  // Particles
  createCircle(scene, "particle_white", 0xffffff, 3);
  createCircle(scene, "particle_red", 0xff4444, 3);
  createCircle(scene, "particle_blue", 0x4488ff, 3);
  createCircle(scene, "particle_yellow", 0xffcc00, 3);
  createCircle(scene, "particle_green", 0x44cc44, 3);
}

function createRect(
  scene: Phaser.Scene,
  key: string,
  fill: number,
  w: number,
  h: number,
  stroke?: number
): void {
  const gfx = scene.add.graphics();
  gfx.fillStyle(fill);
  gfx.fillRect(0, 0, w, h);
  if (stroke) {
    gfx.lineStyle(1, stroke);
    gfx.strokeRect(0, 0, w, h);
  }
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

function createCircle(
  scene: Phaser.Scene,
  key: string,
  fill: number,
  radius: number
): void {
  const gfx = scene.add.graphics();
  gfx.fillStyle(fill);
  gfx.fillCircle(radius, radius, radius);
  gfx.generateTexture(key, radius * 2, radius * 2);
  gfx.destroy();
}

/**
 * Register all animations after textures are ready.
 */
export function registerAnimations(anims: Phaser.Animations.AnimationManager): void {
  // Player animations using spritesheet
  if (!anims.exists("player_idle")) {
    anims.create({
      key: "player_idle",
      frames: [{ key: "player_sheet", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
  }

  if (!anims.exists("player_run")) {
    anims.create({
      key: "player_run",
      frames: [
        { key: "player_sheet", frame: 0 },
        { key: "player_sheet", frame: 1 },
        { key: "player_sheet", frame: 2 },
        { key: "player_sheet", frame: 3 },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!anims.exists("player_jump")) {
    anims.create({
      key: "player_jump",
      frames: [{ key: "player_sheet", frame: 4 }],
      frameRate: 1,
      repeat: 0,
    });
  }

  if (!anims.exists("player_fall")) {
    anims.create({
      key: "player_fall",
      frames: [{ key: "player_sheet", frame: 5 }],
      frameRate: 1,
      repeat: 0,
    });
  }
}

/**
 * Player animation state machine.
 * Returns the animation key based on current state.
 */
export function getPlayerAnimation(state: string): string {
  switch (state) {
    case "running": return "player_run";
    case "jumping": return "player_jump";
    case "falling": return "player_fall";
    case "dead": return "player_idle";
    default: return "player_idle";
  }
}
