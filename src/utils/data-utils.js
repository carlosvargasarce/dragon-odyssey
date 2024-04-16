import { DATA_ASSET_KEYS } from '../assets/asset-keys.js';

export class DataUtils {
  /**
   * Utility function for retrieving an Attack object from attacks.json data file.
   * @param {Phaser.Scene} scene
   * @param {number} attackId
   * @returns {import('../types/typedef.js').Attack | undefined}
   */
  static getCharacterAttack(scene, attackId) {
    /** @type {import('../types/typedef.js').Attack[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);

    return data.find((attack) => attack.id === attackId);
  }

  /**
   * Utility function for retrieving an Item object from the items.json data file.
   * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
   * @param {number} itemId the id of the item to retrieve from the items.json file
   * @returns {import('../types/typedef.js').Item | undefined}
   */
  static getItem(scene, itemId) {
    /** @type {import('../types/typedef.js').Item[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
    return data.find((item) => item.id === itemId);
  }

  /**
   * Utility function for retrieving a Enemy object from the enemies.json data file.
   * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
   * @param {number} enemyId the enemy id to retrieve from the enemies.json file
   * @returns {import('../types/typedef.js').Character}
   */
  static getEnemyById(scene, enemyId) {
    /** @type {import('../types/typedef.js').Character[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ENEMIES);
    return data.find((enemy) => enemy.id === enemyId);
  }

  /**
   * Utility function for retrieving a Character object from the character.json data file.
   * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
   * @param {number} characterId the character id to retrieve from the characters.json file
   * @returns {import('../types/typedef.js').Character}
   */
  static getCharacterById(scene, characterId) {
    /** @type {import('../types/typedef.js').Character[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.CHARACTERS);
    return data.find((character) => character.id === characterId);
  }

  /**
   * Utility function for retrieving all the animations from animations.json data file.
   * @param {Phaser.Scene} scene
   * @returns {import('../types/typedef.js').Animation[]}
   */
  static getAnimations(scene) {
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data;
  }
}
