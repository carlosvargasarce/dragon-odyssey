import Phaser from 'phaser';
//import { IceShard } from '../battle/attacks/ice-shard.js';
import { AUDIO_ASSET_KEYS } from '../assets/asset-keys.js';
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
import { playBackgroundMusic, playSoundFx } from '../utils/audio-utils.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import { DataUtils } from '../utils/data-utils.js';
import { createSceneTransition } from '../utils/scene-transition.js';
import { StateMachine } from '../utils/state-machine.js';
import { BaseScene } from './base.js';
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

export default class Battle extends BaseScene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {EnemyBattleCharacter} */
  #activeEnemyCharacter;
  /** @type {PlayerBattleCharacter} */
  #activePlayerCharacter;
  /** @type {number} */
  #activePlayerAttackIndex;
  /** @type  {StateMachine} */
  #battleStateMachine;
  /** @type  {AttackManager} */
  #attackManager;
  /** @type {boolean} */
  #skipAnimations;
  /** @type {number} */
  #activeEnemyAttackIndex;
  /** @type {BattleSceneData} */
  #sceneData;
  /** @type {number} */
  #activePlayerCharacterPartyIndex;
  /** @type {boolean} */
  #playerKnockedOut;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  /**
   * @param {BattleSceneData} data
   * @returns {void}
   */
  init(data) {
    super.init(data);
    this.#sceneData = data;

    // Added for testing from preload scene
    if (Object.keys(data).length === 0) {
      this.#sceneData = {
        enemyCharacters: [DataUtils.getEnemyById(this, 1)],
        playerCharacters: [
          dataManager.store.get(DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY)[0],
        ],
      };
    }

    this.#activePlayerAttackIndex = -1;
    this.#activeEnemyAttackIndex = -1;
    this.#activePlayerCharacterPartyIndex = 0;

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
    super.create();

    // Create a red rectangle that covers the entire screen
    this.redFlashGraphics = this.add.graphics({
      fillStyle: { color: 0xff0000, alpha: 0.3 },
    });
    this.redFlashGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
    this.redFlashGraphics.setDepth(100); // Ensure it's on top of other game objects
    this.redFlashGraphics.setVisible(false); // Start invisible

    // Create main background
    const background = new Background(this);
    background.showMeadow();

    let enemyPrototype = new EnemyBattleCharacter({
      scene: this,
      characterDetails: DataUtils.getEnemyById(this, 1),
      skipBattleAnimations: this.#skipAnimations,
    });

    // Render out the player and enemy characters
    //Clone is being use for enemies using prototype pattern, in the future if we want to spawn
    //multiple enemies we could stick with this approach
    this.#activeEnemyCharacter = enemyPrototype.clone();

    this.#activePlayerCharacter = new PlayerBattleCharacter({
      scene: this,
      characterDetails: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY
      )[0],
      skipBattleAnimations: this.#skipAnimations,
    });

    //Listen for health events
    this.#activePlayerCharacter.eventManager.subscribe(
      'healthCritical',
      this.onHealthCritical.bind(this)
    );

    // Render out the main info and sub info panes
    this.#battleMenu = new BattleMenu(
      this,
      this.#activePlayerCharacter,
      this.#skipAnimations
    );
    this.#createBattleStateMachine();
    this.#attackManager = new AttackManager(this, this.#skipAnimations);

    // Add Cursor keys
    this._controls.lockInput = true;

    // this.escapeKey = this.input.keyboard.addKey(
    //   Phaser.Input.Keyboard.KeyCodes.ESC
    // );
    // this.enterKey = this.input.keyboard.addKey(
    //   Phaser.Input.Keyboard.KeyCodes.ENTER
    // );
    playBackgroundMusic(this, AUDIO_ASSET_KEYS.BATTLE);
  }

  onHealthCritical(data) {
    this.flashRedAnimation();
    console.log(`Alert! Health is critical at ${data.health} points.`);
  }

  flashRedAnimation() {
    // Make the graphics visible and start a flashing effect
    this.redFlashGraphics.setVisible(true);
    this.tweens.add({
      targets: this.redFlashGraphics,
      alpha: 0, // Fade to invisible
      ease: 'Cubic.easeInOut', // Smooth transition
      duration: 300,
      repeat: 1, // Number of flashes
      yoyo: true, // Make it fade back in
      onComplete: () => {
        this.redFlashGraphics.setVisible(false);
        this.redFlashGraphics.alpha = 0.5; // Reset alpha after animation
      },
    });
  }

  /**
   * @returns {void}
   */
  update() {
    super.update();

    this.#battleStateMachine.update();

    if (this._controls.isInputLocked) {
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
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

      // check if the player used an item
      if (this.#battleMenu.wasItemUsed) {
        this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
        return;
      }

      // check if the player attempted to flee
      if (this.#battleMenu.isAttemptingToFlee) {
        this.#battleStateMachine.setState(BATTLE_STATES.FLEE_ATTEMPT);
        return;
      }

      //Check if the player selected and attack, and update display text
      if (this.#battleMenu.selectedAttack === undefined) {
        return;
      }

      this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;

      if (!this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex]) {
        return;
      }

      `Player selected the following move: ${
        this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex].name
      }`;

      this.#battleMenu.hideCharacterAttackSubMenu();
      this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
    }

    if (this._controls.wasBackKeyPressed()) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();

    if (selectedDirection !== DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  #playerAttack(callback) {
    if (this.#activePlayerCharacter.isFainted) {
      callback();
      return;
    }

    this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
      `${this.#activePlayerCharacter.name} used ${
        this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.time.delayedCall(100, () => {
            playSoundFx(
              this,
              this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex]
                .audioKey
            );
          });
          this.#attackManager.playAttackAnimation(
            this.#activePlayerCharacter.attacks[this.#activePlayerAttackIndex]
              .animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.#activeEnemyCharacter.playTakeDamageAnimation(() => {
                this.#activeEnemyCharacter.takeDamage(
                  this.#activePlayerCharacter.baseAttack,
                  () => {
                    callback();
                  }
                );
              });
            }
          );
        });
      }
    );
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  #enemyAttack(callback) {
    if (this.#activeEnemyCharacter.isFainted) {
      callback();
      return;
    }

    this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
      `for ${this.#activeEnemyCharacter.name} used ${
        this.#activeEnemyCharacter.attacks[this.#activeEnemyAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.time.delayedCall(100, () => {
            playSoundFx(
              this,
              this.#activeEnemyCharacter.attacks[this.#activeEnemyAttackIndex]
                .audioKey
            );
          });
          this.#attackManager.playAttackAnimation(
            this.#activeEnemyCharacter.attacks[this.#activeEnemyAttackIndex]
              .animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.#activePlayerCharacter.playTakeDamageAnimation(() => {
                this.#activePlayerCharacter.takeDamage(
                  this.#activeEnemyCharacter.baseAttack,
                  () => {
                    callback();
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
    // Update character details in scene data and data manager to align with changes from battle
    this.#sceneData.playerCharacters[
      this.#activePlayerCharacterPartyIndex
    ].currentHp = this.#activePlayerCharacter.currentHp;
    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY,
      this.#sceneData.playerCharacters
    );

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
            this.#playerKnockedOut = true;
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          }
        );
      });
      return;
    }

    if (this.#activePlayerCharacter.isFainted) {
      // Play character fainted animation and wait for animation to finish
      this.#activePlayerCharacter.playDeathAnimation(() => {
        // TODO: this will need to be updated once we support multiple characters
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `${this.#activePlayerCharacter.name} fainted.`,
            'You have no more characters, escaping to safety...',
          ],
          () => {
            this.#playerKnockedOut = true;
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          }
        );
      });
      return;
    }

    this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  #transitionToNextScene() {
    /** @type {import('./world.js').WorldSceneData} */
    const sceneDataToPass = {
      isPlayerKnockedOut: this.#playerKnockedOut,
    };

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.WORLD_SCENE, sceneDataToPass);
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
          this._controls.lockInput = false;
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
        this.#activeEnemyAttackIndex =
          this.#activeEnemyCharacter.pickRandomMove();
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // if item was used, only have enemy attack
        if (this.#battleMenu.wasItemUsed) {
          // TODO: enhance once we support multiple monsters
          this.#activePlayerCharacter.updateMonsterHealth(
            /** @type {import('../types/typedef.js').Character[]} */ (
              dataManager.store.get(DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY)
            )[0].currentHp
          );
          this.time.delayedCall(500, () => {
            this.#enemyAttack(() => {
              this.#battleStateMachine.setState(
                BATTLE_STATES.POST_ATTACK_CHECK
              );
            });
          });
          return;
        }

        // if player failed to flee, only have enemy attack
        if (this.#battleMenu.isAttemptingToFlee) {
          this.time.delayedCall(500, () => {
            this.#enemyAttack(() => {
              this.#battleStateMachine.setState(
                BATTLE_STATES.POST_ATTACK_CHECK
              );
            });
          });
          return;
        }

        const randomNumber = Phaser.Math.Between(0, 1);
        if (randomNumber === 0) {
          this.#playerAttack(() => {
            this.#enemyAttack(() => {
              this.#battleStateMachine.setState(
                BATTLE_STATES.POST_ATTACK_CHECK
              );
            });
          });
          return;
        }

        this.#enemyAttack(() => {
          this.#playerAttack(() => {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
          });
        });
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
        const randomNumber = Phaser.Math.Between(1, 10);
        if (randomNumber > 5) {
          // Player has run away successfully
          this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
            ['You got away safely!'],
            () => {
              this.time.delayedCall(200, () => {
                playSoundFx(this, AUDIO_ASSET_KEYS.FLEE);
                this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
              });
            }
          );
          return;
        }
        // Player failed to run away, allow enemy to take their turn
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          ['You failed to run away...'],
          () => {
            this.time.delayedCall(200, () => {
              this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
            });
          }
        );
      },
    });

    //Start the state machine
    this.#battleStateMachine.setState('INTRO');
  }
}
