import Phaser from "phaser";
import { NETWORK } from "../config/physics";
import { ENEMY_VISUAL_CONFIG } from "../config/enemies";

interface EnemySnapshot {
  tick: number;
  timestamp: number;
  x: number;
  y: number;
  state: string;
}

/**
 * Server-synced enemy with interpolation and health bar.
 */
export class Enemy extends Phaser.GameObjects.Container {
  enemyId: string;
  enemyType: string;
  private sprite: Phaser.GameObjects.Rectangle;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private buffer: EnemySnapshot[] = [];
  private maxHealth: number = 100;
  private currentHealth: number = 100;
  private targetX: number;
  private targetY: number;
  private isDead: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyId: string,
    enemyType: string
  ) {
    super(scene, x, y);
    this.enemyId = enemyId;
    this.enemyType = enemyType;
    this.targetX = x;
    this.targetY = y;

    const config = ENEMY_VISUAL_CONFIG[enemyType] ?? ENEMY_VISUAL_CONFIG.slime;

    // Sprite (colored rectangle based on type)
    this.sprite = scene.add.rectangle(0, 0, config.width, config.height, config.color);
    this.add(this.sprite);

    // Health bar background
    this.healthBarBg = scene.add.rectangle(0, -(config.height / 2 + 8), 30, 4, 0x333333);
    this.add(this.healthBarBg);

    // Health bar fill
    this.healthBarFill = scene.add.rectangle(0, -(config.height / 2 + 8), 30, 4, 0x44cc44);
    this.add(this.healthBarFill);

    // Enemy type label
    this.nameText = scene.add.text(0, -(config.height / 2 + 16), enemyType, {
      fontSize: "8px",
      fontFamily: "'Press Start 2P', monospace",
      color: "#cc6666",
      stroke: "#000",
      strokeThickness: 2,
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);

    scene.add.existing(this);
    this.setDepth(8);

    // Spawn animation
    this.setAlpha(0);
    this.setScale(0.3);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  pushState(snapshot: EnemySnapshot): void {
    this.buffer.push(snapshot);
    if (this.buffer.length > NETWORK.SNAPSHOT_BUFFER_SIZE) {
      this.buffer.shift();
    }
  }

  interpolate(): void {
    if (this.isDead) return;

    if (this.buffer.length < 2) {
      if (this.buffer.length === 1) {
        this.targetX = this.buffer[0].x;
        this.targetY = this.buffer[0].y;
      }
      this.setPosition(
        Phaser.Math.Linear(this.x, this.targetX, 0.2),
        Phaser.Math.Linear(this.y, this.targetY, 0.2)
      );
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
      const t = range > 0 ? Math.min(1, Math.max(0, (renderTime - from.timestamp) / range)) : 0;
      this.targetX = from.x + (to.x - from.x) * t;
      this.targetY = from.y + (to.y - from.y) * t;

      // Flip based on movement direction
      if (to.x > from.x) this.sprite.setScale(1, 1);
      else if (to.x < from.x) this.sprite.setScale(-1, 1);
    } else if (this.buffer.length > 0) {
      const latest = this.buffer[this.buffer.length - 1];
      this.targetX = latest.x;
      this.targetY = latest.y;
    }

    this.setPosition(
      Phaser.Math.Linear(this.x, this.targetX, 0.25),
      Phaser.Math.Linear(this.y, this.targetY, 0.25)
    );

    // Prune old snapshots
    while (this.buffer.length > 2 && this.buffer[1].timestamp < renderTime) {
      this.buffer.shift();
    }
  }

  setHealth(health: number): void {
    this.currentHealth = health;
    const ratio = Math.max(0, health / this.maxHealth);
    this.healthBarFill.width = 30 * ratio;

    // Color: green → yellow → red
    if (ratio > 0.5) {
      this.healthBarFill.fillColor = 0x44cc44;
    } else if (ratio > 0.25) {
      this.healthBarFill.fillColor = 0xccaa00;
    } else {
      this.healthBarFill.fillColor = 0xcc3333;
    }

    // Flash red on damage
    if (ratio < 1) {
      this.sprite.fillColor = 0xff6666;
      this.scene.time.delayedCall(100, () => {
        if (!this.isDead) {
          const config = ENEMY_VISUAL_CONFIG[this.enemyType] ?? ENEMY_VISUAL_CONFIG.slime;
          this.sprite.fillColor = config.color;
        }
      });
    }
  }

  playDeath(scene: Phaser.Scene): void {
    this.isDead = true;

    scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 0.2,
      y: this.y + 10,
      duration: 300,
      ease: "Sine.easeIn",
      onComplete: () => this.destroy(),
    });
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
