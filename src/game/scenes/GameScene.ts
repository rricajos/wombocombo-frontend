import Phaser from "phaser";
import { Player } from "../entities/Player";
import { InputManager } from "../systems/InputManager";
import { NetworkSync } from "../systems/NetworkSync";
import { socket } from "$lib/network/socket";
import { onGameEvent } from "$lib/network/handler";
import { authStore } from "$lib/stores/auth.svelte";
import { gameStore } from "$lib/stores/game.svelte";
import { settingsStore } from "$lib/stores/settings.svelte";
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
  private tickText?: Phaser.GameObjects.Text;
  private inputSendTimer: number = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    const playerId = authStore.player?.id ?? "local";
    const displayName = authStore.player?.display_name ?? "Player";

    // World bounds
    this.physics.world.setBounds(0, 0, 1280, 720);

    // Build placeholder level
    this.buildPlaceholderLevel();

    // Create local player with name
    const spawnX = 200 + Math.random() * 200;
    const spawnY = 500;
    this.localPlayer = new Player(this, spawnX, spawnY, displayName);

    // Collide player with platforms
    this.physics.add.collider(this.localPlayer, this.platforms);

    // Camera follows player
    this.cameras.main.startFollow(this.localPlayer, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 1280, 720);
    this.cameras.main.setDeadzone(80, 40);

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

    // Debug text
    this.fpsText = this.add
      .text(8, 8, "", { fontSize: "10px", fontFamily: "monospace", color: "#33cc33" })
      .setScrollFactor(0)
      .setDepth(100);

    this.tickText = this.add
      .text(8, 22, "", { fontSize: "10px", fontFamily: "monospace", color: "#888888" })
      .setScrollFactor(0)
      .setDepth(100);
  }

  update(_time: number, delta: number): void {
    // 1. Read input
    const actions = this.inputManager.getActions();

    // 2. Apply to local player (client-side authority)
    this.localPlayer.applyActions(actions);

    // 3. Send input to server at ~20Hz (every 50ms), not every frame
    this.inputSendTimer += delta;
    if (this.inputSendTimer >= 50) {
      this.inputSendTimer = 0;
      this.localTick++;

      // Always send tick, even if no actions (server needs heartbeat)
      socket.send({
        type: "player_input",
        tick: this.localTick,
        actions,
      });
    }

    // 4. Interpolate remote entities
    this.networkSync.update();

    // 5. Debug display
    if (settingsStore.showFPS) {
      this.fpsText?.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
      this.fpsText?.setVisible(true);
      this.tickText?.setText(`Tick: ${this.localTick} | Server: ${gameStore.serverTick}`);
      this.tickText?.setVisible(true);
    } else {
      this.fpsText?.setVisible(false);
      this.tickText?.setVisible(false);
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
          this.cameras.main.shake(120, 0.006);
          this.localPlayer.flashDamage();
        }
        this.networkSync.handleMessage(msg);
        break;

      case "player_death":
        if (msg.player_id === (authStore.player?.id ?? "local")) {
          this.localPlayer.die();
          // Zoom out slightly on death to see more
          this.cameras.main.zoomTo(0.9, 500);
        }
        this.networkSync.handleMessage(msg);
        break;

      case "player_respawn":
        if (msg.player_id === (authStore.player?.id ?? "local")) {
          this.localPlayer.respawn(msg.x, msg.y);
          this.cameras.main.zoomTo(1, 300);
        }
        this.networkSync.handleMessage(msg);
        break;

      case "round_start_countdown":
        gameStore.phase = "countdown";
        gameStore.countdownSeconds = msg.seconds;
        break;

      default:
        this.networkSync.handleMessage(msg);
    }
  }

  /**
   * Placeholder level with platforms.
   */
  private buildPlaceholderLevel(): void {
    this.cameras.main.setBackgroundColor(0x12122a);

    this.platforms = this.physics.add.staticGroup();

    // Ground
    for (let x = 0; x < 1280; x += 32) {
      this.platforms.create(x + 16, 704, "tile_ground");
    }

    // Platforms — designed for fun movement
    const platformPositions = [
      // Lower platforms
      { x: 160, y: 600, w: 4 },
      { x: 500, y: 580, w: 3 },
      { x: 900, y: 600, w: 4 },

      // Mid platforms
      { x: 300, y: 480, w: 5 },
      { x: 700, y: 460, w: 4 },
      { x: 1050, y: 490, w: 3 },

      // Upper platforms
      { x: 150, y: 350, w: 3 },
      { x: 480, y: 340, w: 4 },
      { x: 800, y: 330, w: 5 },

      // Top platforms
      { x: 350, y: 220, w: 3 },
      { x: 650, y: 200, w: 3 },
      { x: 950, y: 240, w: 2 },
    ];

    for (const plat of platformPositions) {
      for (let i = 0; i < plat.w; i++) {
        this.platforms.create(plat.x + i * 32, plat.y, "tile_ground");
      }
    }

    // Walls
    for (let y = 0; y < 720; y += 32) {
      this.platforms.create(16, y, "tile_ground");
      this.platforms.create(1264, y, "tile_ground");
    }
  }

  shutdown(): void {
    this.unsubGameEvents?.();
    this.networkSync?.destroy();
    this.inputManager?.destroy();
  }
}
