import Phaser from "phaser";
import type { PlayerAction } from "$lib/network/messages";

/**
 * Captures keyboard input and produces an array of PlayerAction strings per tick.
 * This is the input → action serialization layer required by the protocol.
 */
export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyW: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyE: Phaser.Input.Keyboard.Key;
  private keyQ: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyQ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  /**
   * Returns the current actions based on keys pressed this frame.
   */
  getActions(): PlayerAction[] {
    const actions: PlayerAction[] = [];

    if (this.keyA.isDown || this.cursors.left.isDown) {
      actions.push("left");
    }
    if (this.keyD.isDown || this.cursors.right.isDown) {
      actions.push("right");
    }
    if (
      this.keyW.isDown ||
      this.cursors.up.isDown ||
      this.keySpace.isDown
    ) {
      actions.push("jump");
    }
    if (this.keyS.isDown || this.cursors.down.isDown) {
      actions.push("crouch");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      actions.push("interact");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      actions.push("use_item");
    }

    return actions;
  }

  destroy(): void {
    // Keys are cleaned up by Phaser scene shutdown
  }
}
