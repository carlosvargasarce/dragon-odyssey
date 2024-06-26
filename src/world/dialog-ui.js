import { UI_ASSET_KEYS } from '../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../assets/font-keys.js';
import { dataManager } from '../utils/data-manager.js';
import SpriteFacade from '../utils/spriteFacade.js';
import { CANNOT_READ_SIGN_TEXT, animateText } from '../utils/text.utils.js';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = Object.freeze({
  color: '#FFFFFF',
  fontSize: '30px',
  fontFamily: LATO_FONT_NAME,
  wordWrap: { width: 0 },
});

export class DialogUi {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {number} */
  #padding;
  /** @type {number} */
  #width;
  /** @type {number} */
  #height;
  /** @type {boolean} */
  #isVisible;
  /** @type {Phaser.GameObjects.Container} */
  #container;
  /** @type {Phaser.GameObjects.Image} */
  #userInputCursor;
  /** @type {Phaser.Tweens.Tween} */
  #userInputCursorTween;
  /** @type {Phaser.GameObjects.Text} */
  #uiText;
  /** @type {boolean} */
  #textAnimationPlaying;
  /** @type {string[]} */
  #messagesToShow;

  constructor(scene, width, padding, height, alpha) {
    this.#scene = scene;
    this.#padding = padding;
    this.#width = width - this.#padding * 2;
    this.#height = height;
    this.#textAnimationPlaying = false;
    this.#messagesToShow = [];

    const panel = this.#scene.add
      .rectangle(0, 0, this.#width, this.#height, 0x000000, alpha)
      .setOrigin(0);
    this.#container = this.#scene.add.container(0, 0, [panel]);
    this.#uiText = this.#scene.add.text(24, 28, CANNOT_READ_SIGN_TEXT, {
      ...UI_TEXT_STYLE,
      ...{ wordWrap: { width: this.#width - 90 } },
    });
    this.#container.add(this.#uiText);
    this.#createPlayerInputCursor();
    this.hideDialogModal();
  }

  /** @type {Phaser.Tweens.Tween} */
  get userInputCursorTween() {
    return this.#userInputCursorTween;
  }

  /** @type {Phaser.Scene} */
  get scene() {
    return this.#scene;
  }

  /** @type {Phaser.GameObjects.Container} */
  get container() {
    return this.#container;
  }

  /** @type {boolean} */
  get isVisible() {
    return this.#isVisible;
  }

  /** @param {boolean} val the value that will be assigned */
  set isVisible(val) {
    this.#isVisible = val;
  }

  /** @type {boolean} */
  get isAnimationPlaying() {
    return this.#textAnimationPlaying;
  }

  /** @type {boolean} */
  get moreMessagesToShow() {
    return this.#messagesToShow.length > 0;
  }

  /**
   * @param {string[]} messages
   * @returns {void}
   */
  showDialogModal(messages) {
    this.#messagesToShow = [...messages];

    const { x, bottom } = this.#scene.cameras.main.worldView;
    const startX = x + this.#padding;
    const startY = bottom - this.#height - this.#padding / 4;

    this.#container.setPosition(startX, startY);
    this.#userInputCursorTween.restart();
    this.#container.setAlpha(1);
    this.#isVisible = true;

    this.showNextMessage();
  }

  /**
   * @returns {void}
   */
  showNextMessage() {
    if (this.#messagesToShow.length === 0) {
      return;
    }

    this.#uiText.setText('').setAlpha(1);

    animateText(this.#scene, this.#uiText, this.#messagesToShow.shift(), {
      delay: dataManager.getAnimatedTextSpeed(),
      callback: () => {
        this.#textAnimationPlaying = false;
      },
    });

    this.#textAnimationPlaying = true;
  }

  /**
   * @returns {void}
   */
  hideDialogModal() {
    this.#container.setAlpha(0);
    this.#userInputCursorTween.pause();
    this.#isVisible = false;
  }

  /**
   * @returns {void}
   */
  #createPlayerInputCursor() {
    const y = this.#height - 32;

    this.#userInputCursor = SpriteFacade.createSprite(
      this.#scene,
      { x: this.#width - 35, y: y },
      { assetKey: UI_ASSET_KEYS.CURSOR }
    );

    this.#userInputCursor.setAngle(90).setScale(1.2, 1);

    this.#userInputCursorTween = this.#scene.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
      targets: this.#userInputCursor,
    });

    this.#userInputCursorTween.pause();
    this.#container.add(this.#userInputCursor);
  }
}
