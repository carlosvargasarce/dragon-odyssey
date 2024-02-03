import { Scene } from 'phaser';
import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { SCENE_KEYS } from './scene-keys.js';

export class Preloader extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    const monsterAssetPath = 'assets/images/magic-kingdom';
    const kenneysAssetPath = 'assets/images/kenneys-assets';

    // Background Assets
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `${monsterAssetPath}/battle-backgrounds/forest-background.png`
    );

    // Battle Assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
    );

    // Healthbar Assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`
    );

    //Monsters Assets
    this.load.image(
      MONSTER_ASSET_KEYS.CARNODUSK,
      `${monsterAssetPath}/monsters/carnodusk.png`
    );

    this.load.image(
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      `${monsterAssetPath}/monsters/iguanignite.png`
    );
  }

  create() {
    this.textures.get('background');
    this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);
  }
}
