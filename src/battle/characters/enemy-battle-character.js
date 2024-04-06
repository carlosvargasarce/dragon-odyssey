import { BattleCharacter } from './battle-character.js';

/**
 * @type {import("../../types/typedef.js").Coordinate}
 */
const ENEMY_POSITION = Object.freeze({
  x: 768,
  y: 185,
});

const SCALE = 1;

export class EnemyBattleCharacter extends BattleCharacter {
  /**
   *
   * @param {import("../../types/typedef.js").BattleCharacterConfig} config
   */
  constructor(config) {
    super(
      { ...config, scaleHealthBarBackgroundImageByY: 0.4 },
      ENEMY_POSITION,
      SCALE
    );
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playCharacterAppearAnimation(callback) {
    const startXPos = -30;
    const endXPos = ENEMY_POSITION.x;
    this._phaserGameObject.setPosition(startXPos, ENEMY_POSITION.y);
    this._phaserGameObject.setAlpha(1);

    if (this._skipBattleAnimations) {
      this._phaserGameObject.setX(endXPos);
      callback();
      return;
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 1600,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos,
      },
      targets: this._phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playCharacterHealthBarAppearAnimation(callback) {
    const startXPos = -600;
    const endXPos = 0;
    this._phaserHealthBarGameContainer.setPosition(
      startXPos,
      this._phaserHealthBarGameContainer.y
    );
    this._phaserHealthBarGameContainer.setAlpha(1);

    if (this._skipBattleAnimations) {
      this._phaserHealthBarGameContainer.setX(endXPos);
      callback();
      return;
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 1500,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos,
      },
      targets: this._phaserHealthBarGameContainer,
      onComplete: () => {
        callback();
      },
    });
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playDeathAnimation(callback) {
    const startYPos = this._phaserGameObject.y;
    const endYPos = startYPos - 400;

    if (this._skipBattleAnimations) {
      this._phaserGameObject.setY(endYPos);
      callback();
      return;
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 2000,
      y: {
        from: startYPos,
        start: startYPos,
        to: endYPos,
      },
      targets: this._phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }
}
