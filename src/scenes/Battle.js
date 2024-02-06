import Phaser, { Scene } from 'phaser';
import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  CLASSES_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { SCENE_KEYS } from './scene-keys.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';

export default class Battle extends Scene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  #cursorKeys;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  create() {
    console.log(`[${Battle.name}:create] invoked`);
    // Create main background
    this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);

    // Render out the player and enemy monsters
    this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
    this.add.image(256, 276, CLASSES_ASSET_KEYS.BERSEKER, 0);

    // Render out the player health bar
    const playerMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.CARNODUSK,
      {
        color: '#7E3D3F',
        fontSize: '32px',
      }
    );

    this.add.container(561, 320, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0),
      playerMonsterName,
      this.#createHealthBar(34, 34),
      this.add.text(playerMonsterName.width + 35, 23, 'L5', {
        color: '#ED474B',
        fontSize: '28px',
      }),
      this.add.text(30, 55, 'HP', {
        color: '#ED474B',
        fontSize: '24px',
        fontStyle: 'italic',
      }),
      this.add
        .text(443, 80, '25/25', {
          color: '#7E3D3F',
          fontSize: '16px',
        })
        .setOrigin(1, 0),
    ]);

    // Render out the enemy health bar
    const enemyMonsterName = this.add.text(
      30,
      20,
      CLASSES_ASSET_KEYS.BERSEKER,
      {
        color: '#7E3D3F',
        fontSize: '32px',
      }
    );

    this.add.container(6, 6, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0)
        .setScale(1, 0.8),
      enemyMonsterName,
      this.#createHealthBar(34, 34),
      this.add.text(enemyMonsterName.width + 35, 23, 'L5', {
        color: '#ED474B',
        fontSize: '28px',
      }),
      this.add.text(30, 55, 'HP', {
        color: '#ED474B',
        fontSize: '24px',
        fontStyle: 'italic',
      }),
    ]);

    // Render out the main info and sub info panes
    this.#battleMenu = new BattleMenu(this);
    this.#battleMenu.showMainBattleMenu();

    // Add Cursor keys
    this.#cursorKeys = this.input.keyboard.createCursorKeys();
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
  }

  update() {
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursorKeys.space
    );

    const wasEscapeKeyPressed = Phaser.Input.Keyboard.JustDown(this.escapeKey);

    if (wasSpaceKeyPressed) {
      this.#battleMenu.handlePlayerInput('OK');
      return;
    }

    if (wasEscapeKeyPressed) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    /** @type {import('../common/direction.js').Direction} */
    let selectedDirection = DIRECTION.NONE;

    if (this.#cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.#cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (this.#cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.#cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }

    if (selectedDirection != DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  /**
   *
   * @param {number} x the x position to place the health bar container
   * @param {number} y the y position to place the health bar container
   * @returns {Phaser.GameObjects.Container}
   *
   */

  #createHealthBar(x, y) {
    //This is to make the bar shorter
    const scaleY = 0.7;

    const leftCap = this.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);

    const middle = this.add
      .image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);

    middle.displayWidth = 360;

    const rightCap = this.add
      .image(middle.x + middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);

    return this.add.container(x, y, [leftCap, middle, rightCap]);
  }
}
