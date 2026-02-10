import Phaser from "phaser";
import { PHYSICS } from "../config/physics";

/**
 * Local player sprite with client-side physics.
 * We simulate locally for responsiveness and send inputs to server.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PHYSICS.PLAYER_WIDTH, PHYSICS.PLAYER_HEIGHT);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(PHYSICS.PLAYER_SPEED, PHYSICS.PLAYER_MAX_FALL);
    body.setGravityY(PHYSICS.GRAVITY);

    this.setDepth(10);
  }

  applyActions(actions: string[]): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Horizontal movement
    if (actions.includes("left")) {
      body.setVelocityX(-PHYSICS.PLAYER_SPEED);
      this.setFlipX(true);
    } else if (actions.includes("right")) {
      body.setVelocityX(PHYSICS.PLAYER_SPEED);
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Jump (only if on floor)
    if (actions.includes("jump") && body.onFloor()) {
      body.setVelocityY(PHYSICS.PLAYER_JUMP);
    }

    // Crouch
    if (actions.includes("crouch")) {
      body.setSize(PHYSICS.PLAYER_WIDTH, PHYSICS.PLAYER_HEIGHT * 0.6);
    } else {
      body.setSize(PHYSICS.PLAYER_WIDTH, PHYSICS.PLAYER_HEIGHT);
    }
  }

  getState(): string {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.isDead) return "dead";
    if (!body.onFloor() && body.velocity.y < 0) return "jumping";
    if (!body.onFloor() && body.velocity.y > 0) return "falling";
    if (Math.abs(body.velocity.x) > 10) return "running";
    return "idle";
  }

  getFacing(): "left" | "right" {
    return this.flipX ? "left" : "right";
  }

  die(): void {
    this.isDead = true;
    this.setTint(0xff0000);
    this.setAlpha(0.5);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  }

  respawn(x: number, y: number): void {
    this.isDead = false;
    this.setPosition(x, y);
    this.clearTint();
    this.setAlpha(1);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
