import Phaser from "phaser";
import { PHYSICS } from "../config/physics";
import { NETWORK } from "../config/physics";

export interface StateSnapshot {
  tick: number;
  timestamp: number;
  x: number;
  y: number;
  state: string;
  facing: string;
}

/**
 * Remote player sprite with interpolation.
 * Receives positions from server and smoothly interpolates between them.
 */
export class RemotePlayer extends Phaser.GameObjects.Sprite {
  playerId: string;
  private buffer: StateSnapshot[] = [];
  private nameText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: string,
    displayName: string
  ) {
    super(scene, x, y, "player");
    this.playerId = playerId;

    scene.add.existing(this);
    this.setDepth(9);
    this.setAlpha(0.9);

    // Name label above head
    this.nameText = scene.add.text(x, y - 24, displayName, {
      fontSize: "10px",
      fontFamily: "Press Start 2P",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(11);
  }

  /**
   * Push a new snapshot from the server into the interpolation buffer.
   */
  pushState(snapshot: StateSnapshot): void {
    this.buffer.push(snapshot);
    // Keep buffer size limited
    if (this.buffer.length > NETWORK.SNAPSHOT_BUFFER_SIZE) {
      this.buffer.shift();
    }
  }

  /**
   * Called every frame. Interpolates position from buffered snapshots.
   */
  interpolate(): void {
    if (this.buffer.length < 2) {
      // Not enough data to interpolate — snap to latest
      if (this.buffer.length === 1) {
        this.setPosition(this.buffer[0].x, this.buffer[0].y);
        this.updateVisuals(this.buffer[0]);
      }
      return;
    }

    const renderTime = Date.now() - NETWORK.INTERPOLATION_DELAY;

    // Find the two snapshots we're between
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

      const x = from.x + (to.x - from.x) * clamped;
      const y = from.y + (to.y - from.y) * clamped;

      this.setPosition(x, y);
      this.updateVisuals(to);
    } else if (this.buffer.length > 0) {
      // Extrapolate from latest snapshot
      const latest = this.buffer[this.buffer.length - 1];
      this.setPosition(latest.x, latest.y);
      this.updateVisuals(latest);
    }

    // Clean old snapshots
    while (
      this.buffer.length > 2 &&
      this.buffer[1].timestamp < renderTime
    ) {
      this.buffer.shift();
    }
  }

  private updateVisuals(snapshot: StateSnapshot): void {
    // Facing direction
    this.setFlipX(snapshot.facing === "left");

    // Name position follows sprite
    this.nameText.setPosition(this.x, this.y - 24);

    // State-based tint (placeholder — real animations in Phase 3)
    switch (snapshot.state) {
      case "dead":
        this.setTint(0xff0000);
        this.setAlpha(0.3);
        break;
      case "jumping":
      case "falling":
        this.clearTint();
        this.setAlpha(0.9);
        break;
      default:
        this.clearTint();
        this.setAlpha(0.9);
    }
  }

  destroy(fromScene?: boolean): void {
    this.nameText?.destroy();
    super.destroy(fromScene);
  }
}
