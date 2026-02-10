import Phaser from "phaser";
import { generatePlaceholderSprites, registerAnimations } from "../config/animations";
import { audioManager } from "../systems/AudioManager";

/**
 * Boot scene — loads assets, generates placeholder textures, initializes audio.
 */
export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressBg!: Phaser.GameObjects.Rectangle;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Loading UI
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    this.loadingText = this.add.text(cx, cy - 40, "LOADING", {
      fontSize: "14px",
      fontFamily: "'Press Start 2P', monospace",
      color: "#6c5ce7",
    });
    this.loadingText.setOrigin(0.5);

    // Progress bar
    const barW = this.cameras.main.width * 0.5;
    this.progressBg = this.add.rectangle(cx, cy, barW, 12, 0x222233);
    this.progressBar = this.add.rectangle(cx - barW / 2, cy, 0, 12, 0x6c5ce7);
    this.progressBar.setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      this.progressBar.width = barW * value;
    });

    // ── Load real assets when available ──
    // Tilemaps
    // this.load.tilemapTiledJSON("map_arena", "assets/tiles/arena.json");
    // this.load.tilemapTiledJSON("map_forest", "assets/tiles/forest.json");
    // this.load.tilemapTiledJSON("map_dungeon", "assets/tiles/dungeon.json");

    // Tilesets
    // this.load.image("tileset_main", "assets/tiles/tileset.png");

    // Spritesheets
    // this.load.spritesheet("player", "assets/sprites/player.png", { frameWidth: 24, frameHeight: 32 });
    // this.load.spritesheet("enemies", "assets/sprites/enemies.png", { frameWidth: 32, frameHeight: 32 });

    // Audio
    // this.load.audio("music_gameplay", "assets/audio/music/gameplay.ogg");
    // this.load.audio("sfx_jump", "assets/audio/sfx/jump.wav");
    // this.load.audio("sfx_hit", "assets/audio/sfx/hit.wav");

    // UI
    // this.load.image("ui_heart", "assets/ui/heart.png");

    // Fonts
    // this.load.bitmapFont("pixel", "assets/fonts/pixel.png", "assets/fonts/pixel.xml");
  }

  create(): void {
    // Generate placeholder textures (replaces real assets until Phase 5)
    generatePlaceholderSprites(this);

    // Register animations
    registerAnimations(this.anims);

    // Initialize audio system
    audioManager.init();

    // Clean up loading UI
    this.progressBar.destroy();
    this.progressBg.destroy();
    this.loadingText.destroy();

    // Transition to game
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("GameScene");
    });
  }
}
