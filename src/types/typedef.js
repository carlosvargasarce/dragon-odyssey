/**
 * @typedef BattleCharacterConfig
 * @type {Object}
 * @property {Phaser.Scene} scene
 * @property {Character} characterDetails
 * @property {number} [scaleHealthBarBackgroundImageByY=1]
 * @property {boolean} [skipBattleAnimation=false]
 */

import { ATTACK_KEYS } from '../battle/attacks/attack-keys.js';

/**
 * @typedef Character
 * @type {Object}
 * @property {string} name
 * @property {string} assetKey
 * @property {number} [assetFrame=0]
 * @property {number} currentLevel
 * @property {number} maxHp
 * @property {number} currentHp
 * @property {number} baseAttack
 * @property {number[]} attackIds
 *
 */

/**
 * @typedef Coordinate
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Attack
 * @type {Object}
 * @property {number} id
 * @property {string} name
 * @property {ATTACK_KEYS} animationName
 */
