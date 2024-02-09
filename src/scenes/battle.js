import { Scene } from 'phaser';
import { Background } from '../battle/background.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class Battle extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  create() {
    console.log(`[${Battle.name}:create] invoked`);
    // Create main background
    const background = new Background(this);
    background.showForest();
  }

  update() {}
}
