import {
  ALLIES_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { LATO_FONT_NAME } from '../assets/font-keys.js';
import { Healthbar } from '../battle/ui/healthbar.js';
import { DIRECTION } from '../common/direction.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import SpriteFacade from '../utils/spriteFacade.js';
// import { BaseScene } from './base-scene.js';
import { exhaustiveGuard } from '../utils/guard.js';
import { BaseScene } from './base.js';
import { SCENE_KEYS } from './scene-keys.js';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = {
  fontFamily: LATO_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '24px',
};

const ALLY_PARTY_POSITIONS = Object.freeze({
  EVEN: {
    x: 5,
    y: 5,
  },
  ODD: {
    x: 514,
    y: 40,
  },
  increment: 155,
});

/**
 * @typedef CharacterPartySceneData
 * @type {object}
 * @property {string} previousSceneName
 * @property {import('../types/typedef.js').Item} [itemSelected]
 */

export default class CharacterPartyScene extends BaseScene {
  /** @type {Phaser.GameObjects.Image[]} */
  #characterPartyBackgrounds;
  /** @type {Phaser.GameObjects.Image} */
  #cancelButton;
  /** @type {Phaser.GameObjects.Text} */
  #infoTextGameObject;
  /** @type {Healthbar[]} */
  #healthBars;
  /** @type {Phaser.GameObjects.Text[]} */
  #healthBarTextGameObjects;
  /** @type {number} */
  #selectedPartyCharacterIndex;
  /** @type {import('../types/typedef.js').Character[]} */
  #allies;
  /** @type {CharacterPartySceneData} */
  #sceneData;
  /** @type {boolean} */
  #waitingForInput;

  constructor() {
    super({
      key: SCENE_KEYS.ALLYS_SCENE,
    });
  }

  /**
   * @param {CharacterPartySceneData} data
   * @returns {void}
   */
  init(data) {
    super.init(data);

    this.#sceneData = data;
    this.#characterPartyBackgrounds = [];
    this.#healthBars = [];
    this.#healthBarTextGameObjects = [];
    this.#selectedPartyCharacterIndex = 0;
    this.#allies = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY
    );
    this.#waitingForInput = false;
  }

  /**
   * @returns {void}
   */
  create() {
    super.create();

    // Create custom background
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1)
      .setOrigin(0);
    SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: ALLIES_ASSET_KEYS.BACKGROUND_PATTERN }
    )
      .setOrigin(0)
      .setScale(0.46);

    // Create button
    const buttonContainer = this.add.container(883, 515, []);
    this.#cancelButton = SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: UI_ASSET_KEYS.RED_BUTTON, assetFrame: 0 }
    )
      .setOrigin(0)
      .setScale(0.7, 1)
      .setAlpha(0.9);

    const cancelText = this.add
      .text(66, 22, 'Cancel', UI_TEXT_STYLE)
      .setOrigin(0.5);
    buttonContainer.add([this.#cancelButton, cancelText]);

    // Create info container
    const infoContainer = this.add.container(4, this.scale.height - 69, []);
    const infoDisplay = this.add
      .rectangle(0, 0, 867, 65, 0xfffbf5, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0xd22727, 1);
    this.#infoTextGameObject = this.add.text(15, 14, '', {
      fontFamily: LATO_FONT_NAME,
      color: '#000000',
      fontSize: '32px',
    });
    infoContainer.add([infoDisplay, this.#infoTextGameObject]);
    this.#updateInfoContainerText();

    // Create allies in party
    this.#allies.forEach((character, index) => {
      const isEven = index % 2 === 0;
      const x = isEven
        ? ALLY_PARTY_POSITIONS.EVEN.x
        : ALLY_PARTY_POSITIONS.ODD.x;
      const y =
        (isEven ? ALLY_PARTY_POSITIONS.EVEN.y : ALLY_PARTY_POSITIONS.ODD.y) +
        ALLY_PARTY_POSITIONS.increment * Math.floor(index / 2);
      this.#createCharacter(x, y, character);
    });
    this.#movePlayerInputCursor(DIRECTION.NONE);
  }

  /**
   * @returns {void}
   */
  update() {
    super.update();

    if (this._controls.isInputLocked) {
      return;
    }

    if (this._controls.wasBackKeyPressed()) {
      if (this.#waitingForInput) {
        this.#updateInfoContainerText();
        this.#waitingForInput = false;
        return;
      }

      this.#goBackToPreviousScene(false);
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      if (this.#waitingForInput) {
        this.#updateInfoContainerText();
        this.#waitingForInput = false;
        return;
      }

      if (this.#selectedPartyCharacterIndex === -1) {
        this.#goBackToPreviousScene(false);
        return;
      }

      // handle input based on what player intention was (use item, view character details, select character to switch to)
      // if (
      //   this.#sceneData.previousSceneName === SCENE_KEYS.INVENTORY_SCENE &&
      //   this.#sceneData.itemSelected
      // ) {
      //   this.#handleItemUsed();
      //   return;
      // }

      this._controls.lockInput = true;
      // pause this scene and launch the character details scene
      /** @type {import('./details.js').CharacterDetailsSceneData} */
      const sceneDataToPass = {
        character: this.#allies[this.#selectedPartyCharacterIndex],
      };
      this.scene.launch(SCENE_KEYS.DETAILS_SCENE, sceneDataToPass);
      this.scene.pause(SCENE_KEYS.ALLYS_SCENE);

      return;
    }

    if (this.#waitingForInput) {
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.#movePlayerInputCursor(selectedDirection);
      this.#updateInfoContainerText();
    }
  }

  /**
   * @returns {void}
   */
  #updateInfoContainerText() {
    if (this.#selectedPartyCharacterIndex === -1) {
      this.#infoTextGameObject.setText('Go back to previous menu');
      return;
    }
    this.#infoTextGameObject.setText('Choose a character');
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {import('../types/typedef.js').Character} characterDetails
   * @returns {Phaser.GameObjects.Container}
   */
  #createCharacter(x, y, characterDetails) {
    const container = this.add.container(x, y, []);

    const background = SpriteFacade.createSprite(
      this,
      { x: 0, y: 0 },
      { assetKey: BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND_SOLID }
    )
      .setOrigin(0)
      .setScale(1.1, 1.2)
      .setAlpha(0.95);
    this.#characterPartyBackgrounds.push(background);

    const leftShadowCap = SpriteFacade.createSprite(
      this,
      { x: 160, y: 67 },
      { assetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW }
    )
      .setOrigin(0)
      .setAlpha(0.5);

    const middleShadow = SpriteFacade.createSprite(
      this,
      { x: leftShadowCap.x + leftShadowCap.width, y: 67 },
      { assetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW }
    )
      .setOrigin(0)
      .setAlpha(0.5);

    middleShadow.displayWidth = 285;

    const rightShadowCap = SpriteFacade.createSprite(
      this,
      { x: middleShadow.x + middleShadow.displayWidth, y: 67 },
      { assetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW }
    )
      .setOrigin(0)
      .setAlpha(0.5);

    const healthBar = new Healthbar(this, 100, 40, 240);

    healthBar.setMeterPercentageAnimated(
      characterDetails.currentHp / characterDetails.maxHp,
      {
        duration: 0,
        skipBattleAnimations: true,
      }
    );
    this.#healthBars.push(healthBar);

    const characterHpText = this.add.text(164, 68, 'HP', {
      fontFamily: LATO_FONT_NAME,
      color: '#D22727',
      fontSize: '24px',
    });

    const characterHealthBarLevelText = this.add.text(
      50,
      116,
      `Lv. ${characterDetails.currentLevel}`,
      {
        fontFamily: LATO_FONT_NAME,
        color: '#ffffff',
        fontSize: '22px',
      }
    );

    const characterNameGameText = this.add.text(
      160,
      34,
      characterDetails.name,
      {
        fontFamily: LATO_FONT_NAME,
        color: '#ffffff',
        fontSize: '30px',
      }
    );

    const healthBarTextGameObject = this.add
      .text(
        458,
        95,
        `${characterDetails.currentHp} / ${characterDetails.maxHp}`,
        {
          fontFamily: LATO_FONT_NAME,
          color: '#ffffff',
          fontSize: '38px',
        }
      )
      .setOrigin(1, 0);
    this.#healthBarTextGameObjects.push(healthBarTextGameObject);

    const characterImage = SpriteFacade.createSprite(
      this,
      { x: 35, y: 10 },
      { assetKey: characterDetails.assetKey }
    )
      .setOrigin(0)
      .setScale(0.35);

    container.add([
      background,
      healthBar.container,
      characterHpText,
      characterHealthBarLevelText,
      characterNameGameText,
      leftShadowCap,
      middleShadow,
      rightShadowCap,
      healthBarTextGameObject,
      characterImage,
    ]);

    return container;
  }

  /**
   * @param {boolean} itemUsed
   * @returns {void}
   */
  #goBackToPreviousScene(itemUsed) {
    this._controls.lockInput = true;
    this.scene.stop(SCENE_KEYS.ALLYS_SCENE);
    this.scene.resume(this.#sceneData.previousSceneName, { itemUsed });
  }

  /**
   * @param {import('../common/direction.js').Direction} direction
   * @returns {void}
   */
  #movePlayerInputCursor(direction) {
    switch (direction) {
      case DIRECTION.UP:
        // if we are already at the cancel button, then reset index
        if (this.#selectedPartyCharacterIndex === -1) {
          this.#selectedPartyCharacterIndex = this.#allies.length;
        }
        this.#selectedPartyCharacterIndex -= 1;
        // prevent from looping to the bottom
        if (this.#selectedPartyCharacterIndex < 0) {
          this.#selectedPartyCharacterIndex = 0;
        }
        this.#characterPartyBackgrounds[
          this.#selectedPartyCharacterIndex
        ].setAlpha(1);
        this.#cancelButton
          .setTexture(UI_ASSET_KEYS.RED_BUTTON, 0)
          .setAlpha(0.7);
        break;
      case DIRECTION.DOWN:
        // already at the bottom of the menu
        if (this.#selectedPartyCharacterIndex === -1) {
          break;
        }
        // increment index and check if we are pass the threshold
        this.#selectedPartyCharacterIndex += 1;
        if (this.#selectedPartyCharacterIndex > this.#allies.length - 1) {
          this.#selectedPartyCharacterIndex = -1;
        }
        if (this.#selectedPartyCharacterIndex === -1) {
          this.#cancelButton
            .setTexture(UI_ASSET_KEYS.RED_BUTTON_SELECTED, 0)
            .setAlpha(1);
          break;
        }
        this.#characterPartyBackgrounds[
          this.#selectedPartyCharacterIndex
        ].setAlpha(1);
        break;
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(direction);
    }

    this.#characterPartyBackgrounds.forEach((background, index) => {
      if (index === this.#selectedPartyCharacterIndex) {
        return;
      }
      background.setAlpha(0.8);
    });
  }

  /**
   * @returns {void}
   */
  // #handleItemUsed() {
  //   switch (this.#sceneData.itemSelected.effect) {
  //     case ITEM_EFFECT.HEAL_30:
  //       this.#handleHealItemUsed(30);
  //       break;
  //     default:
  //       exhaustiveGuard(this.#sceneData.itemSelected.effect);
  //   }
  // }

  /**
   * @param {number} amount the amount of health to heal the character by
   * @returns {void}
   */
  // #handleHealItemUsed(amount) {
  //   // validate that the character is not fainted
  //   if (this.#allies[this.#selectedPartyCharacterIndex].currentHp === 0) {
  //     this.#infoTextGameObject.setText('Cannot heal fainted character');
  //     this.#waitingForInput = true;
  //     return;
  //   }

  //   // validate that the character is not already fully healed
  //   if (
  //     this.#allies[this.#selectedPartyCharacterIndex].currentHp ===
  //     this.#allies[this.#selectedPartyCharacterIndex].maxHp
  //   ) {
  //     this.#infoTextGameObject.setText('Character is already fully healed');
  //     this.#waitingForInput = true;
  //     return;
  //   }

  //   // otherwise, heal character by the amount if we are not in a battle and show animation
  //   this._controls.lockInput = true;
  //   this.#allies[this.#selectedPartyCharacterIndex].currentHp += amount;
  //   if (
  //     this.#allies[this.#selectedPartyCharacterIndex].currentHp > this.#allies[this.#selectedPartyCharacterIndex].maxHp
  //   ) {
  //     this.#allies[this.#selectedPartyCharacterIndex].currentHp = this.#allies[this.#selectedPartyCharacterIndex].maxHp;
  //   }
  //   this.#infoTextGameObject.setText(`Healed character by ${amount} HP`);
  //   this.#healthBars[this.#selectedPartyCharacterIndex].setMeterPercentageAnimated(
  //     this.#allies[this.#selectedPartyCharacterIndex].currentHp / this.#allies[this.#selectedPartyCharacterIndex].maxHp,
  //     {
  //       callback: () => {
  //         this.#healthBarTextGameObjects[this.#selectedPartyCharacterIndex].setText(
  //           `${this.#allies[this.#selectedPartyCharacterIndex].currentHp} / ${
  //             this.#allies[this.#selectedPartyCharacterIndex].maxHp
  //           }`
  //         );
  //         dataManager.store.set(DATA_MANAGER_STORE_KEYS.ALLIES_IN_PARTY, this.#allies);
  //         this.time.delayedCall(300, () => {
  //           this.#goBackToPreviousScene(true);
  //         });
  //       },
  //     }
  //   );
  // }
}
