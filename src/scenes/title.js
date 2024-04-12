import { Scene } from 'phaser';
import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../assets/font-keys.js';
import { DIRECTION } from '../common/direction.js';
import { Controls } from '../utils/controls.js';
import { exhaustiveGuard } from '../utils/guard.js';
import { NineSlice } from '../utils/nine-slice.js';
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

export default class TitleScene extends Scene {
  /** @type {Phaser.GameObjects.Image} */
  #mainMenuCursorPhaserImageGameObject;
  /**  @type {Controls}*/
  #controls;
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
    console.log(`[${TitleScene.name}:init] invoked`);

    this.#nineSliceMenu = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
    });
  }

  create() {
    console.log(`[${TitleScene.name}:create] invoked`);

    this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
    this.#isContinueButtonEnabled = false;

    this.add
      .image(0, 0, TITLE_ASSET_KEYS.BACKGROUND)
      .setOrigin(0)
      .setScale(0.501);

    this.add
      .image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.TITLE)
      .setScale(1);

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
    this.#mainMenuCursorPhaserImageGameObject = this.add
      .image(PLAYER_INPUT_CURSOR_POSITION.x, 54, UI_ASSET_KEYS.CURSOR)
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
        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
          // TODO: enhance with logic to reset game once we implement saving/loading data
          this.scene.start(SCENE_KEYS.WORLD_SCENE);
          return;
        }

        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
          this.scene.start(SCENE_KEYS.WORLD_SCENE);
          return;
        }

        if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
          this.scene.start(SCENE_KEYS.OPTIONS_SCENE);
          return;
        }
      }
    );

    this.#controls = new Controls(this);
  }

  update() {
    if (this.#controls.isInputLocked) {
      return;
    }

    const wasSpaceKeyPressed = this.#controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.#controls.lockInput = true;
      return;
    }

    const selectedDirection = this.#controls.getDirectionKeyJustPressed();

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