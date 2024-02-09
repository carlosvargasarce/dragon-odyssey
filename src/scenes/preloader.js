import { Scene } from 'phaser';
import { BATTLE_BACKGROUND_ASSET_KEYS } from '../assets/asset-keys.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class PreLoader extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    console.log(`[${PreLoader.name}:preload] invoked`);
    const magicKingdomAssetPath = 'assets/images/magic-kingdom';

    // Background Assets
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `${magicKingdomAssetPath}/battle-backgrounds/forest-background.png`
    );
  }

  create() {
    console.log(`[${PreLoader.name}:create] invoked`);
    this.scene.start(SCENE_KEYS.BATTLE_SCENE);
  }
}
