import Phaser, { Scene } from 'phaser';
import {
  CHARACTER_ASSET_KEYS,
  CLASSES_ASSET_KEYS,
} from '../assets/asset-keys.js';
//import { IceShard } from '../battle/attacks/ice-shard.js';
import {
  ATTACK_TARGET,
  AttackManager,
} from '../battle/attacks/attack-manager.js';
import { Background } from '../battle/background.js';
import { EnemyBattleCharacter } from '../battle/characters/enemy-battle-character.js';
import { PlayerBattleCharacter } from '../battle/characters/player-battle-character.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';
import { BATTLE_SCENE_OPTIONS } from '../common/options.js';
import { Controls } from '../utils/controls.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import { createSceneTransition } from '../utils/scene-transition.js';
import { StateMachine } from '../utils/state-machine.js';
import { SCENE_KEYS } from './scene-keys.js';

const BATTLE_STATES = Object.freeze({
  INTRO: 'INTRO',
  PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
  BRING_OUT_CHARACTER: 'BRING_OUT_CHARACTER',
  PLAYER_INPUT: 'PLAYER_INPUT',
  ENEMY_INPUT: 'ENEMY_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
  FLEE_ATTEMPT: ' FLEE_ATTEMPT',
});

/**
 * @typedef BattleSceneData
 * @type {object}
 * @property {import('../types/typedef.js').Character[]} playerCharacters
 * @property {import('../types/typedef.js').Character[]} enemyCharacters
 */

export default class Battle extends Scene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {Controls} */
  #controls;
  /** @type {EnemyBattleCharacter} */
  #activeEnemyCharacter;
  /** @type {PlayerBattleCharacter} */
  #activePlayerCharacter;
  /** @type {number} */
  #activePlayerAttackIndex;
  /** @type  {StateMachine} */
  #battleStateMachine;
  /** @type  {AttackManager}} */
  #attackManager;
  /** @type {boolean} */
  #skipAnimations;
  /** @type {number} */
  #activeEnemyAttackIndex;
  /** @type {BattleSceneData} */
  #sceneData;
  /** @type {number} */
  #activePlayerMonsterPartyIndex;
  /** @type {boolean} */
  #playerKnockedOut;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  init() {
    this.#activePlayerAttackIndex = -1;

    /** @type {import('../common/options.js').BattleSceneMenuOptions | undefined} */
    const chosenBattleSceneOption = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS
    );
    if (
      chosenBattleSceneOption === undefined ||
      chosenBattleSceneOption === BATTLE_SCENE_OPTIONS.ON
    ) {
      this.#skipAnimations = false;
      return;
    }
    this.#skipAnimations = true;
    this.#playerKnockedOut = false;
  }

  create() {
    console.log(`[${Battle.name}:create] invoked`);
    // Create main background
    const background = new Background(this);
    background.showMeadow();

    // Render out the player and enemy characters
    this.#activeEnemyCharacter = new EnemyBattleCharacter({
      scene: this,
      characterDetails: {
        name: CHARACTER_ASSET_KEYS.FERNBITE,
        assetKey: CHARACTER_ASSET_KEYS.FERNBITE,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [1],
        baseAttack: 15,
        currentLevel: 5,
      },
      skipBattleAnimation: this.#skipAnimations,
    });

    this.#activePlayerCharacter = new PlayerBattleCharacter({
      scene: this,
      characterDetails: {
        name: CLASSES_ASSET_KEYS.BERSEKER,
        assetKey: CLASSES_ASSET_KEYS.BERSEKER,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [2],
        baseAttack: 5,
        currentLevel: 5,
      },
      skipBattleAnimation: this.#skipAnimations,
    });

    // Render out the main info and sub info panes
    this.#battleMenu = new BattleMenu(
      this,
      this.#activePlayerCharacter,
      this.#skipAnimations
    );
    this.#createBattleStateMachine();
    this.#attackManager = new AttackManager(this, this.#skipAnimations);

    // Add Cursor keys
    this.#controls = new Controls(this);
    this.#controls.lockInput = true;

    // this.escapeKey = this.input.keyboard.addKey(
    //   Phaser.Input.Keyboard.KeyCodes.ESC
    // );
    // this.enterKey = this.input.keyboard.addKey(
    //   Phaser.Input.Keyboard.KeyCodes.ENTER
    // );
  }

  update() {
    this.#battleStateMachine.update();

    if (this.#controls.isInputLocked) {
      return;
    }

    const wasSpaceKeyPressed = this.#controls.wasSpaceKeyPressed();
    // const wasEnterKeyPressed = Phaser.Input.Keyboard.JustDown(this.enterKey);
    // const wasEscapeKeyPressed = Phaser.Input.Keyboard.JustDown(this.escapeKey);

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

      if (!this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex]) {
        return;
      }

      console.log(
        `Player selected the following move: ${this.#battleMenu.selectedAttack}`
      );

      this.#battleMenu.hideCharacterAttackSubMenu();
      this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
    }

    if (this.#controls.wasBackKeyPressed()) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    const selectedDirection = this.#controls.getDirectionKeyJustPressed();

    if (selectedDirection != DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  #playerAttack() {
    this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
      `${this.#activePlayerCharacter.name} used ${
        this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.#attackManager.playAttackAnimation(
            this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex]
              .animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.#activeEnemyCharacter.playTakeDamageAnimation(() => {
                this.#activeEnemyCharacter.takeDamage(
                  this.#activePlayerCharacter.baseAttack,
                  () => {
                    this.#enemyAttack();
                  }
                );
              });
            }
          );
        });
      }
    );
  }

  #enemyAttack() {
    if (this.#activeEnemyCharacter.isFainted) {
      this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }

    this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
      `for ${this.#activeEnemyCharacter.name} used ${
        this.#activeEnemyCharacter.attacks[0].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.#attackManager.playAttackAnimation(
            this.#activeEnemyCharacter.attacks[0].animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.#activePlayerCharacter.playTakeDamageAnimation(() => {
                this.#activePlayerCharacter.takeDamage(
                  this.#activeEnemyCharacter.baseAttack,
                  () => {
                    this.#battleStateMachine.setState(
                      BATTLE_STATES.POST_ATTACK_CHECK
                    );
                  }
                );
              });
            }
          );
        });
      }
    );
  }

  #postBattleSequenceCheck() {
    if (this.#activeEnemyCharacter.isFainted) {
      this.#activeEnemyCharacter.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `Wild ${this.#activeEnemyCharacter.name} fainted`,
            'You have gain some experience',
          ],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          }
        );
      });

      return;
    }

    if (this.#activePlayerCharacter.isFainted) {
      this.#activePlayerCharacter.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `${this.#activePlayerCharacter.name} fainted`,
            'You have no more warriors, escaping to safety...',
          ],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          }
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
        this.scene.start(SCENE_KEYS.WORLD_SCENE);
      }
    );
  }

  #createBattleStateMachine() {
    this.#battleStateMachine = new StateMachine('battle', this);

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // Wait for any scene setup and transitions to complete
        createSceneTransition(this, {
          skipSceneTransition: this.#skipAnimations,
          callback: () => {
            this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
          },
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // Wait for enemy character to appear on the screen and notify player about the wild character
        this.#activeEnemyCharacter.playCharacterAppearAnimation(() => {
          this.#activeEnemyCharacter.playCharacterHealthBarAppearAnimation(
            () => undefined
          );
          this.#controls.lockInput = false;
          this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`Wild ${this.#activeEnemyCharacter.name} appeared!`],
            () => {
              // Wait for text animation to complete and move to next state
              this.#battleStateMachine.setState(
                BATTLE_STATES.BRING_OUT_CHARACTER
              );
            }
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_CHARACTER,
      onEnter: () => {
        // Wait for player character to appear on the screen and notify the player about character
        this.#activePlayerCharacter.playCharacterAppearAnimation(() => {
          this.#activePlayerCharacter.playCharacterHealthBarAppearAnimation(
            () => undefined
          );
          this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
            `Go ${this.#activePlayerCharacter.name}!`,
            () => {
              // Wait for text animation to complete and move to next state
              this.time.delayedCall(1200, () => {
                this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            }
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
          }
        );
      },
    });

    //Start the state machine
    this.#battleStateMachine.setState('INTRO');
  }
}
