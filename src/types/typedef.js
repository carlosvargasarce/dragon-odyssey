/**
 * @typedef BattleCharacterConfig
 * @type {object}
 * @property {Phaser.Scene} scene
 * @property {Character} characterDetails
 * @property {number} [scaleHealthBarBackgroundImageByY=1]
 * @property {boolean} [skipBattleAnimation=false]
 */

import { ATTACK_KEYS } from '../battle/attacks/attack-keys.js';

/**
 * @typedef Character
 * @type {object}
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
 * @type {object}
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Attack
 * @type {object}
 * @property {number} id
 * @property {string} name
 * @property {ATTACK_KEYS} animationName
 */

/**
 * @typedef Animation
 * @type {object}
 * @property {string} key
 * @property {number[]} [frames]
 * @property {number} frameRate
 * @property {number} repeat
 * @property {number} delay
 * @property {boolean} yoyo
 * @property {string} assetKey
 */
