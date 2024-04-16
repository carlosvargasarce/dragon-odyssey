import { HISTORY_ASSET_KEYS } from '../assets/asset-keys.js';
import SpriteFacade from '../utils/spriteFacade.js';
import DialogUiDecorator from '../world/dialog-ui-decorator.js';
import { DialogUi } from '../world/dialog-ui.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class History1Scene extends BaseScene {
  /** @type {DialogUi} */
  #dialogUi;
  /** @type {number} */
  #counter;

  constructor() {
    super({
      key: SCENE_KEYS.HISTORY_1_SCENE,
    });
    this.#counter = 0;
  }

  /**
   * @returns {void}
   */
  create() {
    super.create();

    // Create main background and title
    SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: HISTORY_ASSET_KEYS.HISTORY_1 }
    ).setOrigin(0);

    //this.#dialogUi = new DialogUi(this, 1024, 0, 124, 0.5);

    let originalDialogUi = new DialogUi(this, 1024, 0, 124, 0.5);
    // @ts-ignore
    this.#dialogUi = new DialogUiDecorator(originalDialogUi);

    // @ts-ignore
    this.#dialogUi.setOnComplete(() => {
      // Handle the completion of all dialogues
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          console.log('Fade out complete, changing scene');
          this.scene.start(SCENE_KEYS.WORLD_SCENE);
        }
      );
    });

    this.setupCamera();
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.fadeIn(1500);
  }

  /**
   * @returns {void}
   */
  update() {
    super.update();
    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();

    if (
      wasSpaceKeyPressed &&
      !this.#dialogUi.isAnimationPlaying &&
      this.#counter < 1
    ) {
      this.#counter++;
      this.#handlePlayerInteraction();
    }
  }

  #handlePlayerInteraction() {
    if (this.#dialogUi.isAnimationPlaying) {
      return;
    }

    if (this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow) {
      //this.#dialogUi.hideDialogModal();
      this.fadeOutAndTransition();
      return;
    }

    if (this.#dialogUi.isVisible && this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.showNextMessage();
      return;
    }

    console.log('Start of interaction check');

    this.#dialogUi.showDialogModal([
      'A long time ago, in the eastern sea, the Kingdom of Elendel emerged, an oasis of peace under the benevolent rule of King Homero.',
      'His just reign, prosperous and equitable, inspired admiration and envy. In the shadows, treason and greed conspired a dark plan.',
      'In a moment of vulnerability, Maluf, the ambitious wizard, seized the throne, initiating an era of hardships.',
    ]);
  }

  fadeOutAndTransition() {
    this.cameras.main.fadeOut(1000);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        console.log('Fade out complete, changing scene');
        this.scene.start(SCENE_KEYS.WORLD_SCENE);
      }
    );
  }
}
