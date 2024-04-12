import { BATTLE_BACKGROUND_ASSET_KEYS } from '../assets/asset-keys.js';
import SpriteFacade from '../utils/spriteFacade.js';

export class Background {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {Phaser.GameObjects.Image} */
  #backgroundGameObject;
  /**
   *
   * @param {Phaser.Scene} scene the Phaser 3 Scene the background will be added to
   */
  constructor(scene) {
    this.#scene = scene;

    this.#backgroundGameObject = SpriteFacade.createSprite(
      this.#scene,
      { x: 0, y: 0 },
      { assetKey: BATTLE_BACKGROUND_ASSET_KEYS.MEADOW }
    )
      .setOrigin(0)
      .setAlpha(0)
      .setScale(0.5);
  }

  showMeadow() {
    this.#backgroundGameObject
      .setTexture(BATTLE_BACKGROUND_ASSET_KEYS.MEADOW)
      .setAlpha(1);
  }
}
