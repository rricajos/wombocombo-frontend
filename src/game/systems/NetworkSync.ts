import Phaser from "phaser";
import { RemotePlayer } from "../entities/RemotePlayer";
import { Enemy } from "../entities/Enemy";
import { Item } from "../entities/Item";
import { lobbyStore } from "$lib/stores/lobby.svelte";
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
 * Resolves player names from lobbyStore.playerNames.
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

  update(): void {
    this.remotePlayers.forEach((rp) => rp.interpolate());
    this.enemies.forEach((e) => e.interpolate());
  }

  private isSceneReady(): boolean {
    return !!(
      this.scene &&
      this.scene.sys &&
      this.scene.sys.displayList &&
      this.scene.sys.settings.active
    );
  }

  private processGameState(state: ServerGameState): void {
    // Guard: don't process if the scene is not fully initialized or was destroyed
    if (!this.isSceneReady()) {
      return;
    }

    const now = Date.now();

    // ── Remote Players ──
    const activePlayerIds = new Set<string>();
    for (const p of state.players) {
      if (p.id === this.localPlayerId) continue;

      activePlayerIds.add(p.id);

      let remote = this.remotePlayers.get(p.id);
      if (!remote) {
        // Resolve display name from lobby
        const name = lobbyStore.getPlayerName(p.id);
        remote = new RemotePlayer(this.scene, p.x, p.y, p.id, name);
        this.remotePlayers.set(p.id, remote);
      }

      remote.pushState({
        tick: state.tick,
        timestamp: now,
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
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

    // ── Enemies ──
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
      });
      enemy.setHealth(e.health);
    }

    for (const [id, enemy] of this.enemies) {
      if (!activeEnemyIds.has(id)) {
        enemy.destroy();
        this.enemies.delete(id);
      }
    }

    // ── Items ──
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
    if (!this.isSceneReady()) return;
    if (!this.enemies.has(msg.enemy_id)) {
      const enemy = new Enemy(
        this.scene,
        msg.x,
        msg.y,
        msg.enemy_id,
        msg.enemy_type,
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
    if (!this.isSceneReady()) return;
    if (!this.items.has(msg.item_id)) {
      const item = new Item(
        this.scene,
        msg.x,
        msg.y,
        msg.item_id,
        msg.item_type,
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
      remote.setDead();
    }
  }

  private handlePlayerRespawn(msg: ServerPlayerRespawn): void {
    const remote = this.remotePlayers.get(msg.player_id);
    if (remote) {
      remote.setAlive(msg.x, msg.y);
    }
  }

  getRemotePlayer(id: string): RemotePlayer | undefined {
    return this.remotePlayers.get(id);
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
