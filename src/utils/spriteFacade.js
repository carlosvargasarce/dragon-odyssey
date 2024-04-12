export default class SpriteFacade {
  /**
   * Creates a sprite and adds it to the given Phaser scene.
   *
   * @param {Phaser.Scene} scene - The scene to which the sprite will be added.
   * @param {object} config - Configuration object for the sprite.
   * @param {import("src/types/typedef.js").Coordinate} position - The position to place the sprite.
   * @returns {Phaser.GameObjects.Image} The created sprite.
   */
  static createSprite(scene, position, config) {
    const { assetKey, assetFrame } = config;

    const sprite = scene.add.image(
      position.x,
      position.y,
      assetKey,
      assetFrame
    );

    return sprite;
  }

  /**
   * Optimizes the visibility of a sprite based on camera bounds.
   *
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite to optimize.
   * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to use for checking visibility.
   */
  static optimizeVisibility(sprite, camera) {
    // Checks if sprite bounds intersect with the camera's visible bounds
    const bounds = sprite.getBounds();
    sprite.setVisible(
      camera.worldView.contains(bounds.x, bounds.y) ||
        camera.worldView.contains(bounds.right, bounds.bottom)
    );
  }

  /**
   * Applies a shadow effect to a sprite by creating a shadow sprite.
   *
   * @param {Phaser.Scene} scene - The Phaser scene.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite to apply the shadow on.
   * @param {number} offsetX - The horizontal offset of the shadow.
   * @param {number} offsetY - The vertical offset of the shadow.
   * @param {number} color - The color of the shadow.
   */
  static applyShadow(scene, sprite, offsetX, offsetY, color) {
    const shadow = scene.add.sprite(
      sprite.x + offsetX,
      sprite.y + offsetY,
      sprite.texture.key
    );
    shadow.setTint(color);
    shadow.setDepth(sprite.depth - 1); // Ensure shadow is rendered below the original sprite
    return shadow;
  }
}
