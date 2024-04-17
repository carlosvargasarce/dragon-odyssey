import { HISTORY_ASSET_KEYS } from '../assets/asset-keys.js';
import SpriteFacade from '../utils/spriteFacade.js';
import DialogUiDecorator from '../world/dialog-ui-decorator.js';
import { DialogUi } from '../world/dialog-ui.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class History2Scene extends BaseScene {
  /** @type {DialogUi} */
  #dialogUi;
  /** @type {number} */
  #counter;

  constructor() {
    super({
      key: SCENE_KEYS.HISTORY_2_SCENE,
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
      { assetKey: HISTORY_ASSET_KEYS.HISTORY_2 }
    )
      .setOrigin(0)
      .setScale(0.432);

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
          this.scene.start(SCENE_KEYS.HISTORY_3_SCENE);
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
      'Upon returning, Homer and his loyal followers faced Maluf in an epic battle, which would culminate in a mortal wound for the king.',
      'With his last strength, Homer sought Gartok the dragons aid, who attacked the usurper. Yet, Malufs dark magic corrupted Gartok.',
      'The earth shook, swallowing the kingdoms glory. Witnessing druids sacrificed themselves to invoke ancient magic and contain the evil.',
    ]);
  }

  fadeOutAndTransition() {
    this.cameras.main.fadeOut(1000);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        console.log('Fade out complete, changing scene');
        this.scene.start(SCENE_KEYS.HISTORY_3_SCENE);
      }
    );
  }
}
