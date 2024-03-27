import Phaser, { Scene } from 'phaser';
import {
  CLASSES_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { Background } from '../battle/background.js';
import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster.js';
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';
import { SKIP_BATTLE_ANIMATIONS } from '../config.js';
import { StateMachine } from '../utils/state-machine.js';
import { SCENE_KEYS } from './scene-keys.js';

const BATTLE_STATES = Object.freeze({
  INTRO: 'INTRO',
  PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
  BRING_OUT_MONSTER: 'BRING_OUT_MONSTER',
  PLAYER_INPUT: 'PLAYER_INPUT',
  ENEMY_INPUT: 'ENEMY_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
  FLEE_ATTEMPT: ' FLEE_ATTEMPT',
});

export default class Battle extends Scene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  #cursorKeys;
  /** @type {EnemyBattleMonster} */
  #activeEnemyMonster;
  /** @type {PlayerBattleMonster} */
  #activePlayerMonster;
  /** @type {number} */
  #activePlayerAttackIndex;
  /** @type  {StateMachine} */
  #battleStateMachine;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  init() {
    this.#activePlayerAttackIndex = -1;
  }

  create() {
    console.log(`[${Battle.name}:create] invoked`);
    // Create main background
    const background = new Background(this);
    background.showForest();

    // Render out the player and enemy monsters
    this.#activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [1],
        baseAttack: 15,
        currentLevel: 5,
      },
      skipBattleAnimation: SKIP_BATTLE_ANIMATIONS,
    });

    this.#activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: CLASSES_ASSET_KEYS.BERSEKER,
        assetKey: CLASSES_ASSET_KEYS.BERSEKER,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [2],
        baseAttack: 5,
        currentLevel: 5,
      },
      skipBattleAnimation: SKIP_BATTLE_ANIMATIONS,
    });

    // Render out the main info and sub info panes
    this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
    this.#createBattleStateMachine();

    // Add Cursor keys
    this.#cursorKeys = this.input.keyboard.createCursorKeys();

    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
  }

  update() {
    this.#battleStateMachine.update();
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursorKeys.space
    );
    // const wasEnterKeyPressed = Phaser.Input.Keyboard.JustDown(this.enterKey);
    const wasEscapeKeyPressed = Phaser.Input.Keyboard.JustDown(this.escapeKey);

    // Limit input based on the current battle state we are in
    // If we are not in the right battle state, return early and do not process input
    if (
      wasSpaceKeyPressed &&
      (this.#battleStateMachine.currentStateName ===
        BATTLE_STATES.PRE_BATTLE_INFO ||
        this.#battleStateMachine.currentStateName ===
          BATTLE_STATES.POST_ATTACK_CHECK ||
        this.#battleStateMachine.currentStateName ===
          BATTLE_STATES.FLEE_ATTEMPT)
    ) {
      this.#battleMenu.handlePlayerInput('OK');
      return;
    }

    if (
      this.#battleStateMachine.currentStateName != BATTLE_STATES.PLAYER_INPUT
    ) {
      return;
    }

    if (wasSpaceKeyPressed) {
      this.#battleMenu.handlePlayerInput('OK');

      //Check if the player selected and attack, and update display text
      if (this.#battleMenu.selectedAttack === undefined) {
        return;
      }

      this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;

      if (!this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex]) {
        return;
      }

      console.log(
        `Player selected the following move: ${this.#battleMenu.selectedAttack}`
      );

      this.#battleMenu.hideMonsterAttackSubMenu();
      this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
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

  #playerAttack() {
    this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
      `${this.#activePlayerMonster.name} used ${
        this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.#activeEnemyMonster.playTakeDamageAnimation(() => {
            this.#activeEnemyMonster.takeDamage(
              this.#activePlayerMonster.baseAttack,
              () => {
                this.#enemyAttack();
              }
            );
          });
        });
      },
      SKIP_BATTLE_ANIMATIONS
    );
  }

  #enemyAttack() {
    if (this.#activeEnemyMonster.isFainted) {
      this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }

    this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
      `for ${this.#activeEnemyMonster.name} used ${
        this.#activeEnemyMonster.attacks[0].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.#activePlayerMonster.playTakeDamageAnimation(() => {
            this.#activePlayerMonster.takeDamage(
              this.#activeEnemyMonster.baseAttack,
              () => {
                this.#battleStateMachine.setState(
                  BATTLE_STATES.POST_ATTACK_CHECK
                );
              }
            );
          });
        });
      },
      SKIP_BATTLE_ANIMATIONS
    );
  }

  #postBattleSequenceCheck() {
    if (this.#activeEnemyMonster.isFainted) {
      this.#activeEnemyMonster.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `Wild ${this.#activeEnemyMonster.name} fainted`,
            'You have gain some experience',
          ],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      });

      return;
    }

    if (this.#activePlayerMonster.isFainted) {
      this.#activePlayerMonster.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `${this.#activePlayerMonster.name} fainted`,
            'You have no more warriors, escaping to safety...',
          ],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      });
      return;
    }

    this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  #transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
      }
    );
  }

  #createBattleStateMachine() {
    this.#battleStateMachine = new StateMachine('battle', this);

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // Wait for any scene setup and transitions to complete
        this.time.delayedCall(500, () => {
          this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // Wait for enemy monster to appear on the screen and notify player about the wild monster
        this.#activeEnemyMonster.playMonsterAppearAnimation(() => {
          this.#activeEnemyMonster.playMonsterHealthBarAppearAnimation(
            () => undefined
          );
          this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`wild ${this.#activeEnemyMonster.name} appeared!`],
            () => {
              // Wait for text animation to complete and move to next state
              this.#battleStateMachine.setState(
                BATTLE_STATES.BRING_OUT_MONSTER
              );
            },
            SKIP_BATTLE_ANIMATIONS
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        // Wait for player monster to appear on the screen and notify the player about monster
        this.#activePlayerMonster.playMonsterAppearAnimation(() => {
          this.#activePlayerMonster.playMonsterHealthBarAppearAnimation(
            () => undefined
          );
          this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
            `go ${this.#activePlayerMonster.name}!`,
            () => {
              // Wait for text animation to complete and move to next state
              this.time.delayedCall(1200, () => {
                this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            },
            SKIP_BATTLE_ANIMATIONS
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.#battleMenu.showMainBattleMenu();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        //TODO: Add feature in the future update
        // Pick a randome move fro the enemy monser, and in the future implement some type of AI behavor

        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // General battle flow
        this.#playerAttack();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.#postBattleSequenceCheck();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.#transitionToNextScene();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [`You got away safely!`],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      },
    });

    //Start the state machine
    this.#battleStateMachine.setState('INTRO');
  }
}
