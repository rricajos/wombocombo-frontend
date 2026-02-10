import Phaser from "phaser";
import { CAMERA } from "../config/physics";

/**
 * Camera manager wrapping Phaser's camera with game-specific behaviors.
 */
export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private scene: Phaser.Scene;
  private target: Phaser.GameObjects.Sprite | null = null;
  private isZoomedOut: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  /**
   * Set up camera to follow a target sprite.
   */
  follow(target: Phaser.GameObjects.Sprite, worldWidth: number, worldHeight: number): void {
    this.target = target;
    this.camera.startFollow(target, true, CAMERA.LERP_X, CAMERA.LERP_Y);
    this.camera.setBounds(0, 0, worldWidth, worldHeight);
    this.camera.setDeadzone(CAMERA.DEADZONE_W, CAMERA.DEADZONE_H);
    this.camera.setBackgroundColor(0x12122a);
  }

  /**
   * Shake the camera (damage, explosions).
   */
  shake(intensity?: number, duration?: number): void {
    this.camera.shake(
      duration ?? CAMERA.SHAKE_DURATION,
      intensity ?? CAMERA.SHAKE_INTENSITY
    );
  }

  /**
   * Zoom out (death) or back in (respawn).
   */
  zoomOut(): void {
    if (this.isZoomedOut) return;
    this.isZoomedOut = true;
    this.camera.zoomTo(CAMERA.DEATH_ZOOM, CAMERA.ZOOM_DURATION, "Sine.easeInOut");
  }

  zoomReset(): void {
    if (!this.isZoomedOut) return;
    this.isZoomedOut = false;
    this.camera.zoomTo(1, 300, "Sine.easeOut");
  }

  /**
   * Flash the camera (damage indicator).
   */
  flash(color: number = 0xff0000, duration: number = 100): void {
    this.camera.flash(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }

  /**
   * Fade to black (scene transition).
   */
  fadeOut(duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      this.camera.fadeOut(duration, 0, 0, 0);
      this.camera.once("camerafadeoutcomplete", () => resolve());
    });
  }

  fadeIn(duration: number = 500): void {
    this.camera.fadeIn(duration, 0, 0, 0);
  }

  getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera;
  }

  destroy(): void {
    this.target = null;
  }
}
