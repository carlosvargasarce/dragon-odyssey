import {
  AUDIO_ASSET_KEYS,
  TITLE_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../assets/font-keys.js';
import { DIRECTION } from '../common/direction.js';
import { playBackgroundMusic } from '../utils/audio-utils.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import { exhaustiveGuard } from '../utils/guard.js';
import { NineSlice } from '../utils/nine-slice.js';
import SpriteFacade from '../utils/spriteFacade.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
export const MENU_TEXT_STYLE = Object.freeze({
  color: '#FFFBF5',
  fontSize: '30px',
  fontFamily: LATO_FONT_NAME,
});

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
  x: 132,
});

/**
 *
 * @typedef {keyof typeof MAIN_MENU_OPTIONS} MainMenuOptions
 */

/** @enum {MainMenuOptions} */
const MAIN_MENU_OPTIONS = Object.freeze({
  NEW_GAME: 'NEW_GAME',
  CONTINUE: 'CONTINUE',
  OPTIONS: 'OPTIONS',
});

export default class TitleScene extends BaseScene {
  /** @type {Phaser.GameObjects.Image} */
  #mainMenuCursorPhaserImageGameObject;
  /** @type {MainMenuOptions} */
  #selectedMenuOption;
  /** @type {boolean} */
  #isContinueButtonEnabled;
  /** @type {NineSlice} */
  #nineSliceMenu;

  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }

  init() {
    super.init();

    this.#nineSliceMenu = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
    });
  }

  create() {
    super.create();

    this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
    this.#isContinueButtonEnabled =
      dataManager.store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED) || false;

    SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: TITLE_ASSET_KEYS.BACKGROUND }
    )
      .setOrigin(0)
      .setScale(0.501);

    SpriteFacade.createSprite(
      this,
      { x: this.scale.width / 2, y: 150 },
      { assetKey: TITLE_ASSET_KEYS.TITLE }
    ).setScale(1);

    // Create Menu
    const menuBgWidth = 480;
    const menuBgContainer = this.#nineSliceMenu.createNineSliceContainer(
      this,
      menuBgWidth,
      216,
      UI_ASSET_KEYS.MENU_BACKGROUND
    );
    const newGameText = this.add
      .text(menuBgWidth / 2, 55, 'NEW GAME', MENU_TEXT_STYLE)
      .setOrigin(0.5);

    const continueText = this.add
      .text(menuBgWidth / 2, 110, 'CONTINUE', MENU_TEXT_STYLE)
      .setOrigin(0.5);

    if (!this.#isContinueButtonEnabled) {
      continueText.setAlpha(0.5);
    }

    const optionText = this.add
      .text(menuBgWidth / 2, 165, 'OPTIONS', MENU_TEXT_STYLE)
      .setOrigin(0.5);

    const menuContainer = this.add.container(0, 0, [
      menuBgContainer,
      newGameText,
      continueText,
      optionText,
    ]);

    menuContainer.setPosition(this.scale.width / 2 - menuBgWidth / 2, 300);

    // Create Cursor
    this.#mainMenuCursorPhaserImageGameObject = SpriteFacade.createSprite(
      this,
      { x: PLAYER_INPUT_CURSOR_POSITION.x, y: 54 },
      { assetKey: UI_ASSET_KEYS.CURSOR }
    )
      .setOrigin(0.5)
      .setScale(1);

    menuBgContainer.add(this.#mainMenuCursorPhaserImageGameObject);
    this.tweens.add({
      delay: 0,
      duration: 500,
      repeat: -1,
      x: {
        from: PLAYER_INPUT_CURSOR_POSITION.x,
        start: PLAYER_INPUT_CURSOR_POSITION.x,
        to: PLAYER_INPUT_CURSOR_POSITION.x + 3,
      },
      targets: this.#mainMenuCursorPhaserImageGameObject,
    });

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
          this.scene.start(SCENE_KEYS.OPTIONS_SCENE);
          return;
        }

        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
          dataManager.startNewGame(this);
          this.scene.start(SCENE_KEYS.HISTORY_1_SCENE);
          return;
        }

        this.scene.start(SCENE_KEYS.WORLD_SCENE);
      }
    );

    playBackgroundMusic(this, AUDIO_ASSET_KEYS.TITLE);
  }

  update() {
    super.update();

    if (this._controls.isInputLocked) {
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this._controls.lockInput = true;
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();

    if (selectedDirection != DIRECTION.NONE) {
      this.#moveMenuSelectCursor(selectedDirection);
    }
  }

  /**
   * @param {import('src/common/direction.js').Direction} direction
   * @returns {void}
   */
  #moveMenuSelectCursor(direction) {
    this.#updateSelectedMenuOptionFromInput(direction);

    switch (this.#selectedMenuOption) {
      case MAIN_MENU_OPTIONS.NEW_GAME:
        this.#mainMenuCursorPhaserImageGameObject.setY(54);
        break;
      case MAIN_MENU_OPTIONS.CONTINUE:
        this.#mainMenuCursorPhaserImageGameObject.setY(109);
        break;
      case MAIN_MENU_OPTIONS.OPTIONS:
        this.#mainMenuCursorPhaserImageGameObject.setY(164);
        break;
      default:
        exhaustiveGuard(this.#selectedMenuOption);
    }
  }

  /**
   * @param {import('../common/direction.js').Direction} direction
   * @returns {void}
   */
  #updateSelectedMenuOptionFromInput(direction) {
    switch (direction) {
      case DIRECTION.UP:
        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
          return;
        }
        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
          this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
          return;
        }
        if (
          this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS &&
          !this.#isContinueButtonEnabled
        ) {
          this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
          return;
        }
        this.#selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
        return;
      case DIRECTION.DOWN:
        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
          return;
        }
        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
          this.#selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS;
          return;
        }
        if (
          this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME &&
          !this.#isContinueButtonEnabled
        ) {
          this.#selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS;
          return;
        }
        this.#selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
        return;
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.NONE:
        return;
      default:
        exhaustiveGuard(direction);
    }
  }
}
