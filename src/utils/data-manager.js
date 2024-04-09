import { DIRECTION } from '../common/direction.js';
import { TILE_SIZE } from '../config.js';

/**
 * @typedef GlobalState
 * @type {object}
 * @property {object} player
 * @property {object} player.position
 * @property {object} player.position.x
 * @property {object} player.position.y
 * @property {import('../common/direction.js').Direction} player.direction
 *
 *
 */

/** @type {GlobalState} */
const initialState = {
  player: {
    position: {
      x: 6 * TILE_SIZE,
      y: 21 * TILE_SIZE,
    },
    direction: DIRECTION.DOWN,
  },
};

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  PLAYER_POSITION: 'PLAYER_POSITION',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
});

class DataManager extends Phaser.Events.EventEmitter {
  /** @type {Phaser.Data.DataManager} */
  #store;

  // Instancia única
  static instance = null;

  constructor() {
    super();

    if (DataManager.instance) {
      return DataManager.instance;
    }

    this.#store = new Phaser.Data.DataManager(this);
    this.#updateDataManager(initialState);
    DataManager.instance = this;
  }

  /** @type {Phaser.Data.DataManager} */
  get store() {
    return this.#store;
  }

  // Método estático para obtener la instancia
  static getInstance() {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   *
   * @param {GlobalState} data
   * @returns {void}
   */
  #updateDataManager(data) {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
    });
  }
}

// Exportar el método estático que devuelve la instancia única
export const dataManager = DataManager.getInstance();
