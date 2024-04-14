import Phaser from 'phaser';
import { CLASSES_ASSET_KEYS } from '../assets/asset-keys.js';
import { DIRECTION } from '../common/direction.js';
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  SOUND_OPTIONS,
  TEXT_SPEED_OPTIONS,
} from '../common/options.js';
import { TEXT_SPEED, TILE_SIZE } from '../config.js';
import { exhaustiveGuard } from './guard.js';
const LOCAL_STORAGE_KEY = 'DRAGON_ODYSSEY_DATA';

/**
 * @typedef AlliesData
 * @type {object}
 * @property {import('../types/typedef.js').Character[]} inParty
 */

/**
 * @typedef GlobalState
 * @type {object}
 * @property {object} player
 * @property {object} player.position
 * @property {number} player.position.x
 * @property {number} player.position.y
 * @property {import('../common/direction.js').Direction} player.direction
 * @property {object} options
 * @property {import('../common/options.js').TextSpeedMenuOptions} options.textSpeed
 * @property {import('../common/options.js').BattleSceneMenuOptions} options.battleSceneAnimations
 * @property {import('../common/options.js').BattleStyleMenuOptions} options.battleStyle
 * @property {import('../common/options.js').SoundMenuOptions} options.sound
 * @property {import('../common/options.js').VolumeMenuOptions} options.volume
 * @property {import('../common/options.js').MenuColorOptions} options.menuColor
 * @property {boolean} gameStarted
 * @property {AlliesData} allies
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
  options: {
    textSpeed: TEXT_SPEED_OPTIONS.MID,
    battleSceneAnimations: BATTLE_SCENE_OPTIONS.ON,
    battleStyle: BATTLE_STYLE_OPTIONS.SHIFT,
    sound: SOUND_OPTIONS.ON,
    volume: 4,
    menuColor: 0,
  },
  gameStarted: false,
  allies: {
    inParty: [
      {
        id: 1,
        characterId: 1,
        name: CLASSES_ASSET_KEYS.BERSEKER,
        assetKey: CLASSES_ASSET_KEYS.BERSEKER,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [2],
        baseAttack: 15,
        currentLevel: 5,
      },
    ],
  },
};

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  PLAYER_POSITION: 'PLAYER_POSITION',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_LOCATION: 'PLAYER_LOCATION',
  OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
  OPTIONS_BATTLE_SCENE_ANIMATIONS: 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
  OPTIONS_BATTLE_STYLE: 'OPTIONS_BATTLE_STYLE',
  OPTIONS_SOUND: 'OPTIONS_SOUND',
  OPTIONS_VOLUME: 'OPTIONS_VOLUME',
  OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
  GAME_STARTED: 'GAME_STARTED',
  ALLIES_IN_PARTY: 'ALLIES_IN_PARTY',
  INVENTORY: 'INVENTORY',
  ITEMS_PICKED_UP: 'ITEMS_PICKED_UP',
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
   * @returns {void}
   */
  loadData() {
    // Attempt to load data from browser storage and populate the data manager
    if (typeof Storage === 'undefined') {
      console.warn(
        `[${DataManager.name}:loadData] localStorage is not supported, will not be able to save and load data.`
      );
      return;
    }

    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData === null) {
      return;
    }
    try {
      /** @type {GlobalState} */
      const parsedData = JSON.parse(savedData);
      // Update the state with the saved data
      this.#updateDataManager(parsedData);
    } catch (error) {
      console.warn(
        `[${DataManager.name}:loadData] encountered an error while attempting to load and parse saved data.`
      );
    }
  }

  /**
   * @returns {void}
   */
  saveData() {
    // Attempt to storage data in browser storage from data manager
    if (typeof Storage === 'undefined') {
      console.warn(
        `[${DataManager.name}:saveData] localStorage is not supported, will not be able to save and load data.`
      );
      return;
    }
    const dataToSave = this.#dataManagerDataToGlobalStateObject();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }

  startNewGame() {
    // get existing data before resetting all of the data, so we can persist options data
    const existingData = { ...this.#dataManagerDataToGlobalStateObject() };
    existingData.player.position = { ...initialState.player.position };
    existingData.player.direction = initialState.player.direction;
    existingData.gameStarted = initialState.gameStarted;
    existingData.allies = {
      inParty: [...initialState.allies.inParty],
    };

    this.#store.reset();
    this.#updateDataManager(existingData);
    this.saveData();
  }

  /**
   * @returns {number}
   */
  getAnimatedTextSpeed() {
    /** @type {import('../common/options.js').TextSpeedMenuOptions | undefined} */
    const chosenTextSpeed = this.#store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED
    );
    if (chosenTextSpeed === undefined) {
      return TEXT_SPEED.MEDIUM;
    }

    switch (chosenTextSpeed) {
      case TEXT_SPEED_OPTIONS.FAST:
        return TEXT_SPEED.FAST;
      case TEXT_SPEED_OPTIONS.MID:
        return TEXT_SPEED.MEDIUM;
      case TEXT_SPEED_OPTIONS.SLOW:
        return TEXT_SPEED.SLOW;
      default:
        exhaustiveGuard(chosenTextSpeed);
    }
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
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]:
        data.options.battleSceneAnimations,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]: data.options.battleStyle,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data.options.sound,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor,
      [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
      [DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY]: data.allies.inParty,
    });
  }

  /**
   * @returns {GlobalState}
   */
  #dataManagerDataToGlobalStateObject() {
    return {
      player: {
        position: {
          x: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).x,
          y: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).y,
        },
        direction: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      },
      options: {
        textSpeed: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
        battleSceneAnimations: this.#store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS
        ),
        battleStyle: this.#store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE
        ),
        sound: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
        volume: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
        menuColor: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
      },
      gameStarted: this.#store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
      allies: {
        inParty: [...this.#store.get(DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY)],
      },
    };
  }
}

// Exportar el método estático que devuelve la instancia única
export const dataManager = DataManager.getInstance();
