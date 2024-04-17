import {
  ALLIES_ASSET_KEYS,
  ATTACK_ASSET_KEYS,
  AUDIO_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  CHARACTER_ENTITY_ASSET_KEYS,
  CLASSES_ASSET_KEYS,
  DATA_ASSET_KEYS,
  ENEMY_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  HISTORY_ASSET_KEYS,
  INVENTORY_ASSET_KEYS,
  OPTIONS_ASSET_KEYS,
  TITLE_ASSET_KEYS,
  UI_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { FUGAZ_ONE_FONT_NAME, LATO_FONT_NAME } from '../assets/font-keys.js';
import { WebFontFileLoader } from '../assets/web-font-file-loader.js';
import { setGlobalSoundSettings } from '../utils/audio-utils.js';
import { dataManager } from '../utils/data-manager.js';
import { DataUtils } from '../utils/data-utils.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class PreLoader extends BaseScene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    super.preload();

    const dragonOdysseyAssetPath = 'assets/images/dragon-odyssey';

    // Background Assets
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.MEADOW,
      `${dragonOdysseyAssetPath}/battle-backgrounds/meadow-background.jpg`
    );

    // Battle Assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${dragonOdysseyAssetPath}/ui/healthbar/healthbar-bg.png`
    );

    // Battle Assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND_SOLID,
      `${dragonOdysseyAssetPath}/ui/healthbar/healthbar-bg-solid.png`
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
      ENEMY_ASSET_KEYS.FERNBITE,
      `${dragonOdysseyAssetPath}/enemies/fernbite.png`
    );

    this.load.image(
      ENEMY_ASSET_KEYS.VESPERWING,
      `${dragonOdysseyAssetPath}/enemies/vesperwing.png`
    );

    this.load.image(
      ENEMY_ASSET_KEYS.IGUANIGNITE,
      `${dragonOdysseyAssetPath}/enemies/iguanignite.png`
    );

    // Classes Assets
    this.load.image(
      CLASSES_ASSET_KEYS.BERSEKER,
      `${dragonOdysseyAssetPath}/classes/berseker.png`
    );

    this.load.image(
      CLASSES_ASSET_KEYS.ELF,
      `${dragonOdysseyAssetPath}/classes/elf.png`
    );

    this.load.image(
      CLASSES_ASSET_KEYS.DRUID,
      `${dragonOdysseyAssetPath}/classes/druid.png`
    );

    this.load.image(
      CLASSES_ASSET_KEYS.WARRIOR,
      `${dragonOdysseyAssetPath}/classes/warrior.png`
    );

    this.load.image(
      CLASSES_ASSET_KEYS.PALADIN,
      `${dragonOdysseyAssetPath}/classes/paladin.png`
    );

    this.load.image(
      CLASSES_ASSET_KEYS.GOLEM,
      `${dragonOdysseyAssetPath}/classes/golem.png`
    );

    // UI Assets
    this.load.image(
      UI_ASSET_KEYS.CURSOR,
      `${dragonOdysseyAssetPath}/ui/cursor.png`
    );

    this.load.image(
      UI_ASSET_KEYS.CURSOR_WHITE,
      `${dragonOdysseyAssetPath}/ui/cursor_white.png`
    );

    this.load.image(
      UI_ASSET_KEYS.MENU_BACKGROUND,
      `${dragonOdysseyAssetPath}/title/glass_panel.png`
    );

    this.load.image(
      UI_ASSET_KEYS.MENU_BACKGROUND_SQUARE,
      `${dragonOdysseyAssetPath}/title/glass_panel_square.png`
    );

    this.load.image(
      UI_ASSET_KEYS.MENU_BACKGROUND_BLUE,
      `${dragonOdysseyAssetPath}/title/glass_panel_blue.png`
    );

    this.load.image(
      UI_ASSET_KEYS.MENU_BACKGROUND_GREEN,
      `${dragonOdysseyAssetPath}/title/glass_panel_green.png`
    );

    this.load.image(
      UI_ASSET_KEYS.RED_BUTTON,
      `${dragonOdysseyAssetPath}/ui/red_button.png`
    );

    this.load.image(
      UI_ASSET_KEYS.RED_BUTTON_SELECTED,
      `${dragonOdysseyAssetPath}/ui/red_button_selected.png`
    );

    // Audio Assets
    this.load.audio(AUDIO_ASSET_KEYS.MAIN, 'assets/audio/journey-begins.wav');
    this.load.audio(AUDIO_ASSET_KEYS.TITLE, 'assets/audio/title-theme.wav');
    this.load.audio(
      AUDIO_ASSET_KEYS.BATTLE,
      'assets/audio/decisive-battle.wav'
    );
    this.load.audio(AUDIO_ASSET_KEYS.GRASS, 'assets/audio/step-grass.wav');
    this.load.audio(AUDIO_ASSET_KEYS.ICE, 'assets/audio/ice-explosion.wav');
    this.load.audio(AUDIO_ASSET_KEYS.FLEE, 'assets/audio/flee.wav');
    this.load.audio(AUDIO_ASSET_KEYS.CLAW, 'assets/audio/claw.wav');

    // Allies Scene Assets
    this.load.image(
      ALLIES_ASSET_KEYS.BACKGROUND_PATTERN,
      `${dragonOdysseyAssetPath}/allies/background-river.jpg`
    );

    this.load.image(
      ALLIES_ASSET_KEYS.ALLIES_DETAILS_BACKGROUND,
      `${dragonOdysseyAssetPath}/allies/details.png`
    );

    // Load JSON Data
    this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');
    this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json');
    this.load.json(DATA_ASSET_KEYS.ITEMS, 'assets/data/items.json');
    this.load.json(DATA_ASSET_KEYS.ENEMIES, 'assets/data/enemies.json');
    this.load.json(DATA_ASSET_KEYS.CHARACTERS, 'assets/data/characters.json');
    this.load.json(DATA_ASSET_KEYS.ENCOUNTERS, 'assets/data/encounters.json');

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
      ATTACK_ASSET_KEYS.MUD_SHOT,
      `${dragonOdysseyAssetPath}/attacks/mud-attack/active.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      ATTACK_ASSET_KEYS.MUD_SHOT_START,
      `${dragonOdysseyAssetPath}/attacks/mud-attack/start.png`,
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
    this.load.spritesheet(
      WORLD_ASSET_KEYS.BEACH,
      `${dragonOdysseyAssetPath}/map/interior.png`,
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_FOREGROUND,
      `${dragonOdysseyAssetPath}/map/level_foreground.png`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE,
      `${dragonOdysseyAssetPath}/map/encounter.png`
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
      CHARACTER_ENTITY_ASSET_KEYS.NPC,
      `${dragonOdysseyAssetPath}/characters/characters.png`,
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );

    //Title Scene Assets
    this.load.image(
      TITLE_ASSET_KEYS.BACKGROUND,
      `${dragonOdysseyAssetPath}/title/background.jpg`
    );

    this.load.image(
      TITLE_ASSET_KEYS.TITLE,
      `${dragonOdysseyAssetPath}/title/title_text.png`
    );

    //Options Scene Assets
    this.load.image(
      OPTIONS_ASSET_KEYS.BACKGROUNDS,
      `${dragonOdysseyAssetPath}/options/background.jpg`
    );

    // Inventory Assets
    this.load.image(
      INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND,
      `${dragonOdysseyAssetPath}/inventory/bag_background.png`
    );
    this.load.image(
      INVENTORY_ASSET_KEYS.INVENTORY_BAG,
      `${dragonOdysseyAssetPath}/inventory/bag.png`
    );

    // History Scenes Assets
    this.load.image(
      HISTORY_ASSET_KEYS.HISTORY_1,
      `${dragonOdysseyAssetPath}/history/history-1.png`
    );
  }

  create() {
    super.create();
    this.#createAnimations();

    dataManager.init(this);
    dataManager.loadData();

    setGlobalSoundSettings(this);
    this.scene.start(SCENE_KEYS.TITLE_SCENE);
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
