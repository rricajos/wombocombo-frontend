import Phaser from "phaser";
import { RemotePlayer } from "../entities/RemotePlayer";
import { Enemy } from "../entities/Enemy";
import { Item } from "../entities/Item";
import type {
  ServerMessage,
  ServerGameState,
  ServerEnemySpawn,
  ServerEnemyDeath,
  ServerItemSpawn,
  ServerItemPickup,
  ServerPlayerRespawn,
  ServerPlayerDeath,
} from "$lib/network/messages";

/**
 * Manages all remote entities (remote players, enemies, items).
 * Receives server messages and creates/updates/destroys entities accordingly.
 */
export class NetworkSync {
  private scene: Phaser.Scene;
  private localPlayerId: string;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private enemies: Map<string, Enemy> = new Map();
  private items: Map<string, Item> = new Map();

  constructor(scene: Phaser.Scene, localPlayerId: string) {
    this.scene = scene;
    this.localPlayerId = localPlayerId;
  }

  /**
   * Handle incoming server message. Called from the game event handler.
   */
  handleMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case "game_state":
        this.processGameState(msg);
        break;
      case "enemy_spawn":
        this.spawnEnemy(msg);
        break;
      case "enemy_death":
        this.killEnemy(msg);
        break;
      case "item_spawn":
        this.spawnItem(msg);
        break;
      case "item_pickup":
        this.pickupItem(msg);
        break;
      case "player_death":
        this.handlePlayerDeath(msg);
        break;
      case "player_respawn":
        this.handlePlayerRespawn(msg);
        break;
    }
  }

  /**
   * Called every Phaser frame to run interpolation on all remote entities.
   */
  update(): void {
    this.remotePlayers.forEach((rp) => rp.interpolate());
    this.enemies.forEach((e) => e.interpolate());
  }

  private processGameState(state: ServerGameState): void {
    const now = Date.now();

    // Update remote players
    const activePlayerIds = new Set<string>();
    for (const p of state.players) {
      if (p.id === this.localPlayerId) continue; // Skip self

      activePlayerIds.add(p.id);

      let remote = this.remotePlayers.get(p.id);
      if (!remote) {
        // New player — create sprite
        remote = new RemotePlayer(this.scene, p.x, p.y, p.id, p.id);
        this.remotePlayers.set(p.id, remote);
      }

      remote.pushState({
        tick: state.tick,
        timestamp: now,
        x: p.x,
        y: p.y,
        state: p.state,
        facing: p.facing,
      });
    }

    // Remove disconnected players
    for (const [id, rp] of this.remotePlayers) {
      if (!activePlayerIds.has(id)) {
        rp.destroy();
        this.remotePlayers.delete(id);
      }
    }

    // Update enemies
    const activeEnemyIds = new Set<string>();
    for (const e of state.enemies) {
      activeEnemyIds.add(e.id);

      let enemy = this.enemies.get(e.id);
      if (!enemy) {
        enemy = new Enemy(this.scene, e.x, e.y, e.id, e.type);
        this.enemies.set(e.id, enemy);
      }

      enemy.pushState({
        tick: state.tick,
        timestamp: now,
        x: e.x,
        y: e.y,
        state: e.state,
        facing: "right",
      });
      enemy.setHealth(e.health);
    }

    // Remove dead enemies not explicitly killed
    for (const [id, enemy] of this.enemies) {
      if (!activeEnemyIds.has(id)) {
        enemy.destroy();
        this.enemies.delete(id);
      }
    }

    // Update items
    const activeItemIds = new Set<string>();
    for (const item of state.items) {
      activeItemIds.add(item.id);

      if (!this.items.has(item.id)) {
        const i = new Item(this.scene, item.x, item.y, item.id, item.type);
        this.items.set(item.id, i);
      }
    }

    for (const [id, item] of this.items) {
      if (!activeItemIds.has(id)) {
        item.destroy();
        this.items.delete(id);
      }
    }
  }

  private spawnEnemy(msg: ServerEnemySpawn): void {
    if (!this.enemies.has(msg.enemy_id)) {
      const enemy = new Enemy(
        this.scene,
        msg.x,
        msg.y,
        msg.enemy_id,
        msg.enemy_type
      );
      this.enemies.set(msg.enemy_id, enemy);
    }
  }

  private killEnemy(msg: ServerEnemyDeath): void {
    const enemy = this.enemies.get(msg.enemy_id);
    if (enemy) {
      enemy.playDeath(this.scene);
      this.enemies.delete(msg.enemy_id);
    }
  }

  private spawnItem(msg: ServerItemSpawn): void {
    if (!this.items.has(msg.item_id)) {
      const item = new Item(
        this.scene,
        msg.x,
        msg.y,
        msg.item_id,
        msg.item_type
      );
      this.items.set(msg.item_id, item);
    }
  }

  private pickupItem(msg: ServerItemPickup): void {
    const item = this.items.get(msg.item_id);
    if (item) {
      item.playPickup(this.scene);
      this.items.delete(msg.item_id);
    }
  }

  private handlePlayerDeath(msg: ServerPlayerDeath): void {
    const remote = this.remotePlayers.get(msg.player_id);
    if (remote) {
      remote.setTint(0xff0000);
      remote.setAlpha(0.3);
    }
  }

  private handlePlayerRespawn(msg: ServerPlayerRespawn): void {
    const remote = this.remotePlayers.get(msg.player_id);
    if (remote) {
      remote.clearTint();
      remote.setAlpha(0.9);
      remote.setPosition(msg.x, msg.y);
    }
  }

  destroy(): void {
    this.remotePlayers.forEach((rp) => rp.destroy());
    this.enemies.forEach((e) => e.destroy());
    this.items.forEach((i) => i.destroy());
    this.remotePlayers.clear();
    this.enemies.clear();
    this.items.clear();
  }
}
