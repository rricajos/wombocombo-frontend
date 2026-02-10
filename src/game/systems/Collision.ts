import Phaser from "phaser";
import { PHYSICS } from "../config/physics";

/**
 * Collision system for setting up physics interactions.
 */
export class CollisionSystem {
  private scene: Phaser.Scene;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private oneWayPlatforms: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.platforms = scene.physics.add.staticGroup();
    this.oneWayPlatforms = scene.physics.add.staticGroup();
  }

  /**
   * Set up collisions between a player sprite and all platform groups.
   */
  addPlayerCollision(player: Phaser.Physics.Arcade.Sprite): void {
    // Solid platforms — always collide
    this.scene.physics.add.collider(player, this.platforms);

    // One-way platforms — only collide when player is falling
    this.scene.physics.add.collider(
      player,
      this.oneWayPlatforms,
      undefined,
      (_player, _platform) => {
        const body = player.body as Phaser.Physics.Arcade.Body;
        // Only collide if moving downward and feet are above platform
        return body.velocity.y >= 0;
      }
    );
  }

  /**
   * Build a level from structured platform data.
   */
  buildLevel(platformData: PlatformDef[]): void {
    for (const plat of platformData) {
      const group = plat.oneWay ? this.oneWayPlatforms : this.platforms;
      const texture = plat.oneWay ? "tile_platform" : "tile_ground";

      for (let i = 0; i < plat.w; i++) {
        const tile = group.create(
          plat.x + i * PHYSICS.TILE_SIZE + PHYSICS.TILE_SIZE / 2,
          plat.y,
          texture
        );
        if (plat.oneWay) {
          tile.body.checkCollision.down = false;
          tile.body.checkCollision.left = false;
          tile.body.checkCollision.right = false;
        }
      }
    }
  }

  /**
   * Build walls and ground for an enclosed arena.
   */
  buildArena(width: number, height: number): void {
    // Ground
    for (let x = 0; x < width; x += PHYSICS.TILE_SIZE) {
      this.platforms.create(x + 16, height - 16, "tile_ground");
    }

    // Left wall
    for (let y = 0; y < height; y += PHYSICS.TILE_SIZE) {
      this.platforms.create(16, y, "tile_wall");
    }

    // Right wall
    for (let y = 0; y < height; y += PHYSICS.TILE_SIZE) {
      this.platforms.create(width - 16, y, "tile_wall");
    }
  }

  getPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    return this.platforms;
  }

  getOneWayPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    return this.oneWayPlatforms;
  }

  destroy(): void {
    this.platforms.clear(true, true);
    this.oneWayPlatforms.clear(true, true);
  }
}

export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  oneWay?: boolean;
}
