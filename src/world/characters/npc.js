import { CHARACTER_ENTITY_ASSET_KEYS } from '../../assets/asset-keys.js';
import { DIRECTION } from '../../common/direction.js';
import { exhaustiveGuard } from '../../utils/guard.js';
import { Character } from './character.js';

/**
 * @typedef NPCConfigProps
 * @type {object}
 * @property {number} frame
 * @property {string[]} messages
 */

/**
 * @typedef {Omit<import('./character.js').CharacterConfig, 'assetKey' | 'idleFrameConfig'> & NPCConfigProps} NPCConfig
 */

export class NPC extends Character {
  /** @type {string[]} */
  #messages;
  /** @type {boolean} */
  #talkingToPlayer;

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
}
