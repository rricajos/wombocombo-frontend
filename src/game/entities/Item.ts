import Phaser from "phaser";
import { PHYSICS } from "../config/physics";

const ITEM_COLORS: Record<string, number> = {
  health_potion: 0xff4444,
  shield: 0x4488ff,
  speed_boost: 0xffcc00,
  damage_up: 0xff8800,
  coin: 0xffdd00,
};

const ITEM_TEXTURES: Record<string, string> = {
  health_potion: "item_health",
  shield: "item_shield",
  speed_boost: "item_speed",
  damage_up: "item_damage",
  coin: "item_coin",
};

/**
 * Pickupable item with floating animation and glow.
 */
export class Item extends Phaser.GameObjects.Container {
  itemId: string;
  itemType: string;
  private sprite: Phaser.GameObjects.Sprite;
  private glow: Phaser.GameObjects.Arc;
  private floatTween: Phaser.Tweens.Tween;
  private baseY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    itemId: string,
    itemType: string
  ) {
    super(scene, x, y);
    this.itemId = itemId;
    this.itemType = itemType;
    this.baseY = y;

    const color = ITEM_COLORS[itemType] ?? 0xffffff;
    const texture = ITEM_TEXTURES[itemType] ?? "item_health";

    // Glow circle behind item
    this.glow = scene.add.circle(0, 0, 14, color, 0.15);
    this.add(this.glow);

    // Item sprite
    this.sprite = scene.add.sprite(0, 0, texture);
    this.add(this.sprite);

    scene.add.existing(this);
    this.setDepth(6);

    // Float animation
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - PHYSICS.ITEM_FLOAT_AMPLITUDE,
      duration: PHYSICS.ITEM_FLOAT_SPEED,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Glow pulse
    scene.tweens.add({
      targets: this.glow,
      alpha: 0.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Spawn pop
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  playPickup(scene: Phaser.Scene): void {
    this.floatTween?.stop();

    scene.tweens.add({
      targets: this,
      y: this.y - 30,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 250,
      ease: "Quad.easeOut",
      onComplete: () => this.destroy(),
    });
  }

  destroy(fromScene?: boolean): void {
    this.floatTween?.stop();
    super.destroy(fromScene);
  }
}
