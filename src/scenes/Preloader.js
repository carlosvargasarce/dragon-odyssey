import { Scene } from 'phaser';
import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  CLASSES_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { SCENE_KEYS } from './scene-keys.js';

export class PreLoader extends Scene {
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

    // Battle Assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${magicKingdomAssetPath}/ui/healthbar/healthbar-bg.png`
    );

    // Healthbar Assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      `${magicKingdomAssetPath}/ui/healthbar/barHorizontal_green_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      `${magicKingdomAssetPath}/ui/healthbar/barHorizontal_green_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      `${magicKingdomAssetPath}/ui/healthbar/barHorizontal_green_left.png`
    );

    // Monsters Assets
    this.load.image(
      MONSTER_ASSET_KEYS.CARNODUSK,
      `${magicKingdomAssetPath}/monsters/carnodusk.png`
    );

    this.load.image(
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      `${magicKingdomAssetPath}/monsters/iguanignite.png`
    );

    // Classes Assets
    this.load.image(
      CLASSES_ASSET_KEYS.BERSEKER,
      `${magicKingdomAssetPath}/classes/berseker.png`
    );

    // UI Assets
    this.load.image(
      UI_ASSET_KEYS.CURSOR,
      `${magicKingdomAssetPath}/ui/cursor.png`
    );
  }

  create() {
    console.log(`[${PreLoader.name}:create] invoked`);
    this.scene.start(SCENE_KEYS.BATTLE_SCENE);
  }
}
