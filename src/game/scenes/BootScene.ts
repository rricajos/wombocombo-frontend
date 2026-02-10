import Phaser from "phaser";
import { registerAnimations } from "../config/animations";

/**
 * Boot scene — loads all assets, creates placeholder textures, then starts GameScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Loading bar
    const bar = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      0,
      20,
      0x6c5ce7
    );

    this.load.on("progress", (value: number) => {
      bar.width = this.cameras.main.width * 0.6 * value;
    });

    // TODO: Load actual assets in Phase 3+
    // this.load.spritesheet("player", "assets/sprites/player.png", { frameWidth: 32, frameHeight: 32 });
    // this.load.tilemapTiledJSON("map_arena", "assets/tiles/arena.json");
    // this.load.image("tileset_main", "assets/tiles/tileset.png");
  }

  create(): void {
    // Generate placeholder textures
    this.createPlaceholderTextures();

    // Register animations
    registerAnimations(this.anims);

    // Start game scene
    this.scene.start("GameScene");
  }

  private createPlaceholderTextures(): void {
    // Player: blue rectangle
    const playerGfx = this.add.graphics();
    playerGfx.fillStyle(0x4488ff);
    playerGfx.fillRect(0, 0, 24, 32);
    playerGfx.generateTexture("player", 24, 32);
    playerGfx.destroy();

    // Ground tile: dark gray
    const tileGfx = this.add.graphics();
    tileGfx.fillStyle(0x444455);
    tileGfx.fillRect(0, 0, 32, 32);
    tileGfx.lineStyle(1, 0x555566);
    tileGfx.strokeRect(0, 0, 32, 32);
    tileGfx.generateTexture("tile_ground", 32, 32);
    tileGfx.destroy();

    // Platform tile: lighter gray
    const platGfx = this.add.graphics();
    platGfx.fillStyle(0x555577);
    platGfx.fillRect(0, 0, 32, 16);
    platGfx.generateTexture("tile_platform", 32, 16);
    platGfx.destroy();
  }
}
