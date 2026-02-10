import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";

let gameInstance: Phaser.Game | null = null;

/**
 * Create and start the Phaser game instance.
 * Mounts into the given DOM container element.
 */
export function createGame(container: HTMLElement): Phaser.Game {
  // Prevent double-init
  if (gameInstance) {
    destroyGame();
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: container,
    width: 1280,
    height: 720,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 }, // Gravity per-body, not global
        debug: import.meta.env.DEV,
      },
    },
    scene: [BootScene, GameScene],
    audio: {
      disableWebAudio: false,
    },
    input: {
      keyboard: true,
      mouse: false,
      touch: false,
      gamepad: false,
    },
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

/**
 * Destroy the Phaser game instance. Called when leaving the /game route.
 * Cleans up all scenes, textures, and event listeners.
 */
export function destroyGame(): void {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}

/**
 * Get the current game instance (if running).
 */
export function getGame(): Phaser.Game | null {
  return gameInstance;
}
