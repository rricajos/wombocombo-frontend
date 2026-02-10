import Phaser from "phaser";
import { PHYSICS } from "../config/physics";

/**
 * Local player sprite with client-side physics and name label.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private isDead: boolean = false;
  private nameText: Phaser.GameObjects.Text;
  private invulnerable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, displayName: string) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PHYSICS.PLAYER_WIDTH, PHYSICS.PLAYER_HEIGHT);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(PHYSICS.PLAYER_SPEED, PHYSICS.PLAYER_MAX_FALL);
    body.setGravityY(PHYSICS.GRAVITY);

    this.setDepth(10);

    // Name label
    this.nameText = scene.add.text(x, y - 24, displayName, {
      fontSize: "10px",
      fontFamily: "'Press Start 2P', monospace",
      color: "#66bbff",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(12);
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

    // Update name position
    this.nameText.setPosition(this.x, this.y - 24);
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

  flashDamage(): void {
    if (this.invulnerable) return;
    this.invulnerable = true;
    this.setTint(0xff8888);

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.setAlpha(1);
        this.clearTint();
        this.invulnerable = false;
      },
    });
  }

  die(): void {
    this.isDead = true;
    this.setTint(0xff0000);
    this.setAlpha(0.4);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.nameText.setAlpha(0.3);
  }

  respawn(x: number, y: number): void {
    this.isDead = false;
    this.setPosition(x, y);
    this.clearTint();
    this.setAlpha(1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setVelocity(0, 0);
    this.nameText.setAlpha(1);

    // Spawn flash
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 500,
      ease: "Sine.easeOut",
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    // Keep name above head
    this.nameText.setPosition(this.x, this.y - 24);
  }

  destroy(fromScene?: boolean): void {
    this.nameText?.destroy();
    super.destroy(fromScene);
  }
}
