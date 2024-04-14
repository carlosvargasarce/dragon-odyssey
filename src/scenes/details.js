import { ALLIES_ASSET_KEYS } from '../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../assets/font-keys.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import { DataUtils } from '../utils/data-utils.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = {
  fontFamily: LATO_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '24px',
};

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const CHARACTER_MOVE_TEXT_STYLE = {
  fontFamily: LATO_FONT_NAME,
  color: '#000000',
  fontSize: '40px',
};

/**
 * @typedef CharacterDetailsSceneData
 * @type {object}
 * @property {import('../types/typedef.js').Character} character
 */

export default class CharacterDetailsScene extends BaseScene {
  /** @type {import('../types/typedef.js').Character} */
  #characterDetails;
  /** @type {import('../types/typedef.js').Attack[]} */
  #characterAttacks;

  constructor() {
    super({
      key: SCENE_KEYS.DETAILS_SCENE,
    });
  }

  /**
   * @param {CharacterDetailsSceneData} data
   * @returns {void}
   */
  init(data) {
    super.init(data);

    this.#characterDetails = data.character;

    // Added for testing from preload scene directly
    if (this.#characterDetails === undefined) {
      this.#characterDetails = dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY
      )[0];
    }

    this.#characterAttacks = [];
    this.#characterDetails.attackIds.forEach((attackId) => {
      const characterAttack = DataUtils.getCharacterAttack(this, attackId);
      if (characterAttack !== undefined) {
        this.#characterAttacks.push(characterAttack);
      }
    });
  }

  /**
   * @returns {void}
   */
  create() {
    super.create();

    // create main background and title
    this.add
      .image(0, 0, ALLIES_ASSET_KEYS.ALLIES_DETAILS_BACKGROUND)
      .setOrigin(0);
    this.add.text(10, 0, 'Character Details', {
      ...UI_TEXT_STYLE,
      fontSize: '48px',
    });

    // add character details
    this.add.text(20, 60, `Lv. ${this.#characterDetails.currentLevel}`, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });
    this.add.text(200, 60, this.#characterDetails.name, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });
    this.add
      .image(160, 310, this.#characterDetails.assetKey)
      .setOrigin(0, 1)
      .setScale(0.7);

    if (this.#characterAttacks[0] !== undefined) {
      this.add.text(
        560,
        82,
        this.#characterAttacks[0].name,
        CHARACTER_MOVE_TEXT_STYLE
      );
    }

    if (this.#characterAttacks[1] !== undefined) {
      this.add.text(
        560,
        162,
        this.#characterAttacks[1].name,
        CHARACTER_MOVE_TEXT_STYLE
      );
    }

    if (this.#characterAttacks[2] !== undefined) {
      this.add.text(
        560,
        242,
        this.#characterAttacks[2].name,
        CHARACTER_MOVE_TEXT_STYLE
      );
    }

    if (this.#characterAttacks[3] !== undefined) {
      this.add.text(
        560,
        322,
        this.#characterAttacks[3].name,
        CHARACTER_MOVE_TEXT_STYLE
      );
    }

    this.scene.bringToTop(SCENE_KEYS.DETAILS_SCENE);
  }

  /**
   * @returns {void}
   */
  update() {
    super.update();

    if (this._controls.isInputLocked) {
      return;
    }

    if (this._controls.wasBackKeyPressed()) {
      this.#goBackToPreviousScene();
      return;
    }

    if (this._controls.wasSpaceKeyPressed()) {
      this.#goBackToPreviousScene();
      return;
    }
  }

  /**
   * @returns {void}
   */
  #goBackToPreviousScene() {
    this._controls.lockInput = true;
    this.scene.stop(SCENE_KEYS.DETAILS_SCENE);
    this.scene.resume(SCENE_KEYS.ALLYS_SCENE);
  }
}
