import { exhaustiveGuard } from '../../utils/guard.js';
import AttackCommand from './attack-command.js';
import { ATTACK_KEYS } from './attack-keys.js';
import IceShardFactory from './factories/ice-shard-factory.js';
import MudShotFactory from './factories/mud-shot-factory.js';
import SlashFactory from './factories/slash-factory.js';
import { IceShard } from './ice-shard.js';
import { MudShot } from './mud-shot.js';
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
  /** @type {MudShot} */
  #mudShotAttack;

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
      case ATTACK_KEYS.ICE_SHARD: {
        let attack =
          this.#iceShardAttack ||
          new IceShardFactory().createAttack(this.#scene, { x, y });
        new AttackCommand(attack, { x, y }).execute(callback);
        break;
      }
      case ATTACK_KEYS.MUD_SHOT: {
        let attack =
          this.#mudShotAttack ||
          new MudShotFactory().createAttack(this.#scene, { x, y });
        new AttackCommand(attack, { x, y }).execute(callback);
        break;
      }
      case ATTACK_KEYS.SLASH: {
        let attack =
          this.#slashAttack ||
          new SlashFactory().createAttack(this.#scene, { x, y });
        new AttackCommand(attack, { x, y }).execute(callback);
        break;
      }
      default:
        exhaustiveGuard(attack);
    }
  }
}
