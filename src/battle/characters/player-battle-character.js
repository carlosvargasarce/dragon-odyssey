import { LATO_FONT_NAME } from '../../assets/font-keys.js';
import { BattleCharacter } from './battle-character.js';

/**
 * @type {import("../../types/typedef.js").Coordinate}
 */
const PLAYER_POSITION = Object.freeze({
  x: 256,
  y: 275,
});

const SCALE = 1;

export class PlayerBattleCharacter extends BattleCharacter {
  /** @type {Phaser.GameObjects.Text} */
  #healthBarTextGameObject;

  /**
   *
   * @param {import("../../types/typedef.js").BattleCharacterConfig} config
   */
  constructor(config) {
    super(
      { ...config, scaleHealthBarBackgroundImageByY: 0.47 },
      PLAYER_POSITION,
      SCALE
    );
    this._phaserHealthBarGameContainer.setPosition(553, 325);

    this.#addHealthBarComponents();
  }

  #setHealthBarText() {
    this.#healthBarTextGameObject.setText(
      `${this._currentHealth}/${this._maxHealth}`
    );
  }

  #addHealthBarComponents() {
    this.#healthBarTextGameObject = this._scene.add
      .text(443, 80, '', {
        color: '#FFFFFF',
        fontSize: '16px',
        fontFamily: LATO_FONT_NAME,
      })
      .setOrigin(1, 0);

    this.#setHealthBarText();
    this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject);
  }

  /**
   * @param {number} damage
   * @param {() => void} [callback]
   */
  takeDamage(damage, callback) {
    super.takeDamage(damage, callback);
    this.#setHealthBarText();
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playCharacterAppearAnimation(callback) {
    const startXPos = -30;
    const endXPos = PLAYER_POSITION.x;
    this._phaserGameObject.setPosition(startXPos, PLAYER_POSITION.y);
    this._phaserGameObject.setAlpha(1);

    if (this._skipBattleAnimations) {
      this._phaserGameObject.setX(endXPos);
      callback();
      return;
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 800,
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
    const startXPos = 800;
    const endXPos = this._phaserHealthBarGameContainer.x;
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
      duration: 800,
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
    const endYPos = startYPos + 400;

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

  /**
   * @param {number} updatedHp
   * @returns {void}
   */
  updateMonsterHealth(updatedHp) {
    this._currentHealth = updatedHp;
    if (this._currentHealth > this._maxHealth) {
      this._currentHealth = this._maxHealth;
    }
    this._healthBar.setMeterPercentageAnimated(
      this._currentHealth / this._maxHealth,
      {
        skipBattleAnimations: true,
      }
    );
    this.#setHealthBarText();
  }
}
