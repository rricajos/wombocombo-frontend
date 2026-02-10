import Phaser from "phaser";
import { getEnemyConfig } from "../config/enemies";
import { NETWORK } from "../config/physics";

interface EnemySnapshot {
  tick: number;
  timestamp: number;
  x: number;
  y: number;
  state: string;
}

/**
 * Enemy sprite synced from server. Uses same interpolation as RemotePlayer.
 */
export class Enemy extends Phaser.GameObjects.Rectangle {
  enemyId: string;
  enemyType: string;
  private buffer: EnemySnapshot[] = [];
  private healthBar: Phaser.GameObjects.Rectangle;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private maxHealth: number = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyId: string,
    enemyType: string
  ) {
    const config = getEnemyConfig(enemyType);
    super(scene, x, y, config.width, config.height, config.color);

    this.enemyId = enemyId;
    this.enemyType = enemyType;

    scene.add.existing(this);
    this.setDepth(8);

    // Health bar background
    this.healthBarBg = scene.add.rectangle(x, y - config.height / 2 - 6, 28, 4, 0x333333);
    this.healthBarBg.setDepth(8);

    // Health bar fill
    this.healthBar = scene.add.rectangle(x, y - config.height / 2 - 6, 28, 4, 0x00ff00);
    this.healthBar.setDepth(9);
  }

  pushState(snapshot: EnemySnapshot): void {
    this.buffer.push(snapshot);
    if (this.buffer.length > NETWORK.SNAPSHOT_BUFFER_SIZE) {
      this.buffer.shift();
    }
  }

  setHealth(health: number, maxHealth: number = 100): void {
    this.maxHealth = maxHealth;
    const ratio = Math.max(0, health / maxHealth);
    this.healthBar.setScale(ratio, 1);

    // Color: green → yellow → red
    if (ratio > 0.5) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (ratio > 0.25) {
      this.healthBar.setFillStyle(0xffcc00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }

  interpolate(): void {
    if (this.buffer.length < 2) {
      if (this.buffer.length === 1) {
        this.setPosition(this.buffer[0].x, this.buffer[0].y);
      }
      this.updateBarPositions();
      return;
    }

    const renderTime = Date.now() - NETWORK.INTERPOLATION_DELAY;

    let from: EnemySnapshot | null = null;
    let to: EnemySnapshot | null = null;

    for (let i = 0; i < this.buffer.length - 1; i++) {
      if (
        this.buffer[i].timestamp <= renderTime &&
        this.buffer[i + 1].timestamp >= renderTime
      ) {
        from = this.buffer[i];
        to = this.buffer[i + 1];
        break;
      }
    }

    if (from && to) {
      const range = to.timestamp - from.timestamp;
      const t = range > 0 ? (renderTime - from.timestamp) / range : 0;
      const clamped = Math.max(0, Math.min(1, t));
      this.setPosition(
        from.x + (to.x - from.x) * clamped,
        from.y + (to.y - from.y) * clamped
      );
    } else if (this.buffer.length > 0) {
      const latest = this.buffer[this.buffer.length - 1];
      this.setPosition(latest.x, latest.y);
    }

    while (this.buffer.length > 2 && this.buffer[1].timestamp < Date.now() - NETWORK.INTERPOLATION_DELAY) {
      this.buffer.shift();
    }

    this.updateBarPositions();
  }

  private updateBarPositions(): void {
    const config = getEnemyConfig(this.enemyType);
    this.healthBarBg.setPosition(this.x, this.y - config.height / 2 - 6);
    this.healthBar.setPosition(this.x, this.y - config.height / 2 - 6);
  }

  playDeath(scene: Phaser.Scene): void {
    // Simple death flash
    scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 0.2,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }

  destroy(fromScene?: boolean): void {
    this.healthBar?.destroy();
    this.healthBarBg?.destroy();
    super.destroy(fromScene);
  }
}
