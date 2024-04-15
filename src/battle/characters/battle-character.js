import { BATTLE_ASSET_KEYS } from '../../assets/asset-keys.js';
import { FUGAZ_ONE_FONT_NAME, LATO_FONT_NAME } from '../../assets/font-keys.js';
import { DataUtils } from '../../utils/data-utils.js';
import SpriteFacade from '../../utils/spriteFacade.js';
import { Healthbar } from '../ui/healthbar.js';

export class BattleCharacter {
  /**@protected @type {Phaser.Scene}*/
  _scene;
  /**@protected @type {import('../../types/typedef.js').Character}*/
  _characterDetails;
  /**@protected @type {Healthbar}*/
  _healthBar;
  /**@protected @type {Phaser.GameObjects.Image}*/
  _phaserGameObject;
  /**@protected @type {number}*/
  _currentHealth;
  /**@protected @type {number}*/
  _maxHealth;
  /**@protected @type {import('../../types/typedef.js').Attack[]}*/
  _characterAttacks;
  /**@protected @type {Phaser.GameObjects.Container}*/
  _phaserHealthBarGameContainer;
  /**@protected @type {boolean}*/
  _skipBattleAnimations;

  /**
   *
   * @param {import('../../types/typedef.js').BattleCharacterConfig} config
   * @param {import('../../types/typedef.js').Coordinate} position
   * @param {number} scale
   *
   */
  constructor(config, position, scale) {
    this._scene = config.scene;
    this._characterDetails = config.characterDetails;
    this._currentHealth = this._characterDetails.currentHp;
    this._maxHealth = this._characterDetails.maxHp;
    this._characterAttacks = [];
    this._skipBattleAnimations = config.skipBattleAnimations || false;

    this._phaserGameObject = SpriteFacade.createSprite(
      this._scene,
      { x: position.x, y: position.y },
      {
        assetKey: this._characterDetails.assetKey,
        assetFrame: this._characterDetails.assetFrame || 0,
      }
    )
      .setScale(scale)
      .setAlpha(0);

    this.#createHealthBarComponents(config.scaleHealthBarBackgroundImageByY);

    this._healthBar.setMeterPercentageAnimated(
      this._currentHealth / this._maxHealth,
      {
        skipBattleAnimations: true,
      }
    );

    this._characterDetails.attackIds.forEach((attackId) => {
      const characterAttack = DataUtils.getCharacterAttack(
        this._scene,
        attackId
      );

      if (characterAttack !== undefined) {
        this._characterAttacks.push(characterAttack);
      }
    });
  }

  /** @type {number} */
  get currentHp() {
    return this._currentHealth;
  }

  /** @type {boolean}*/
  get isFainted() {
    return this._currentHealth <= 0;
  }

  /** @type {string}*/
  get name() {
    return this._characterDetails.name;
  }

  /** @type {import('../../types/typedef.js').Attack[]}*/
  get attacks() {
    return [...this._characterAttacks];
  }

  /** @type {number}*/
  get baseAttack() {
    return this._characterDetails.baseAttack;
  }

  /** @type {number}*/
  get level() {
    return this._characterDetails.currentLevel;
  }

  /**
   * @param {number} damage
   * @param {() => void} [callback]
   */
  takeDamage(damage, callback) {
    //Update current character health and animaet health bar
    this._currentHealth -= damage;

    if (this._currentHealth < 0) {
      this._currentHealth = 0;
    }

    this._healthBar.setMeterPercentageAnimated(
      this._currentHealth / this._maxHealth,
      { callback, skipBattleAnimations: this._skipBattleAnimations }
    );
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playCharacterAppearAnimation(callback) {
    throw new Error('playCharacterAppearAnimation is not implemented.');
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playCharacterHealthBarAppearAnimation(callback) {
    throw new Error('playCharacterHeathBarAppearAnimation is not implemented.');
  }

  /**
   *
   * @param {() => void} callback
   * @returns {void}
   */
  playTakeDamageAnimation(callback) {
    if (this._skipBattleAnimations) {
      this._phaserGameObject.setAlpha(1);
      callback();
      return;
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 150,
      targets: this._phaserGameObject,
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      repeat: 10,
      onComplete: () => {
        this._phaserGameObject.setAlpha(1);
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
    throw new Error('playDeathAnimation is not implemented.');
  }

  #createHealthBarComponents(scaleHealthBarBackgroundImageByY = 1) {
    this._healthBar = new Healthbar(this._scene, 34, 34);

    const characterNameGameText = this._scene.add.text(30, 15, this.name, {
      color: '#FFFFFF',
      fontSize: '32px',
      fontFamily: FUGAZ_ONE_FONT_NAME,
    });

    const healthBarBgImage = SpriteFacade.createSprite(
      this._scene,
      { x: 6, y: 0 },
      { assetKey: BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND }
    )
      .setOrigin(0)
      .setScale(0.5, scaleHealthBarBackgroundImageByY);

    const characterHealthBarLevelText = this._scene.add.text(
      characterNameGameText.width + 35,
      23,
      `Lv.${this.level}`,
      {
        color: '#D22727',
        fontSize: '28px',
        fontFamily: LATO_FONT_NAME,
      }
    );

    const characterHpText = this._scene.add.text(30, 55, 'HP', {
      color: '#D22727',
      fontSize: '24px',
      fontFamily: LATO_FONT_NAME,
    });

    this._phaserHealthBarGameContainer = this._scene.add
      .container(6, 6, [
        healthBarBgImage,
        characterNameGameText,
        this._healthBar.container,
        characterHealthBarLevelText,
        characterHpText,
      ])
      .setAlpha(0);
  }
}
