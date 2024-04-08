import { CHARACTER_ENTITY_ASSET_KEYS } from '../../assets/asset-keys.js';
import { DIRECTION } from '../../common/direction.js';
import { exhaustiveGuard } from '../../utils/guard.js';
import { Character } from './character.js';

/**
 * @typedef {Omit<import('./character.js').CharacterConfig, 'assetKey' | 'idleFrameConfig'>} PlayerConfig
 */

export class Player extends Character {
  /**
   *
   * @param {PlayerConfig} config
   */
  constructor(config) {
    super({
      ...config,
      assetKey: CHARACTER_ENTITY_ASSET_KEYS.PLAYER,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: 1,
        UP: 10,
        NONE: 1,
        LEFT: 4,
        RIGHT: 7,
      },
    });
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
            `PLAYER_${this._direction}`
        ) {
          this._phaserGameObject.play(`PLAYER_${this._direction}`);
        }
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }
}
