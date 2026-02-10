import Phaser from "phaser";

/**
 * Manages all visual particle effects in the game scene.
 */
export class ParticleEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Burst when player takes damage.
   */
  hitSparks(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, "particle_red", {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 350,
      quantity: 8,
      emitting: false,
    });
    particles.setDepth(20);
    particles.explode(8);
    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  /**
   * Explosion when an entity dies.
   */
  deathExplosion(x: number, y: number, color: string = "particle_red"): void {
    const particles = this.scene.add.particles(x, y, color, {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 600,
      quantity: 16,
      gravityY: 200,
      emitting: false,
    });
    particles.setDepth(20);
    particles.explode(16);
    this.scene.time.delayedCall(800, () => particles.destroy());
  }

  /**
   * Sparkle effect for item pickups.
   */
  pickupSparkle(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, "particle_yellow", {
      speed: { min: 30, max: 80 },
      angle: { min: 220, max: 320 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 6,
      emitting: false,
    });
    particles.setDepth(20);
    particles.explode(6);
    this.scene.time.delayedCall(600, () => particles.destroy());
  }

  /**
   * Small dust puff when landing on ground.
   */
  landingDust(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, "particle_white", {
      speed: { min: 10, max: 40 },
      angle: { min: 160, max: 200 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 250,
      quantity: 4,
      emitting: false,
    });
    particles.setDepth(5);
    particles.explode(4);
    this.scene.time.delayedCall(400, () => particles.destroy());
  }

  /**
   * Running dust trail behind player.
   */
  runDust(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y + 12, "particle_white", {
      speed: { min: 5, max: 15 },
      angle: { min: 170, max: 190 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 200,
      quantity: 1,
      emitting: false,
    });
    particles.setDepth(4);
    particles.explode(1);
    this.scene.time.delayedCall(300, () => particles.destroy());
  }

  /**
   * Spawn flash effect.
   */
  spawnFlash(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, "particle_blue", {
      speed: { min: 40, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 500,
      quantity: 12,
      emitting: false,
    });
    particles.setDepth(20);
    particles.explode(12);
    this.scene.time.delayedCall(700, () => particles.destroy());
  }

  /**
   * Coin burst on gold pickup or purchase.
   */
  coinBurst(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, "particle_yellow", {
      speed: { min: 50, max: 120 },
      angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 },
      lifespan: 500,
      gravityY: 150,
      quantity: 8,
      emitting: false,
    });
    particles.setDepth(20);
    particles.explode(8);
    this.scene.time.delayedCall(700, () => particles.destroy());
  }

  destroy(): void {
    // Cleanup is handled by delayedCall destroys
  }
}
