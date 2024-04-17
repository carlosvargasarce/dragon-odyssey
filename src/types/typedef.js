/**
 * @typedef BattleCharacterConfig
 * @type {object}
 * @property {Phaser.Scene} scene
 * @property {Character} characterDetails
 * @property {number} [scaleHealthBarBackgroundImageByY=1]
 * @property {boolean} [skipBattleAnimations=false]
 */

import { ATTACK_KEYS } from '../battle/attacks/attack-keys.js';

/**
 * @typedef Character
 * @type {object}}
 * @property {number} id
 * @property {number} characterId
 * @property {string} name
 * @property {string} assetKey
 * @property {number} [assetFrame=0]
 * @property {number} currentLevel
 * @property {number} maxHp
 * @property {number} currentHp
 * @property {number} baseAttack
 * @property {number[]} attackIds
 * @property {number} stamina
 * @property {number} pDef
 * @property {number} mDef
 * @property {number} pAtk
 * @property {number} rangeAtk
 * @property {number} mAtk
 * @property {number} atkSpeed
 * @property {number} precision
 *
 */

/**
 * @typedef {keyof typeof ITEM_EFFECT} ItemEffect
 */

/** @enum {ItemEffect} */
export const ITEM_EFFECT = Object.freeze({
  HEAL_30: 'HEAL_30',
});

/**
 * @typedef Item
 * @type {object}
 * @property {number} id the unique id of this item
 * @property {string} name the name of this item
 * @property {ItemEffect} effect the effect of using this item
 * @property {string} description the description of the item to show in the inventory bag
 */

/**
 * @typedef BaseInventoryItem
 * @type {object}
 * @property {object} item
 * @property {number} item.id the unique id of this item
 * @property {number} quantity
 */

/**
 * @typedef Inventory
 * @type {BaseInventoryItem[]}
 */

/**
 * @typedef InventoryItem
 * @type {object}
 * @property {Item} item
 * @property {number} quantity
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
 * @property {string} audioKey
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

/**
 * @typedef EncounterData
 * @type {Object.<string, number[][]>}
 */
