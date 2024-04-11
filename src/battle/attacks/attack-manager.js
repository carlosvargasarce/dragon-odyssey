import { exhaustiveGuard } from '../../utils/guard.js';
import { ATTACK_KEYS } from './attack-keys.js';
import IceShardFactory from './factories/ice-shard-factory.js';
import SlashFactory from './factories/slash-factory.js';
import { IceShard } from './ice-shard.js';
import { Slash } from './slash.js';

/**
 *
 * @typedef {keyof typeof ATTACK_TARGET} AttackTarget
 */

/** @enum {AttackTarget} */
export const ATTACK_TARGET = Object.freeze({
  PLAYER: 'PLAYER',
  ENEMY: 'ENEMY',
});

export class AttackManager {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {boolean} */
  #skipBattleAnimations;
  /** @type {IceShard} */
  #iceShardAttack;
  /** @type {Slash} */
  #slashAttack;

  /**
   *
   * @param {Phaser.Scene} scene
   * @param {boolean} skipBattleAnimations
   */
  constructor(scene, skipBattleAnimations) {
    this.#scene = scene;
    this.#skipBattleAnimations = skipBattleAnimations;
  }

  /**
   *
   * @param {import('./attack-keys.js').AttackKeys} attack
   * @param {AttackTarget} target
   * @param {() => void} callback
   * @returns {void}
   */
  playAttackAnimation(attack, target, callback) {
    if (this.#skipBattleAnimations) {
      callback();
      return;
    }

    // If attack target is enemy
    let x = 745;
    let y = 140;

    if (target === ATTACK_TARGET.PLAYER) {
      x = 256;
      y = 344;
    }

    switch (attack) {
      case ATTACK_KEYS.ICE_SHARD:
        if (!this.#iceShardAttack) {
          const iceShardFactory = new IceShardFactory();
          this.#iceShardAttack = iceShardFactory.createAttack(this.#scene, {
            x,
            y,
          });
        }
        this.#iceShardAttack.gameObject.setPosition(x, y);
        this.#iceShardAttack.playAnimation(callback);
        break;
      case ATTACK_KEYS.SLASH:
        if (!this.#slashAttack) {
          const slashFactory = new SlashFactory();
          this.#slashAttack = slashFactory.createAttack(this.#scene, { x, y });
        }
        this.#slashAttack.gameObject.setPosition(x, y);
        this.#slashAttack.playAnimation(callback);
        break;
      default:
        exhaustiveGuard(attack);
    }
  }
}
