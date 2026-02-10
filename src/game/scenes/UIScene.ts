import Phaser from "phaser";

/**
 * UI overlay scene — runs on top of GameScene.
 * Handles full-screen visual effects: damage vignette, transition, flash.
 */
export class UIScene extends Phaser.Scene {
  private vignette!: Phaser.GameObjects.Graphics;
  private vignetteAlpha: number = 0;
  private flashRect!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Damage vignette (red edges)
    this.vignette = this.add.graphics();
    this.vignette.setScrollFactor(0);
    this.vignette.setDepth(100);
    this.vignette.setAlpha(0);
    this.drawVignette(width, height);

    // Full-screen flash
    this.flashRect = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0);
    this.flashRect.setScrollFactor(0);
    this.flashRect.setDepth(101);

    // Listen for events from GameScene
    this.scene.get("GameScene")?.events?.on("ui:damage", this.showDamageVignette, this);
    this.scene.get("GameScene")?.events?.on("ui:flash", this.showFlash, this);
    this.scene.get("GameScene")?.events?.on("ui:roundStart", this.roundStartEffect, this);
  }

  private drawVignette(w: number, h: number): void {
    this.vignette.clear();
    // Red gradient from edges
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const alpha = 0.15 * (1 - i / steps);
      const inset = i * 20;
      this.vignette.lineStyle(20, 0xff0000, alpha);
      this.vignette.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
    }
  }

  showDamageVignette(): void {
    this.vignetteAlpha = 0.8;
    this.vignette.setAlpha(this.vignetteAlpha);

    this.tweens.add({
      targets: this,
      vignetteAlpha: 0,
      duration: 600,
      ease: "Sine.easeOut",
      onUpdate: () => {
        this.vignette.setAlpha(this.vignetteAlpha);
      },
    });
  }

  showFlash(color: number = 0xffffff, duration: number = 150): void {
    this.flashRect.fillColor = color;
    this.flashRect.setAlpha(0.4);

    this.tweens.add({
      targets: this.flashRect,
      alpha: 0,
      duration,
      ease: "Sine.easeOut",
    });
  }

  roundStartEffect(): void {
    this.showFlash(0xffffff, 300);
  }

  shutdown(): void {
    this.scene.get("GameScene")?.events?.off("ui:damage", this.showDamageVignette, this);
    this.scene.get("GameScene")?.events?.off("ui:flash", this.showFlash, this);
    this.scene.get("GameScene")?.events?.off("ui:roundStart", this.roundStartEffect, this);
  }
}
