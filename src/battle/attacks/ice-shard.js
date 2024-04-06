import { ATTACK_ASSET_KEYS } from '../../assets/asset-keys.js';
import { Attack } from './attack.js';

export class IceShard extends Attack {
  /** @protected @type {Phaser.GameObjects.Sprite} */
  _attackGameObject;

  /**
   *
   * @param {Phaser.Scene} scene
   * @param {import('../../types/typedef.js').Coordinate} position
   */
  constructor(scene, position) {
    super(scene, position);

    // Create animations
    this._scene.anims.create({
      key: ATTACK_ASSET_KEYS.ICE_SHARD,
      frames: this._scene.anims.generateFrameNumbers(
        ATTACK_ASSET_KEYS.ICE_SHARD
      ),
      frameRate: 8,
      repeat: 0,
      delay: 0,
    });

    this._scene.anims.create({
      key: ATTACK_ASSET_KEYS.ICE_SHARD_START,
      frames: this._scene.anims.generateFrameNumbers(
        ATTACK_ASSET_KEYS.ICE_SHARD_START
      ),
      frameRate: 8,
      repeat: 0,
      delay: 0,
    });

    // Create game objects
    this._attackGameObject = this._scene.add
      .sprite(
        this._position.x,
        this._position.y,
        ATTACK_ASSET_KEYS.ICE_SHARD,
        5
      )
      .setOrigin(0.5)
      .setScale(4)
      .setAlpha(1);
  }

  /**
   *
   * @param {() => void} [callback]
   * @returns {void}
   */
  playAnimation(callback) {
    if (this._isAnimationPlaying) {
      return;
    }

    this._isAnimationPlaying = true;
    this._attackGameObject.setAlpha(1);

    this._attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD_START);

    this._attackGameObject.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        ATTACK_ASSET_KEYS.ICE_SHARD_START,
      () => {
        this._attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD);
      }
    );

    this._attackGameObject.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        ATTACK_ASSET_KEYS.ICE_SHARD_START,
      () => {
        this._isAnimationPlaying = false;
        this._attackGameObject.setAlpha(0).setFrame(0);

        if (callback) {
          callback();
        }
      }
    );
  }
}