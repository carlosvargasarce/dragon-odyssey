import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../assets/font-keys.js';
import { DIRECTION } from '../common/direction.js';
import { dataManager } from '../utils/data-manager.js';
import { exhaustiveGuard } from '../utils/guard.js';
import { NineSlice } from '../utils/nine-slice.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

const CANCEL_TEXT_DESCRIPTION = 'Close your bag, and go back to adventuring!';

const INVENTORY_ITEM_POSITION = Object.freeze({
  x: 50,
  y: 14,
  space: 50,
});

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const INVENTORY_TEXT_STYLE = {
  fontFamily: LATO_FONT_NAME,
  color: '#000000',
  fontSize: '30px',
};

/**
 * @typedef InventoryItemGameObjects
 * @type {object}
 * @property {Phaser.GameObjects.Text} [itemName]
 * @property {Phaser.GameObjects.Text} [quantitySign]
 * @property {Phaser.GameObjects.Text} [quantity]
 */

/**
 * @typedef {import('../types/typedef.js').InventoryItem & { gameObjects: InventoryItemGameObjects }} InventoryItemWithGameObjects
 */

/**
 * @typedef CustomInventory
 * @type {InventoryItemWithGameObjects[]}
 */

/**
 * @typedef InventorySceneData
 * @type {object}
 * @property {string} previousSceneName
 */

/**
 * @typedef InventorySceneWasResumedData
 * @type {object}
 * @property {boolean} itemUsed
 */

/**
 * @typedef InventorySceneItemUsedData
 * @type {object}
 * @property {boolean} itemUsed
 * @property {import('../types/typedef.js').Item} [item]
 */

export default class InventoryScene extends BaseScene {
  /** @type {InventorySceneData} */
  #sceneData;
  /** @type {NineSlice} */
  #nineSliceMainContainer;
  /** @type {Phaser.GameObjects.Text} */
  #selectedInventoryDescriptionText;
  /** @type {Phaser.GameObjects.Image} */
  #userInputCursor;
  /** @type {CustomInventory} */
  #inventory;
  /** @type {number} */
  #selectedInventoryOptionIndex;

  constructor() {
    super({
      key: SCENE_KEYS.INVENTORY_SCENE,
    });
  }

  /**
   * @param {InventorySceneData} data
   * @returns {void}
   */
  init(data) {
    super.init(data);

    this.#sceneData = data;
    this.#selectedInventoryOptionIndex = 0;
    const inventory = dataManager.getInventory(this);
    this.#inventory = inventory.map((inventoryItem) => {
      return {
        item: inventoryItem.item,
        quantity: inventoryItem.quantity,
        gameObjects: {},
      };
    });
    this.#nineSliceMainContainer = new NineSlice({
      cornerCutSize: 0,
      textureManager: this.sys.textures,
      assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND_SQUARE],
    });
  }

  /**
   * @returns {void}
   */
  create() {
    super.create();

    // Create custom background
    this.add
      .image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND)
      .setOrigin(0);
    this.add
      .image(40, 120, INVENTORY_ASSET_KEYS.INVENTORY_BAG)
      .setOrigin(0)
      .setScale(0.5);

    const container = this.#nineSliceMainContainer
      .createNineSliceContainer(
        this,
        700,
        360,
        UI_ASSET_KEYS.MENU_BACKGROUND_SQUARE
      )
      .setPosition(300, 20);
    const containerBackground = this.add
      .rectangle(4, 4, 692, 352, 0xffffff)
      .setOrigin(0)
      .setAlpha(0.9);
    container.add(containerBackground);

    const titleContainer = this.#nineSliceMainContainer
      .createNineSliceContainer(
        this,
        240,
        64,
        UI_ASSET_KEYS.MENU_BACKGROUND_SQUARE
      )
      .setPosition(64, 20);
    const titleContainerBackground = this.add
      .rectangle(4, 4, 232, 56, 0xffffff)
      .setOrigin(0)
      .setAlpha(0.9);
    titleContainer.add(titleContainerBackground);

    const textTitle = this.add
      .text(116, 32, 'Items', INVENTORY_TEXT_STYLE)
      .setOrigin(0.5);
    titleContainer.add(textTitle);

    // Create inventory text from available items
    this.#inventory.forEach((inventoryItem, index) => {
      const itemText = this.add.text(
        INVENTORY_ITEM_POSITION.x,
        INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space,
        inventoryItem.item.name,
        INVENTORY_TEXT_STYLE
      );
      const qty1Text = this.add.text(
        620,
        INVENTORY_ITEM_POSITION.y + 2 + index * INVENTORY_ITEM_POSITION.space,
        'x',
        {
          color: '#D22727',
          fontSize: '30px',
        }
      );
      const qty2Text = this.add.text(
        650,
        INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space,
        `${inventoryItem.quantity}`,
        INVENTORY_TEXT_STYLE
      );
      container.add([itemText, qty1Text, qty2Text]);
      inventoryItem.gameObjects = {
        itemName: itemText,
        quantity: qty2Text,
        quantitySign: qty1Text,
      };
    });

    // Create cancel text
    const cancelText = this.add.text(
      INVENTORY_ITEM_POSITION.x,
      INVENTORY_ITEM_POSITION.y +
        this.#inventory.length * INVENTORY_ITEM_POSITION.space,
      'Cancel',
      INVENTORY_TEXT_STYLE
    );
    container.add(cancelText);

    // Create player input cursor
    this.#userInputCursor = this.add
      .image(30, 30, UI_ASSET_KEYS.CURSOR)
      .setScale(1);
    container.add(this.#userInputCursor);

    // Create inventory description text
    this.#selectedInventoryDescriptionText = this.add.text(25, 420, '', {
      ...INVENTORY_TEXT_STYLE,
      ...{
        wordWrap: {
          width: this.scale.width - 18,
        },
        color: '#ffffff',
      },
    });
    this.#updateItemDescriptionText();
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
      this.#goBackToPreviousScene(false);
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      if (this.#isCancelButtonSelected()) {
        this.#goBackToPreviousScene(false);
        return;
      }

      if (this.#inventory[this.#selectedInventoryOptionIndex].quantity < 1) {
        return;
      }

      this._controls.lockInput = true;
      // Pause this scene and launch the monster party scene
      /** @type {import('./allies.js').CharacterPartySceneData} */
      const sceneDataToPass = {
        previousSceneName: SCENE_KEYS.INVENTORY_SCENE,
        itemSelected: this.#inventory[this.#selectedInventoryOptionIndex].item,
      };
      this.scene.launch(SCENE_KEYS.ALLYS_SCENE, sceneDataToPass);
      this.scene.pause(SCENE_KEYS.INVENTORY_SCENE);

      // In a future update
      // TODO: add submenu for accept/cancel after picking an item
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.#movePlayerInputCursor(selectedDirection);
      this.#updateItemDescriptionText();
    }
  }

  /**
   * @param {Phaser.Scenes.Systems} sys
   * @param {InventorySceneWasResumedData | undefined} [data]
   * @returns {void}
   */
  handleSceneResume(sys, data) {
    super.handleSceneResume(sys, data);

    if (!data || !data.itemUsed) {
      return;
    }

    const selectedItem = this.#inventory[this.#selectedInventoryOptionIndex];
    selectedItem.quantity -= 1;
    selectedItem.gameObjects.quantity.setText(`${selectedItem.quantity}`);

    // TODO: add logic to handle when the last of an item was just used

    dataManager.updateInventory(this.#inventory);

    // If previous scene was battle scene, switch back to that scene
    if (this.#sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE) {
      this.#goBackToPreviousScene(true, selectedItem.item);
    }
  }

  /**
   * @returns {void}
   */
  #updateItemDescriptionText() {
    if (this.#isCancelButtonSelected()) {
      this.#selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION);
      return;
    }

    this.#selectedInventoryDescriptionText.setText(
      this.#inventory[this.#selectedInventoryOptionIndex].item.description
    );
  }

  /**
   * @returns {boolean}
   */
  #isCancelButtonSelected() {
    return this.#selectedInventoryOptionIndex === this.#inventory.length;
  }

  /**
   * @param {boolean} wasItemUsed
   * @param {import('../types/typedef.js').Item} [item]
   * @returns {void}
   */
  #goBackToPreviousScene(wasItemUsed, item) {
    this._controls.lockInput = true;
    this.scene.stop(SCENE_KEYS.INVENTORY_SCENE);
    /** @type {InventorySceneItemUsedData} */
    const sceneDataToPass = {
      itemUsed: wasItemUsed,
      item,
    };
    this.scene.resume(this.#sceneData.previousSceneName, sceneDataToPass);
  }

  /**
   * @param {import('../common/direction.js').Direction} direction
   * @returns {void}
   */
  #movePlayerInputCursor(direction) {
    switch (direction) {
      case DIRECTION.UP:
        this.#selectedInventoryOptionIndex -= 1;
        if (this.#selectedInventoryOptionIndex < 0) {
          this.#selectedInventoryOptionIndex = this.#inventory.length;
        }
        break;
      case DIRECTION.DOWN:
        this.#selectedInventoryOptionIndex += 1;
        if (this.#selectedInventoryOptionIndex > this.#inventory.length) {
          this.#selectedInventoryOptionIndex = 0;
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

    const y = 30 + this.#selectedInventoryOptionIndex * 50;

    this.#userInputCursor.setY(y);
  }
}
