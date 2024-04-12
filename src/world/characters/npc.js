import { CHARACTER_ENTITY_ASSET_KEYS } from '../../assets/asset-keys.js';
import { DIRECTION } from '../../common/direction.js';
import { exhaustiveGuard } from '../../utils/guard.js';
import { Character } from './character.js';

/**
 * @typedef {keyof typeof NPC_MOVEMENT_PATTERN} NpcMovementPattern
 */

/** @enum {NpcMovementPattern} */
export const NPC_MOVEMENT_PATTERN = Object.freeze({
  IDLE: 'IDLE',
  CLOCKWISE: 'CLOCKWISE',
});

/**
 * @typedef NPCPath
 * @type {Object.<number, import('../../types/typedef.js').Coordinate>}
 */

/**
 * @typedef NPCConfigProps
 * @type {object}
 * @property {number} frame
 * @property {string[]} messages
 * @property {NPCPath} npcPath
 * @property {NpcMovementPattern} movementPattern
 */

/**
 * @typedef {Omit<import('./character.js').CharacterConfig, 'assetKey' | 'idleFrameConfig'> & NPCConfigProps} NPCConfig
 */

export class NPC extends Character {
  /** @type {string[]} */
  #messages;
  /** @type {boolean} */
  #talkingToPlayer;
  /** @type {NPCPath} */
  #npcPath;
  /** @type {number} */
  #currentPathIndex;
  /** @type {NpcMovementPattern} */
  #movementPattern;
  /** @type {number} */
  #lastMovementTime;

  /**
   *
   * @param {NPCConfig} config
   */
  constructor(config) {
    super({
      ...config,
      assetKey: CHARACTER_ENTITY_ASSET_KEYS.NPC,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 9,
        NONE: config.frame,
        LEFT: config.frame + 3,
        RIGHT: config.frame + 6,
      },
    });

    this.#messages = config.messages;
    this.#talkingToPlayer = false;
    this.#npcPath = config.npcPath;
    this.#currentPathIndex = 0;
    this.#movementPattern = config.movementPattern;
    this.#lastMovementTime = Phaser.Math.Between(3500, 5000);
  }

  /** @type {string[]} */
  get messages() {
    return [...this.#messages];
  }

  /** @type {boolean} */
  get isTalkingToPlayer() {
    return this.#talkingToPlayer;
  }

  /**
   * @param {boolean} val
   */
  set isTalkingToPlayer(val) {
    this.#talkingToPlayer = val;
  }

  /**
   *
   * @param {import('../../common/direction.js').Direction} playerDirection
   * @returns {void}
   */
  facePlayer(playerDirection) {
    switch (playerDirection) {
      case DIRECTION.DOWN:
        this._phaserGameObject.setFrame(this._idleFrameConfig.UP);
        break;
      case DIRECTION.LEFT:
        this._phaserGameObject.setFrame(this._idleFrameConfig.RIGHT);
        break;
      case DIRECTION.RIGHT:
        this._phaserGameObject.setFrame(this._idleFrameConfig.LEFT);
        break;
      case DIRECTION.UP:
        this._phaserGameObject.setFrame(this._idleFrameConfig.DOWN);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(playerDirection);
    }
  }

  /**
   * @param {DOMHighResTimeStamp} time
   * @returns {void}
   */
  update(time) {
    if (this._isMoving) {
      return;
    }

    if (this.#talkingToPlayer) {
      return;
    }
    super.update(time);

    if (this.#movementPattern === NPC_MOVEMENT_PATTERN.IDLE) {
      return;
    }

    if (this.#lastMovementTime < time) {
      /** @type {import('../../common/direction.js').Direction} */
      let characterDirection = DIRECTION.NONE;

      let nextPosition = this.#npcPath[this.#currentPathIndex + 1];

      const prevPosition = this.#npcPath[this.#currentPathIndex];

      if (
        prevPosition.x !== this._phaserGameObject.x ||
        prevPosition.y !== this._phaserGameObject.y
      ) {
        nextPosition = this.#npcPath[this.#currentPathIndex];
      } else {
        if (nextPosition === undefined) {
          nextPosition = this.#npcPath[0];
          this.#currentPathIndex = 0;
        } else {
          this.#currentPathIndex = this.#currentPathIndex + 1;
        }
      }

      if (nextPosition.x > this._phaserGameObject.x) {
        characterDirection = DIRECTION.RIGHT;
      } else if (nextPosition.x < this._phaserGameObject.x) {
        characterDirection = DIRECTION.LEFT;
      } else if (nextPosition.y < this._phaserGameObject.y) {
        characterDirection = DIRECTION.UP;
      } else if (nextPosition.y > this._phaserGameObject.y) {
        characterDirection = DIRECTION.DOWN;
      }

      this.moveCharacter(characterDirection);
      this.#lastMovementTime = time + Phaser.Math.Between(1000, 3000);
    }
  }

  /**
   * @param {import('../../common/direction.js').Direction} direction
   * @returns {void}
   */
  moveCharacter(direction) {
    super.moveCharacter(direction);

    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        if (
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !==
            `NPC_1_${this._direction}`
        ) {
          this._phaserGameObject.play(`NPC_1_${this._direction}`);
        }
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }
}
