import { UI_ASSET_KEYS } from '../../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../../assets/font-keys.js';
import { DIRECTION } from '../../common/direction.js';
import {
  DATA_MANAGER_STORE_KEYS,
  dataManager,
} from '../../utils/data-manager.js';
import { exhaustiveGuard } from '../../utils/guard.js';
import SpriteFacade from '../../utils/spriteFacade.js';
import { MENU_COLOR } from './menu-config.js';

/**
 * @typedef {keyof typeof MENU_OPTIONS} MenuOptions
 */

/** @enum {MenuOptions} */
export const MENU_OPTIONS = Object.freeze({
  MONSTERDEX: 'MONSTERDEX',
  CHARACTERS: 'CHARACTERS',
  BAG: 'BAG',
  SAVE: 'SAVE',
  OPTIONS: 'OPTIONS',
  EXIT: 'EXIT',
});

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const MENU_TEXT_STYLE = {
  fontFamily: LATO_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '32px',
};

export class Menu {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {number} */
  #padding;
  /** @type {number} */
  #width;
  /** @type {number} */
  #height;
  /** @type {Phaser.GameObjects.Graphics} */
  #graphics;
  /** @type {Phaser.GameObjects.Container} */
  #container;
  /** @type {boolean} */
  #isVisible;
  /** @type {MenuOptions[]} */
  #availableMenuOptions;
  /** @type {Phaser.GameObjects.Text[]} */
  #menuOptionsTextGameObjects;
  /** @type {number} */
  #selectedMenuOptionIndex;
  /** @type {MenuOptions} */
  #selectedMenuOption;
  /** @type {Phaser.GameObjects.Image} */
  #userInputCursor;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.#scene = scene;
    this.#padding = 4;
    this.#width = 300;
    this.#availableMenuOptions = [
      MENU_OPTIONS.CHARACTERS,
      MENU_OPTIONS.BAG,
      MENU_OPTIONS.SAVE,
      MENU_OPTIONS.EXIT,
    ];
    this.#menuOptionsTextGameObjects = [];
    this.#selectedMenuOptionIndex = 0;

    // Calculate height based on currently available options
    this.#height =
      10 + this.#padding * 2 + this.#availableMenuOptions.length * 50;

    this.#graphics = this.#createGraphics();
    this.#container = this.#scene.add.container(0, 0, [this.#graphics]);

    // Update menu container with menu options
    for (let i = 0; i < this.#availableMenuOptions.length; i += 1) {
      const y = 12 + 50 * i + this.#padding;
      const textObj = this.#scene.add.text(
        40 + this.#padding,
        y,
        this.#availableMenuOptions[i],
        MENU_TEXT_STYLE
      );
      this.#menuOptionsTextGameObjects.push(textObj);
      this.#container.add(textObj);
    }

    // Add player input cursor
    this.#userInputCursor = SpriteFacade.createSprite(
      this.#scene,
      { x: 20 + this.#padding, y: 25 + this.#padding },
      { assetKey: UI_ASSET_KEYS.CURSOR_WHITE }
    ).setScale(1);

    this.#container.add(this.#userInputCursor);

    this.hide();
  }

  /** @type {boolean} */
  get isVisible() {
    return this.#isVisible;
  }

  /** @type {MenuOptions} */
  get selectedMenuOption() {
    return this.#selectedMenuOption;
  }

  /**
   * @returns {void}
   */
  show() {
    const { right, top } = this.#scene.cameras.main.worldView;
    const startX = right - this.#padding * 6 - this.#width;
    const startY = top + this.#padding * 6;

    this.#container.setPosition(startX, startY);
    this.#container.setAlpha(1);
    this.#isVisible = true;
  }

  /**
   * @returns {void}
   */
  hide() {
    this.#container.setAlpha(0);
    this.#selectedMenuOptionIndex = 0;
    this.#moveMenuCursor(DIRECTION.NONE);
    this.#isVisible = false;
  }

  /**
   * @param {import('../../common/direction.js').Direction|'OK'|'CANCEL'} input
   * @returns {void}
   */
  handlePlayerInput(input) {
    if (input === 'CANCEL') {
      this.hide();
      return;
    }

    if (input === 'OK') {
      this.#handleSelectedMenuOption();
      return;
    }

    // Update selected menu option based on player input
    this.#moveMenuCursor(input);
  }

  /**
   * @returns {Phaser.GameObjects.Graphics}
   */
  #createGraphics() {
    const g = this.#scene.add.graphics();
    const menuColor = this.#getMenuColorsFromDataManager();

    console.log('menuColor', menuColor);
    g.fillStyle(menuColor.main, 1);
    g.fillRect(1, 0, this.#width - 1, this.#height - 1);
    g.lineStyle(8, menuColor.border, 1);
    g.strokeRect(0, 0, this.#width, this.#height);
    g.setAlpha(0.75);

    return g;
  }

  /**
   * @param {import('../../common/direction.js').Direction} direction
   * @returns {void}
   */
  #moveMenuCursor(direction) {
    switch (direction) {
      case DIRECTION.UP:
        this.#selectedMenuOptionIndex -= 1;
        if (this.#selectedMenuOptionIndex < 0) {
          this.#selectedMenuOptionIndex = this.#availableMenuOptions.length - 1;
        }
        break;
      case DIRECTION.DOWN:
        this.#selectedMenuOptionIndex += 1;
        if (
          this.#selectedMenuOptionIndex >
          this.#availableMenuOptions.length - 1
        ) {
          this.#selectedMenuOptionIndex = 0;
        }
        break;
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
        return;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(direction);
    }
    const x = 20 + this.#padding;
    const y = 28 + this.#padding + this.#selectedMenuOptionIndex * 50;

    this.#userInputCursor.setPosition(x, y);
  }

  /**
   * @returns {void}
   */
  #handleSelectedMenuOption() {
    this.#selectedMenuOption =
      this.#availableMenuOptions[this.#selectedMenuOptionIndex];
  }

  /**
   * @returns {{ main: number; border: number; }}
   */
  #getMenuColorsFromDataManager() {
    /** @type {import('../../common/options.js').MenuColorOptions} */
    const chosenMenuColor = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR
    );
    if (chosenMenuColor === undefined) {
      return MENU_COLOR[1];
    }

    switch (chosenMenuColor) {
      case 0:
        return MENU_COLOR[1];
      case 1:
        return MENU_COLOR[2];
      case 2:
        return MENU_COLOR[3];
      default:
        exhaustiveGuard(chosenMenuColor);
    }
  }
}
