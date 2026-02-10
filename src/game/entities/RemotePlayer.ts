import Phaser from "phaser";
import { NETWORK } from "../config/physics";

export interface StateSnapshot {
  tick: number;
  timestamp: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: string;
  facing: string;
}

/**
 * Remote player sprite with interpolation.
 * Receives positions from server and smoothly interpolates between them.
 */
export class RemotePlayer extends Phaser.GameObjects.Sprite {
  playerId: string;
  displayName: string;
  private buffer: StateSnapshot[] = [];
  private nameText: Phaser.GameObjects.Text;
  private isDead: boolean = false;
  private targetX: number;
  private targetY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: string,
    displayName: string
  ) {
    super(scene, x, y, "player");
    this.playerId = playerId;
    this.displayName = displayName;
    this.targetX = x;
    this.targetY = y;

    scene.add.existing(this);
    this.setDepth(9);
    this.setAlpha(0.9);

    // Slightly different tint to distinguish from local player
    this.setTint(0xddddff);

    // Name label
    this.nameText = scene.add.text(x, y - 24, displayName, {
      fontSize: "10px",
      fontFamily: "'Press Start 2P', monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(11);

    // Spawn animation
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 0.9,
      duration: 300,
      ease: "Sine.easeOut",
    });
  }

  pushState(snapshot: StateSnapshot): void {
    this.buffer.push(snapshot);
    if (this.buffer.length > NETWORK.SNAPSHOT_BUFFER_SIZE) {
      this.buffer.shift();
    }
  }

  interpolate(): void {
    if (this.buffer.length < 2) {
      if (this.buffer.length === 1) {
        this.targetX = this.buffer[0].x;
        this.targetY = this.buffer[0].y;
        this.updateVisuals(this.buffer[0]);
      }
      // Smooth snap for single-snapshot case
      this.setPosition(
        Phaser.Math.Linear(this.x, this.targetX, 0.2),
        Phaser.Math.Linear(this.y, this.targetY, 0.2)
      );
      this.nameText.setPosition(this.x, this.y - 24);
      return;
    }

    const renderTime = Date.now() - NETWORK.INTERPOLATION_DELAY;

    let from: StateSnapshot | null = null;
    let to: StateSnapshot | null = null;

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

      this.targetX = from.x + (to.x - from.x) * clamped;
      this.targetY = from.y + (to.y - from.y) * clamped;
      this.updateVisuals(to);
    } else if (this.buffer.length > 0) {
      // Extrapolate slightly from latest snapshot
      const latest = this.buffer[this.buffer.length - 1];
      const age = (Date.now() - latest.timestamp) / 1000;
      this.targetX = latest.x + latest.vx * Math.min(age, 0.1);
      this.targetY = latest.y + latest.vy * Math.min(age, 0.1);
      this.updateVisuals(latest);
    }

    // Smooth movement (prevents micro-jitter)
    this.setPosition(
      Phaser.Math.Linear(this.x, this.targetX, 0.3),
      Phaser.Math.Linear(this.y, this.targetY, 0.3)
    );

    // Name follows
    this.nameText.setPosition(this.x, this.y - 24);

    // Prune old snapshots
    while (
      this.buffer.length > 2 &&
      this.buffer[1].timestamp < renderTime
    ) {
      this.buffer.shift();
    }
  }

  private updateVisuals(snapshot: StateSnapshot): void {
    this.setFlipX(snapshot.facing === "left");

    switch (snapshot.state) {
      case "dead":
        if (!this.isDead) {
          this.isDead = true;
          this.setTint(0xff0000);
          this.setAlpha(0.3);
          this.nameText.setAlpha(0.3);
        }
        break;
      case "jumping":
        if (this.isDead) this.revive();
        this.setTint(0xccccff);
        break;
      case "falling":
        if (this.isDead) this.revive();
        this.setTint(0xccccff);
        break;
      default:
        if (this.isDead) this.revive();
        this.setTint(0xddddff);
        break;
    }
  }

  private revive(): void {
    this.isDead = false;
    this.setAlpha(0.9);
    this.nameText.setAlpha(1);
  }

  setDead(): void {
    this.isDead = true;
    this.setTint(0xff0000);
    this.setAlpha(0.3);
    this.nameText.setAlpha(0.3);
  }

  setAlive(x: number, y: number): void {
    this.isDead = false;
    this.setPosition(x, y);
    this.clearTint();
    this.setTint(0xddddff);
    this.setAlpha(0.9);
    this.nameText.setAlpha(1);

    // Flash
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.2, to: 0.9 },
      duration: 400,
    });
  }

  destroy(fromScene?: boolean): void {
    this.nameText?.destroy();
    super.destroy(fromScene);
  }
}
