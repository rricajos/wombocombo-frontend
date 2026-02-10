import Phaser from "phaser";
import { Player } from "../entities/Player";
import { InputManager } from "../systems/InputManager";
import { NetworkSync } from "../systems/NetworkSync";
import { PHYSICS } from "../config/physics";
import { socket } from "$lib/network/socket";
import { onGameEvent } from "$lib/network/handler";
import { authStore } from "$lib/stores/auth.svelte";
import { gameStore } from "$lib/stores/game.svelte";
import type { ServerMessage } from "$lib/network/messages";

/**
 * Main gameplay scene. Manages local player, input, and network sync.
 */
export class GameScene extends Phaser.Scene {
  private localPlayer!: Player;
  private inputManager!: InputManager;
  private networkSync!: NetworkSync;
  private localTick: number = 0;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private unsubGameEvents?: () => void;
  private fpsText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    const playerId = authStore.player?.id ?? "local";

    // World bounds
    this.physics.world.setBounds(0, 0, 1280, 720);

    // Build placeholder level
    this.buildPlaceholderLevel();

    // Create local player
    const spawnX = 200;
    const spawnY = 500;
    this.localPlayer = new Player(this, spawnX, spawnY);

    // Collide player with platforms
    this.physics.add.collider(this.localPlayer, this.platforms);

    // Camera follows player
    this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1280, 720);

    // Input
    this.inputManager = new InputManager(this);

    // Network sync for remote entities
    this.networkSync = new NetworkSync(this, playerId);

    // Subscribe to game events from server
    this.unsubGameEvents = onGameEvent((msg: ServerMessage) => {
      this.handleGameEvent(msg);
    });

    // Update game store
    gameStore.phase = "playing";

    // FPS counter (debug)
    this.fpsText = this.add
      .text(8, 8, "", {
        fontSize: "12px",
        fontFamily: "monospace",
        color: "#00ff00",
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  update(_time: number, _delta: number): void {
    // 1. Read input
    const actions = this.inputManager.getActions();

    // 2. Apply to local player
    this.localPlayer.applyActions(actions);

    // 3. Send input to server
    if (actions.length > 0) {
      this.localTick++;
      socket.send({
        type: "player_input",
        tick: this.localTick,
        actions,
      });
    }

    // 4. Interpolate remote entities
    this.networkSync.update();

    // 5. Update FPS display
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }

  private handleGameEvent(msg: ServerMessage): void {
    switch (msg.type) {
      case "game_start":
        gameStore.round = msg.round;
        gameStore.phase = "playing";
        break;

      case "player_hit":
        if (msg.player_id === (authStore.player?.id ?? "local")) {
          this.cameras.main.shake(100, 0.005);
          this.localPlayer.setTint(0xff8888);
          this.time.delayedCall(150, () => this.localPlayer.clearTint());
        }
        this.networkSync.handleMessage(msg);
        break;

      case "player_death":
        if (msg.player_id === (authStore.player?.id ?? "local")) {
          this.localPlayer.die();
        }
        this.networkSync.handleMessage(msg);
        break;

      case "player_respawn":
        if (msg.player_id === (authStore.player?.id ?? "local")) {
          this.localPlayer.respawn(msg.x, msg.y);
        }
        this.networkSync.handleMessage(msg);
        break;

      case "round_start_countdown":
        gameStore.phase = "countdown";
        gameStore.countdownSeconds = msg.seconds;
        break;

      default:
        // Forward all other messages to NetworkSync
        this.networkSync.handleMessage(msg);
    }
  }

  /**
   * Build a simple test level with platforms.
   * Replaced by tilemap loading in Phase 3.
   */
  private buildPlaceholderLevel(): void {
    // Background
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    this.platforms = this.physics.add.staticGroup();

    // Ground
    for (let x = 0; x < 1280; x += 32) {
      this.platforms.create(x + 16, 704, "tile_ground");
    }

    // Platforms
    const platformPositions = [
      { x: 300, y: 560, w: 5 },
      { x: 600, y: 440, w: 4 },
      { x: 200, y: 340, w: 3 },
      { x: 800, y: 340, w: 5 },
      { x: 500, y: 240, w: 3 },
      { x: 1000, y: 520, w: 4 },
    ];

    for (const plat of platformPositions) {
      for (let i = 0; i < plat.w; i++) {
        this.platforms.create(plat.x + i * 32, plat.y, "tile_ground");
      }
    }

    // Walls
    for (let y = 0; y < 720; y += 32) {
      this.platforms.create(16, y, "tile_ground"); // Left wall
      this.platforms.create(1264, y, "tile_ground"); // Right wall
    }
  }

  shutdown(): void {
    this.unsubGameEvents?.();
    this.networkSync?.destroy();
    this.inputManager?.destroy();
  }
}
