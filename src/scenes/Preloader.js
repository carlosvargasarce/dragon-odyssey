import { Scene } from 'phaser';
import {
  ATTACK_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  CHARACTER_ASSET_KEYS,
  CHARACTER_ENTITY_ASSET_KEYS,
  CLASSES_ASSET_KEYS,
  DATA_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  UI_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { FUGAZ_ONE_FONT_NAME, LATO_FONT_NAME } from '../assets/font-keys.js';
import { WebFontFileLoader } from '../assets/web-font-file-loader.js';
import { DataUtils } from '../utils/data-utils.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class PreLoader extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    console.log(`[${PreLoader.name}:preload] invoked`);
    const dragonOdysseyAssetPath = 'assets/images/dragon-odyssey';

    // Background Assets
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `${dragonOdysseyAssetPath}/battle-backgrounds/forest-background.jpg`
    );

    // Battle Assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${dragonOdysseyAssetPath}/ui/healthbar/healthbar-bg.png`
    );

    // Healthbar Assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      `${dragonOdysseyAssetPath}/ui/healthbar/barHorizontal_green_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      `${dragonOdysseyAssetPath}/ui/healthbar/barHorizontal_green_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      `${dragonOdysseyAssetPath}/ui/healthbar/barHorizontal_green_left.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
      `${dragonOdysseyAssetPath}/ui/healthbar/barHorizontal_shadow_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
      `${dragonOdysseyAssetPath}/ui/healthbar/barHorizontal_shadow_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
      `${dragonOdysseyAssetPath}/ui/healthbar/barHorizontal_shadow_left.png`
    );

    // Characters Assets
    this.load.image(
      CHARACTER_ASSET_KEYS.SKELETON,
      `${dragonOdysseyAssetPath}/enemies/skeleton.png`
    );

    this.load.image(
      CHARACTER_ASSET_KEYS.IGUANIGNITE,
      `${dragonOdysseyAssetPath}/enemies/iguanignite.png`
    );

    // Classes Assets
    this.load.image(
      CLASSES_ASSET_KEYS.BERSEKER,
      `${dragonOdysseyAssetPath}/classes/berseker.png`
    );

    // UI Assets
    this.load.image(
      UI_ASSET_KEYS.CURSOR,
      `${dragonOdysseyAssetPath}/ui/cursor.png`
    );

    // Load JSON Data
    this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');
    this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json');

    // Load Custom Fonts
    this.load.addFile(
      new WebFontFileLoader(this.load, [LATO_FONT_NAME, FUGAZ_ONE_FONT_NAME])
    );

    //Load Attack Assets
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD,
      `${dragonOdysseyAssetPath}/attacks/ice-attack/active.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD_START,
      `${dragonOdysseyAssetPath}/attacks/ice-attack/start.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      ATTACK_ASSET_KEYS.SLASH,
      `${dragonOdysseyAssetPath}/attacks/slash.png`,
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );

    // World Assets
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_BACKGROUND,
      `${dragonOdysseyAssetPath}/map/level_background.png`
    );
    this.load.tilemapTiledJSON(
      WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
      'assets/data/level.json'
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_COLLISION,
      `${dragonOdysseyAssetPath}/map/collision.png`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_FOREGROUND,
      `${dragonOdysseyAssetPath}/map/level_foreground.png`
    );

    // Character Assets
    this.load.spritesheet(
      CHARACTER_ENTITY_ASSET_KEYS.PLAYER,
      `${dragonOdysseyAssetPath}/characters/main.png`,
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );

    this.load.spritesheet(
      CHARACTER_ENTITY_ASSET_KEYS.PLAYER,
      `${dragonOdysseyAssetPath}/characters/characters.png`,
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
  }

  create() {
    console.log(`[${PreLoader.name}:create] invoked`);
    this.#createAnimations();
    this.scene.start(SCENE_KEYS.WORLD_SCENE);
  }

  #createAnimations() {
    const animations = DataUtils.getAnimations(this);

    animations.forEach((animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, {
            frames: animation.frames,
          })
        : this.anims.generateFrameNumbers(animation.assetKey);

      this.anims.create({
        key: animation.key,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        delay: animation.delay,
        yoyo: animation.yoyo,
      });
    });
  }
}
