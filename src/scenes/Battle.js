import Phaser, { Scene } from 'phaser';
import {
  BATTLE_ASSET_KEYS,
  CLASSES_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { SCENE_KEYS } from './scene-keys.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';
import { Background } from '../battle/background.js';
import { Healthbar } from '../battle/ui/healthbar.js';

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
    const background = new Background(this);
    background.showForest();

    // Render out the player and enemy monsters
    this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
    this.add.image(256, 276, CLASSES_ASSET_KEYS.BERSEKER, 0);

    // Render out the player health bar
    const playerHealthBar = new Healthbar(this, 34, 34);
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
      playerHealthBar.container,
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
    const enemyHealthBar = new Healthbar(this, 34, 34);
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
      enemyHealthBar.container,
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
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    playerHealthBar.setMeterPercentageAnimated(0.5, {
      duration: 3000,
      callback: () => {
        console.log('animation completed');
      },
    });
  }

  update() {
    // const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
    //   this.#cursorKeys.space
    // );
    const wasEnterKeyPressed = Phaser.Input.Keyboard.JustDown(this.enterKey);
    const wasEscapeKeyPressed = Phaser.Input.Keyboard.JustDown(this.escapeKey);

    if (wasEnterKeyPressed) {
      this.#battleMenu.handlePlayerInput('OK');

      //Check if the player selected and attack, and update display text
      if (this.#battleMenu.selectedAttack === undefined) {
        return;
      }

      console.log(
        `Player selected the following move: ${this.#battleMenu.selectedAttack}`
      );
      this.#battleMenu.hideMonsterAttackSubMenu();
      this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
        ['Your monster attacks the enemy'],
        () => {
          this.#battleMenu.showMainBattleMenu();
        }
      );
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
}
