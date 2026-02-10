import Phaser from "phaser";

const ITEM_COLORS: Record<string, number> = {
  health_potion: 0xff4444,
  shield: 0x4488ff,
  speed_boost: 0x44ff44,
  damage_boost: 0xff8800,
};

/**
 * Item sprite on the ground. Spawned and picked up based on server events.
 */
export class Item extends Phaser.GameObjects.Ellipse {
  itemId: string;
  itemType: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    itemId: string,
    itemType: string
  ) {
    const color = ITEM_COLORS[itemType] ?? 0xffffff;
    super(scene, x, y, 12, 12, color);

    this.itemId = itemId;
    this.itemType = itemType;

    scene.add.existing(this);
    this.setDepth(5);

    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  playPickup(scene: Phaser.Scene): void {
    scene.tweens.add({
      targets: this,
      y: this.y - 20,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }
}
