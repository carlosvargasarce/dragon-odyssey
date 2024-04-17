import { AUDIO_ASSET_KEYS, WORLD_ASSET_KEYS } from '../assets/asset-keys.js';
import { DIRECTION } from '../common/direction.js';
import { TILE_COLLISION_LAYER_ALPHA, TILE_SIZE } from '../config.js';
import { playBackgroundMusic, playSoundFx } from '../utils/audio-utils.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import { DataUtils } from '../utils/data-utils.js';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../utils/grid-utils.js';
import { weightedRandom } from '../utils/random.js';
import SpriteFacade from '../utils/spriteFacade.js';
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from '../utils/text.utils.js';
import { NPC } from '../world/characters/npc.js';
import { Player } from '../world/characters/player.js';
import { DialogUi } from '../world/dialog-ui.js';
import { Item } from '../world/item.js';
import { Menu } from '../world/menu/menu.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

/**
 * @typedef TiledObjectProperty
 * @type {object}
 * @property {string} name
 * @property {string} type
 * @property {any} value
 */

const TILED_SIGN_PROPERTY = Object.freeze({
  MESSAGE: 'message',
});

const CUSTOM_TILED_TYPES = Object.freeze({
  NPC: 'npc',
  NPC_PATH: 'npc_path',
});

const TILED_NPC_PROPERTY = Object.freeze({
  IS_SPAWN_POINT: 'is_spawn_point',
  MOVEMENT_PATTERN: 'movement_pattern',
  MESSAGES: 'messages',
  FRAME: 'frame',
});

const TILED_ENCOUNTER_PROPERTY = Object.freeze({
  AREA: 'area',
});

const TILED_ITEM_PROPERTY = Object.freeze({
  ITEM_ID: 'item_id',
  ID: 'id',
});

const TILED_AREA_METADATA_PROPERTY = Object.freeze({
  FAINT_LOCATION: 'faint_location',
  ID: 'id',
});

/**
 * @typedef WorldSceneData
 * @type {object}
 * @property {boolean} [isPlayerKnockedOut]
 */

export default class WorldScene extends BaseScene {
  /** @type {Player} */
  #player;
  /** @type {Phaser.Tilemaps.TilemapLayer} */
  #encounterLayer;
  /** @type {boolean} */
  #wildEnemyEncountered;
  /** @type {Phaser.Tilemaps.ObjectLayer} */
  #signLayer;
  /** @type {DialogUi} */
  #dialogUi;
  /** @type {NPC[]} */
  #npcs;
  /** @type {NPC | undefined} */
  #npcPlayerIsInteractingWith;
  /** @type {Menu} */
  #menu;
  /** @type {WorldSceneData} */
  #sceneData;
  /** @type {Item[]} */
  #items;

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  /**
   * @param {WorldSceneData} data
   * @returns {void}
   */
  init(data) {
    super.init(data);
    this.#sceneData = data;

    if (Object.keys(data).length === 0) {
      this.#sceneData = {
        isPlayerKnockedOut: false,
      };
    }

    console.log('this.#sceneData WORLD', this.#sceneData);

    this.#wildEnemyEncountered = false;

    // Update player location, and map data if the player was knocked out in a battle
    if (this.#sceneData.isPlayerKnockedOut) {
      dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
        x: 6 * TILE_SIZE,
        y: 21 * TILE_SIZE,
      });

      dataManager.store.set(
        DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
        DIRECTION.DOWN
      );
    }

    this.#npcPlayerIsInteractingWith = undefined;
    this.#items = [];
  }

  create() {
    super.create();

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

    //Collision Tiles and Layer
    if (!collisionTiles) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating collision tileset using data from tile`
      );
      return;
    }

    const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating collision layer using data from tile`
      );
      return;
    }
    collisionLayer.setAlpha(TILE_COLLISION_LAYER_ALPHA).setDepth(2);

    // Create Interactive Layer
    this.#signLayer = map.getObjectLayer('Sign');

    if (!this.#signLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating sign layer using data from tile`
      );
      return;
    }

    //Encounter Tiles and Layer
    const encounterTiles = map.addTilesetImage(
      'encounter',
      WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE
    );

    if (!encounterTiles) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating encounter tiles using data from tile`
      );
      return;
    }

    this.#encounterLayer = map.createLayer('Encounter', encounterTiles, 0, 0);
    if (!this.#encounterLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating encounter layer using data from tile`
      );
      return;
    }
    this.#encounterLayer.setAlpha(TILE_COLLISION_LAYER_ALPHA).setDepth(2);

    SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: WORLD_ASSET_KEYS.WORLD_BACKGROUND, assetFrame: 0 }
    ).setOrigin(0);

    // Create items
    this.#createItems(map);

    // Create NPCS
    this.#createNPCs(map);

    // Create player
    this.#player = new Player({
      scene: this,
      position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
      ),
      collisionLayer: collisionLayer,
      spriteGridMovementFinishedCallback: () => {
        this.#handlePlayerMovementUpdate();
      },
      spriteChangedDirectionCallback: () => {
        this.#handlePlayerDirectionUpdate();
      },
      otherCharactersToCheckForCollisionsWith: this.#npcs,
      objectsToCheckForCollisionsWith: this.#items,
    });

    this.cameras.main.startFollow(this.#player.sprite);

    // Update our collisions with npcs
    this.#npcs.forEach((npc) => {
      npc.addCharacterToCheckForCollisionsWith(this.#player);
    });

    // Create Foreground for Depth
    SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: WORLD_ASSET_KEYS.WORLD_FOREGROUND, assetFrame: 0 }
    ).setOrigin(0);

    // Create Dialog UI
    this.#dialogUi = new DialogUi(this, 1280, 90, 124, 0.9);

    // Create menu
    this.#menu = new Menu(this);

    this.cameras.main.fadeIn(1000, 0, 0, 0, (camera, progress) => {
      if (progress === 1) {
        // If the player was knocked out, we want to lock input, heal player, and then have npc show message
        if (this.#sceneData.isPlayerKnockedOut) {
          this.#healPlayerParty();
          this.#dialogUi.showDialogModal([
            'It looks like our party put up quite a fight...',
            'We took a nice rest, now we are ready to battle again.',
          ]);
        }
      }
    });

    dataManager.store.set(DATA_MANAGER_STORE_KEYS.GAME_STARTED, true);

    playBackgroundMusic(this, AUDIO_ASSET_KEYS.MAIN);
  }

  /**
   *
   * @param {DOMHighResTimeStamp} time
   * @returns {void}
   */
  update(time) {
    super.update();

    if (this.#wildEnemyEncountered) {
      this.#player.update(time);
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    const selectedDirectionHeldDown =
      this._controls.getDirectionKeyPressedDown();
    const selectedDirectionPressedOnce =
      this._controls.getDirectionKeyJustPressed();
    if (
      selectedDirectionHeldDown !== DIRECTION.NONE &&
      !this.#isPlayerInputLocked()
    ) {
      this.#player.moveCharacter(selectedDirectionHeldDown);
    }

    if (wasSpaceKeyPressed && !this.#player.isMoving && !this.#menu.isVisible) {
      this.#handlePlayerInteraction();
    }

    if (this._controls.wasEnterKeyPressed() && !this.#player.isMoving) {
      if (this.#dialogUi.isVisible) {
        return;
      }

      if (this.#menu.isVisible) {
        this.#menu.hide();
        return;
      }

      this.#menu.show();
    }

    if (this.#menu.isVisible) {
      if (selectedDirectionPressedOnce !== DIRECTION.NONE) {
        this.#menu.handlePlayerInput(selectedDirectionPressedOnce);
      }

      if (wasSpaceKeyPressed) {
        this.#menu.handlePlayerInput('OK');

        if (this.#menu.selectedMenuOption === 'SAVE') {
          this.#menu.hide();
          dataManager.saveData();
          this.#dialogUi.showDialogModal(['Game progress has been saved!']);
        }

        if (this.#menu.selectedMenuOption === 'CHARACTERS') {
          // Pause this scene and launch the monster party scene
          /** @type {import('./allies.js').CharacterPartySceneData} */
          const sceneDataToPass = {
            previousSceneName: SCENE_KEYS.WORLD_SCENE,
          };
          this.scene.launch(SCENE_KEYS.ALLYS_SCENE, sceneDataToPass);
          this.scene.pause(SCENE_KEYS.WORLD_SCENE);
        }

        if (this.#menu.selectedMenuOption === 'BAG') {
          // Pause this scene and launch the inventory scene
          /** @type {import('./inventory.js').InventorySceneData} */
          const sceneDataToPass = {
            previousSceneName: SCENE_KEYS.WORLD_SCENE,
          };
          this.scene.launch(SCENE_KEYS.INVENTORY_SCENE, sceneDataToPass);
          this.scene.pause(SCENE_KEYS.WORLD_SCENE);
        }

        if (this.#menu.selectedMenuOption === 'EXIT') {
          this.#menu.hide();
        }
      }

      if (this._controls.wasBackKeyPressed()) {
        this.#menu.hide();
      }
    }

    this.#player.update(time);

    this.#npcs.forEach((npc) => {
      npc.update(time);
    });
  }

  #handlePlayerInteraction() {
    if (this.#dialogUi.isAnimationPlaying) {
      return;
    }

    if (this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.hideDialogModal();

      if (this.#npcPlayerIsInteractingWith) {
        this.#npcPlayerIsInteractingWith.isTalkingToPlayer = false;
        this.#npcPlayerIsInteractingWith = undefined;
      }

      return;
    }

    if (this.#dialogUi.isVisible && this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.showNextMessage();
      return;
    }

    console.log('start of interaction check');

    const { x, y } = this.#player.sprite;

    const targetPosition = getTargetPositionFromGameObjectPositionAndDirection(
      { x, y },
      this.#player.direction
    );

    const nearbySign = this.#signLayer.objects.find((object) => {
      if (!object.x || !object.y) {
        return;
      }

      return (
        object.x === targetPosition.x &&
        object.y - TILE_SIZE === targetPosition.y
      );
    });

    if (nearbySign) {
      /** @type {TiledObjectProperty[]} */
      const props = nearbySign.properties;
      /** @type {string} */
      const msg = props.find(
        (prop) => prop.name === TILED_SIGN_PROPERTY.MESSAGE
      )?.value;

      const usePlaceholderText = this.#player.direction !== DIRECTION.UP;
      let textToShow = CANNOT_READ_SIGN_TEXT;

      if (!usePlaceholderText) {
        textToShow = msg || SAMPLE_TEXT;
      }

      this.#dialogUi.showDialogModal([textToShow]);

      return false;
    }

    const nearbyNpc = this.#npcs.find((npc) => {
      return (
        npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y
      );
    });

    if (nearbyNpc) {
      nearbyNpc.facePlayer(this.#player.direction);
      nearbyNpc.isTalkingToPlayer = true;
      this.#npcPlayerIsInteractingWith = nearbyNpc;
      this.#dialogUi.showDialogModal(nearbyNpc.messages);
      return;
    }

    // Check for a nearby item and display message about player finding the item
    let nearbyItemIndex;
    const nearbyItem = this.#items.find((item, index) => {
      if (
        item.position.x === targetPosition.x &&
        item.position.y === targetPosition.y
      ) {
        nearbyItemIndex = index;
        return true;
      }
      return false;
    });

    if (nearbyItem) {
      // Add item to inventory and display message to player
      const item = DataUtils.getItem(this, nearbyItem.itemId);
      dataManager.addItem(item, 1);
      nearbyItem.gameObject.destroy();
      this.#items.splice(nearbyItemIndex, 1);
      dataManager.addItemPickedUp(nearbyItem.id);
      this.#dialogUi.showDialogModal([`You found a ${item.name}`]);
    }
  }

  /**
   * @returns {void}
   */
  #handlePlayerMovementUpdate() {
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: this.#player.sprite.x,
      y: this.#player.sprite.y,
    });

    if (!this.#encounterLayer) {
      return;
    }

    const isInEncounterZone =
      this.#encounterLayer.getTileAtWorldXY(
        this.#player.sprite.x,
        this.#player.sprite.y,
        true
      ).index !== -1;

    if (!isInEncounterZone) {
      return;
    }

    console.log(
      `[${WorldScene.name}:handlePlayerMovementUpdate] player is in a encounter zone`
    );

    playSoundFx(this, AUDIO_ASSET_KEYS.GRASS);

    this.#wildEnemyEncountered = Math.random() < 0.2;

    if (this.#wildEnemyEncountered) {
      const encounterAreaId = /** @type {TiledObjectProperty[]} */ (
        this.#encounterLayer.layer.properties
      ).find(
        (property) => property.name === TILED_ENCOUNTER_PROPERTY.AREA
      ).value;

      const possibleMonsters = DataUtils.getEncounterAreaDetails(
        this,
        encounterAreaId
      );

      const randomEnemyId = weightedRandom(possibleMonsters);

      console.log(
        `[${WorldScene.name}:handlePlayerMovementUpdate] player encountered a wild monster in area ${encounterAreaId} and enemy id has been picked randomly ${randomEnemyId}`
      );
      this.cameras.main.fadeOut(2000);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          /** @type {import('./battle.js').BattleSceneData} */
          const dataToPass = {
            enemyCharacters: [DataUtils.getEnemyById(this, randomEnemyId)],
            playerCharacters: dataManager.store.get(
              DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY
            ),
          };

          this.scene.start(SCENE_KEYS.BATTLE_SCENE, dataToPass);
        }
      );
    }
  }

  #isPlayerInputLocked() {
    return (
      this._controls.isInputLocked ||
      this.#dialogUi.isVisible ||
      this.#menu.isVisible
    );
  }

  /**
   *
   * @param {Phaser.Tilemaps.Tilemap} map
   * @returns {void}
   */
  #createNPCs(map) {
    this.#npcs = [];

    const npcLayers = map
      .getObjectLayerNames()
      .filter((layerName) => layerName.includes('NPC'));

    npcLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);

      const npcObject = layer.objects.find((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC;
      });

      if (
        !npcObject ||
        npcObject.x === undefined ||
        npcObject.y === undefined
      ) {
        return;
      }

      // Get the path objects for the npc
      const pathObjects = layer.objects.filter((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC_PATH;
      });

      /** @type {import('../world/characters/npc.js').NPCPath} */
      const npcPath = {
        0: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
      };

      pathObjects.forEach((obj) => {
        if (obj.x === undefined || obj.y === undefined) {
          return;
        }

        npcPath[parseInt(obj.name, 10)] = { x: obj.x, y: obj.y - TILE_SIZE };
      });

      /** @type {string} */
      const npcFrame =
        /** @type {TiledObjectProperty[]} */
        npcObject.properties.find(
          (property) => property.name === TILED_NPC_PROPERTY.FRAME
        )?.value || '0';

      /** @type {string} */
      const npcMessagesString =
        /** @type {TiledObjectProperty[]} */
        npcObject.properties.find(
          (property) => property.name === TILED_NPC_PROPERTY.MESSAGES
        )?.value || '';

      /** @type {import('../world/characters/npc.js').NpcMovementPattern} */
      const npcMovement =
        /** @type {TiledObjectProperty[]} */ npcObject.properties.find(
          (property) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
        )?.value || 'IDLE';

      const npcMessages = npcMessagesString.split('::');

      const npc = new NPC({
        scene: this,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcFrame, 10),
        messages: npcMessages,
        npcPath,
        movementPattern: npcMovement,
      });

      this.#npcs.push(npc);
    });
  }

  /**
   * @param {Phaser.Tilemaps.Tilemap} map
   * @returns {void}
   */
  #createItems(map) {
    const itemObjectLayer = map.getObjectLayer('Item');
    if (!itemObjectLayer) {
      return;
    }
    const items = itemObjectLayer.objects;
    const validItems = items.filter((item) => {
      return item.x !== undefined && item.y !== undefined;
    });

    /** @type {number[]} */
    const itemsPickedUp =
      dataManager.store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [];

    for (const tiledItem of validItems) {
      /** @type {number} */
      const itemId = /** @type {TiledObjectProperty[]} */ (
        tiledItem.properties
      ).find(
        (property) => property.name === TILED_ITEM_PROPERTY.ITEM_ID
      )?.value;

      /** @type {number} */
      const id = /** @type {TiledObjectProperty[]} */ (
        tiledItem.properties
      ).find((property) => property.name === TILED_ITEM_PROPERTY.ID)?.value;

      // @ts-ignore
      if (itemsPickedUp.includes(id)) {
        continue;
      }

      // Create object
      const item = new Item({
        scene: this,
        position: {
          x: tiledItem.x,
          y: tiledItem.y - TILE_SIZE,
        },
        itemId,
        id,
      });
      this.#items.push(item);
    }
  }

  /**
   * @returns {void}
   */
  #handlePlayerDirectionUpdate() {
    // Update player direction on global data store
    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
      this.#player.direction
    );
  }

  /**
   * @returns {void}
   */
  #healPlayerParty() {
    // Heal all characters in party
    /** @type {import('../types/typedef.js').Character[]} */
    const characters = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY
    );
    characters.forEach((monster) => {
      monster.currentHp = monster.maxHp;
    });
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY, characters);
  }
}
