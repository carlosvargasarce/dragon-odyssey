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
}
