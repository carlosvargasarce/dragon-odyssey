import { Scene } from 'phaser';
import { WORLD_ASSET_KEYS } from '../assets/asset-keys.js';
import { DIRECTION } from '../common/direction.js';
import { TILE_COLLISION_LAYER_ALPHA, TILE_SIZE } from '../config.js';
import { Controls } from '../utils/controls.js';
import { Player } from '../world/characters/player.js';
import { SCENE_KEYS } from './scene-keys.js';

const PLAYER_POSITION = Object.freeze({
  x: 6 * TILE_SIZE,
  y: 21 * TILE_SIZE,
});

export default class World extends Scene {
  /** @type {Player} */
  #player;
  /** @type {Controls} */
  #controls;

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  create() {
    console.log(`[${World.name}:created] invoked`);

    const x = 6 * TILE_SIZE;
    const y = 22 * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, 1280, 2176);
    this.cameras.main.setZoom(0.8);
    this.cameras.main.centerOn(x, y);

    const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });
    const collisionTiles = map.addTilesetImage(
      'collision',
      WORLD_ASSET_KEYS.WORLD_COLLISION
    );

    if (!collisionTiles) {
      console.log(
        `[${World.name}:create] encountered error while creatin collision tileset using data from tile`
      );
      return;
    }

    const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);

    if (!collisionLayer) {
      console.log(
        `[${World.name}:create] encountered error while creating collision layer using data from tile`
      );
      return;
    }

    collisionLayer.setAlpha(TILE_COLLISION_LAYER_ALPHA).setDepth(2);
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

    this.#player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
      collisionLayer: collisionLayer,
    });

    this.cameras.main.startFollow(this.#player.sprite);
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);
    this.#controls = new Controls(this);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time) {
    const selectedDirection = this.#controls.getDirectionKeyPressedDown();

    if (selectedDirection !== DIRECTION.NONE) {
      this.#player.moveCharacter(selectedDirection);
    }

    this.#player.update(time);
  }
}
