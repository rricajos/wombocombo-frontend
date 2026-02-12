import Phaser from "phaser";
import { Player } from "../entities/Player";
import { InputManager } from "../systems/InputManager";
import { NetworkSync } from "../systems/NetworkSync";
import { CameraSystem } from "../systems/Camera";
import { CollisionSystem } from "../systems/Collision";
import { ParticleEffects } from "../systems/ParticleEffects";
import { audioManager } from "../systems/AudioManager";
import { loadMap, getSpawnPoint, type MapDefinition } from "../maps/MapLoader";
import { NETWORK } from "../config/physics";
import { socket } from "$lib/network/socket";
import { onGameEvent, clearGameEventHandlers } from "$lib/network/handler";
import { authStore } from "$lib/stores/auth.svelte";
import { gameStore } from "$lib/stores/game.svelte";
import { lobbyStore } from "$lib/stores/lobby.svelte";
import { settingsStore } from "$lib/stores/settings.svelte";
import type { ServerMessage } from "$lib/network/messages";

/**
 * Main gameplay scene — orchestrates all game systems.
 */
export class GameScene extends Phaser.Scene {
  private localPlayer!: Player;
  private inputManager!: InputManager;
  private networkSync!: NetworkSync;
  private cameraSystem!: CameraSystem;
  private collisionSystem!: CollisionSystem;
  private particles!: ParticleEffects;
  private mapDef!: MapDefinition;

  private localTick: number = 0;
  private inputSendTimer: number = 0;
  private runDustTimer: number = 0;
  private wasOnFloor: boolean = false;

  private unsubGameEvents?: () => void;
  private fpsText?: Phaser.GameObjects.Text;
  private tickText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    const playerId = authStore.player?.id ?? "local";
    const displayName = authStore.player?.display_name ?? "Player";
    const mapId = lobbyStore.room?.map_id ?? "arena_01";

    // ── Load map ──
    this.mapDef = loadMap(mapId);
    this.physics.world.setBounds(0, 0, this.mapDef.width, this.mapDef.height);

    // ── Collision system: build level ──
    this.collisionSystem = new CollisionSystem(this);
    this.collisionSystem.buildArena(this.mapDef.width, this.mapDef.height);
    this.collisionSystem.buildLevel(this.mapDef.platforms);

    // ── Background ──
    this.cameras.main.setBackgroundColor(this.mapDef.bgColor);
    this.addBackgroundDecor();

    // ── Particles ──
    this.particles = new ParticleEffects(this);

    // ── Player ──
    const spawnIdx = lobbyStore.players.findIndex((p) => p.id === playerId);
    const spawn = getSpawnPoint(this.mapDef, Math.max(0, spawnIdx));
    this.localPlayer = new Player(this, spawn.x, spawn.y, displayName);

    // Register player collision
    this.collisionSystem.addPlayerCollision(this.localPlayer);

    // ── Camera ──
    this.cameraSystem = new CameraSystem(this);
    this.cameraSystem.follow(
      this.localPlayer,
      this.mapDef.width,
      this.mapDef.height,
    );
    this.cameraSystem.fadeIn(400);

    // ── Input ──
    this.inputManager = new InputManager(this);

    // ── Network sync ──
    this.networkSync = new NetworkSync(this, playerId);

    // ── Subscribe to server events ──
    // Clear any zombie handlers from a previous session
    clearGameEventHandlers();
    this.unsubGameEvents = onGameEvent((msg: ServerMessage) => {
      this.handleGameEvent(msg);
    });

    // ── Launch UI overlay scene ──
    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    // ── Game state ──
    gameStore.phase = "playing";
    this.wasOnFloor = false;

    // ── Debug text ──
    this.fpsText = this.add
      .text(8, 8, "", {
        fontSize: "10px",
        fontFamily: "monospace",
        color: "#33cc33",
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.tickText = this.add
      .text(8, 22, "", {
        fontSize: "10px",
        fontFamily: "monospace",
        color: "#888",
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  update(_time: number, delta: number): void {
    // ── 1. Input ──
    const actions = this.inputManager.getActions();

    // ── 2. Apply to local player ──
    this.localPlayer.applyActions(actions);

    // ── 3. Landing detection (for dust + sfx) ──
    const body = this.localPlayer.body as Phaser.Physics.Arcade.Body;
    const onFloor = body.onFloor();
    if (onFloor && !this.wasOnFloor && body.velocity.y >= 0) {
      this.particles.landingDust(this.localPlayer.x, this.localPlayer.y + 14);
      audioManager.playSFX("land");
    }
    this.wasOnFloor = onFloor;

    // ── 4. Running dust ──
    if (onFloor && Math.abs(body.velocity.x) > 80) {
      this.runDustTimer += delta;
      if (this.runDustTimer > 120) {
        this.runDustTimer = 0;
        this.particles.runDust(this.localPlayer.x, this.localPlayer.y);
      }
    } else {
      this.runDustTimer = 0;
    }

    // ── 5. Jump SFX ──
    if (actions.includes("jump") && onFloor) {
      audioManager.playSFX("jump");
    }

    // ── 6. Send input at ~20Hz ──
    this.inputSendTimer += delta;
    if (this.inputSendTimer >= NETWORK.INPUT_SEND_RATE_MS) {
      this.inputSendTimer = 0;
      this.localTick++;
      socket.send({
        type: "player_input",
        tick: this.localTick,
        actions,
      });
    }

    // ── 7. Interpolate remote entities ──
    this.networkSync.update();

    // ── 8. Debug display ──
    if (settingsStore.showFPS) {
      this.fpsText
        ?.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`)
        .setVisible(true);
      this.tickText
        ?.setText(`Tick: ${this.localTick} | Srv: ${gameStore.serverTick}`)
        .setVisible(true);
    } else {
      this.fpsText?.setVisible(false);
      this.tickText?.setVisible(false);
    }
  }

  // ── Server Event Handling ────────────────────────
  private handleGameEvent(msg: ServerMessage): void {
    const myId = authStore.player?.id ?? "local";

    switch (msg.type) {
      case "game_start":
        gameStore.round = msg.round;
        gameStore.phase = "playing";
        audioManager.playSFX("round_start");
        this.events.emit("ui:roundStart");
        break;

      case "player_hit":
        if (msg.player_id === myId) {
          this.cameraSystem.shake();
          this.localPlayer.flashDamage();
          this.particles.hitSparks(this.localPlayer.x, this.localPlayer.y);
          audioManager.playSFX("hit");
          this.events.emit("ui:damage");
        } else {
          // Hit effect on remote player
          const remote = this.networkSync.getRemotePlayer(msg.player_id);
          if (remote) {
            this.particles.hitSparks(remote.x, remote.y);
          }
        }
        this.networkSync.handleMessage(msg);
        break;

      case "player_death":
        if (msg.player_id === myId) {
          this.localPlayer.die();
          this.cameraSystem.zoomOut();
          this.particles.deathExplosion(this.localPlayer.x, this.localPlayer.y);
          audioManager.playSFX("death");
        } else {
          const remote = this.networkSync.getRemotePlayer(msg.player_id);
          if (remote) {
            this.particles.deathExplosion(remote.x, remote.y);
          }
        }
        this.networkSync.handleMessage(msg);
        break;

      case "player_respawn":
        if (msg.player_id === myId) {
          this.localPlayer.respawn(msg.x, msg.y);
          this.cameraSystem.zoomReset();
          this.particles.spawnFlash(msg.x, msg.y);
        } else {
          const remote = this.networkSync.getRemotePlayer(msg.player_id);
          if (remote) {
            this.particles.spawnFlash(msg.x, msg.y);
          }
        }
        this.networkSync.handleMessage(msg);
        break;

      case "enemy_death": {
        // Particles at enemy location before NetworkSync removes it
        const enemy = this.networkSync["enemies"]?.get(msg.enemy_id);
        if (enemy) {
          this.particles.deathExplosion(enemy.x, enemy.y, "particle_green");
          audioManager.playSFX("enemy_death");
        }
        this.networkSync.handleMessage(msg);
        break;
      }

      case "item_pickup": {
        const item = this.networkSync["items"]?.get(msg.item_id);
        if (item) {
          this.particles.pickupSparkle(item.x, item.y);
        }
        if (msg.player_id === myId) {
          audioManager.playSFX("pickup");
        }
        this.networkSync.handleMessage(msg);
        break;
      }

      case "round_start_countdown":
        gameStore.phase = "countdown";
        gameStore.countdownSeconds = msg.seconds;
        if (msg.seconds > 0) {
          audioManager.playSFX("countdown_tick");
        }
        break;

      default:
        this.networkSync.handleMessage(msg);
    }
  }

  // ── Background decoration ──
  private addBackgroundDecor(): void {
    // Subtle grid lines
    const gfx = this.add.graphics();
    gfx.lineStyle(1, 0xffffff, 0.02);
    for (let x = 0; x <= this.mapDef.width; x += 64) {
      gfx.moveTo(x, 0);
      gfx.lineTo(x, this.mapDef.height);
    }
    for (let y = 0; y <= this.mapDef.height; y += 64) {
      gfx.moveTo(0, y);
      gfx.lineTo(this.mapDef.width, y);
    }
    gfx.strokePath();
    gfx.setDepth(0);

    // Floating background particles (atmosphere)
    for (let i = 0; i < 15; i++) {
      const px = Phaser.Math.Between(50, this.mapDef.width - 50);
      const py = Phaser.Math.Between(50, this.mapDef.height - 100);
      const dot = this.add.circle(
        px,
        py,
        Phaser.Math.Between(1, 2),
        0xffffff,
        0.08,
      );
      dot.setDepth(1);
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(20, 60),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
      });
    }
  }

  shutdown(): void {
    this.unsubGameEvents?.();
    clearGameEventHandlers();
    this.networkSync?.destroy();
    this.inputManager?.destroy();
    this.collisionSystem?.destroy();
    this.cameraSystem?.destroy();
    this.particles?.destroy();
    this.scene.stop("UIScene");
  }
}
