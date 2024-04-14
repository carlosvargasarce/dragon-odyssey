import { HEALTH_BAR_ASSET_KEYS } from '../../assets/asset-keys.js';
import SpriteFacade from '../../utils/spriteFacade.js';

export class Healthbar {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {Phaser.GameObjects.Container} */
  #healthBarContainer;
  /** @type {number} */
  #fullWidth;
  /** @type {number} */
  #scaleY;
  /** @type {Phaser.GameObjects.Image} */
  #leftCap;
  /** @type {Phaser.GameObjects.Image} */
  #middle;
  /** @type {Phaser.GameObjects.Image} */
  #rightCap;
  /** @type {Phaser.GameObjects.Image} */
  #leftShadowCap;
  /** @type {Phaser.GameObjects.Image} */
  #middleShadow;
  /** @type {Phaser.GameObjects.Image} */
  #rightShadowCap;

  /**
   * @param {Phaser.Scene} scene the Phaser 3 Scene the health bar will be added to
   * @param {number} x the x position to place the health bar container
   * @param {number} y the y position to place the health bar container
   */
  constructor(scene, x, y, width = 360) {
    this.#scene = scene;
    this.#fullWidth = width;
    this.#scaleY = 0.7;
    this.#healthBarContainer = this.#scene.add.container(x, y, []);
    this.#createHealthBarShadowImages(x, y);
    this.#createHealthBarImages(x, y);
    this.#setMeterPercentage(1);
  }

  get container() {
    return this.#healthBarContainer;
  }

  /**
   *
   * @param {number} x the x position to place the health bar game object
   * @param {number} y the y position to place the health bar game object
   * @returns {void}
   *
   */
  #createHealthBarShadowImages(x, y) {
    this.#leftShadowCap = SpriteFacade.createSprite(
      this.#scene,
      { x: x, y: y },
      { assetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW }
    )
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#middleShadow = SpriteFacade.createSprite(
      this.#scene,
      { x: this.#leftShadowCap.x + this.#leftShadowCap.width, y: y },
      { assetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW }
    )
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#middleShadow.displayWidth = this.#fullWidth;

    this.#rightShadowCap = SpriteFacade.createSprite(
      this.#scene,
      { x: this.#middleShadow.x + this.#middleShadow.displayWidth, y: y },
      { assetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW }
    )
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([
      this.#leftShadowCap,
      this.#middleShadow,
      this.#rightShadowCap,
    ]);
  }

  /**
   *
   * @param {number} x the x position to place the health bar game object
   * @param {number} y the y position to place the health bar game object
   * @returns {void}
   *
   */
  #createHealthBarImages(x, y) {
    this.#leftCap = SpriteFacade.createSprite(
      this.#scene,
      { x: x, y: y },
      { assetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP }
    )
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#middle = SpriteFacade.createSprite(
      this.#scene,
      { x: this.#leftCap.x + this.#leftCap.width, y: y },
      { assetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE }
    )
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#rightCap = SpriteFacade.createSprite(
      this.#scene,
      { x: this.#middle.x + this.#middle.displayWidth, y: y },
      { assetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP }
    )
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([this.#leftCap, this.#middle, this.#rightCap]);
  }

  /**
   * @param {number} [percent=1] a number between 0 and 1 that is used for setting how filled the health bar is
   * @returns {void}
   */
  #setMeterPercentage(percent = 1) {
    const width = this.#fullWidth * percent;

    this.#middle.displayWidth = width;
    this.#rightCap.x = this.#middle.x + this.#middle.displayWidth;
  }

  #updateHealthBarGameObjects() {
    this.#rightCap.x = this.#middle.x + this.#middle.displayWidth;
    const isVisible = this.#middle.displayWidth > 0;
    this.#leftCap.visible = isVisible;
    this.#middle.visible = isVisible;
    this.#rightCap.visible = isVisible;
  }

  /**
   * @param {number} [percent=1] a number between 0 and 1 that is used for setting how filled the health bar is
   * @param {object} [options] optional configuration options that can be provided for the animation
   * @param {number} [options.duration=1000] the duration of the health bar animation
   * @param {() => void} [options.callback] an optional callback that will be called when the animation is complete
   * @param {boolean} [options.skipBattleAnimations=false] determines if we skip the health bar animation
   * @returns {void}
   */
  setMeterPercentageAnimated(percent, options) {
    const width = this.#fullWidth * percent;

    this.#scene.tweens.add({
      targets: this.#middle,
      displayWidth: width,
      duration: options?.duration || options?.duration === 0 ? 0 : 1000,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        this.#updateHealthBarGameObjects();
      },
      onComplete: options?.callback,
    });
  }
}
