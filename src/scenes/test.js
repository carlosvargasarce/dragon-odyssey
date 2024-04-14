import { CLASSES_ASSET_KEYS, ENEMY_ASSET_KEYS } from '../assets/asset-keys.js';
import { ATTACK_KEYS } from '../battle/attacks/attack-keys.js';
import { IceShard } from '../battle/attacks/ice-shard.js';
import { Slash } from '../battle/attacks/slash.js';
import { Background } from '../battle/background.js';
import TweakPane from '../lib/tweakpane.js';
import { makeDraggable } from '../utils/draggable.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class TestScene extends Phaser.Scene {
  /** @type {import('../battle/attacks/attack-keys.js').AttackKeys} */
  #selectedAttack;
  /** @type {IceShard} */
  #iceShardAttack;
  /** @type {Slash} */
  #slashAttack;
  /** @type {Phaser.GameObjects.Image} */
  #playerMonster;
  /** @type {Phaser.GameObjects.Image} */
  #enemyMonster;

  constructor() {
    super({ key: SCENE_KEYS.TEST_SCENE });
  }

  /**
   * @returns {void}
   */
  init() {
    this.#selectedAttack = ATTACK_KEYS.SLASH;
  }

  /**
   * @returns {void}
   */
  create() {
    const background = new Background(this);
    background.showMeadow();

    this.#playerMonster = this.add
      .image(256, 316, CLASSES_ASSET_KEYS.BERSEKER, 0)
      .setFlipX(false);
    this.#enemyMonster = this.add
      .image(768, 144, ENEMY_ASSET_KEYS.FERNBITE, 0)
      .setFlipX(false);
    makeDraggable(this.#enemyMonster);

    this.#iceShardAttack = new IceShard(this, { x: 256, y: 344 });
    this.#slashAttack = new Slash(this, { x: 745, y: 140 });

    this.#addDataGui();
  }

  /**
   * @returns {void}
   */
  #addDataGui() {
    const pane = new TweakPane.Pane();

    const f1 = pane.addFolder({
      title: 'Monsters',
      expanded: true,
    });
    const playerMonsterFolder = f1.addFolder({
      title: 'Player',
      expanded: true,
    });
    playerMonsterFolder.addBinding(this.#playerMonster, 'x', {
      min: 0,
      max: 1024,
      step: 1,
    });
    playerMonsterFolder.addBinding(this.#playerMonster, 'y', {
      min: 0,
      max: 576,
      step: 1,
    });

    const enemyMonsterFolder = f1.addFolder({
      title: 'Enemy',
      expanded: true,
    });
    enemyMonsterFolder.addBinding(this.#enemyMonster, 'x', { readonly: true });
    enemyMonsterFolder.addBinding(this.#enemyMonster, 'y', { readonly: true });

    const f2Params = {
      attack: this.#selectedAttack,
      x: 745,
      y: 120,
    };
    const f2 = pane.addFolder({
      title: 'Attacks',
      expanded: true,
    });
    f2.addBinding(f2Params, 'attack', {
      options: {
        [ATTACK_KEYS.SLASH]: ATTACK_KEYS.SLASH,
        [ATTACK_KEYS.ICE_SHARD]: ATTACK_KEYS.ICE_SHARD,
      },
    }).on('change', (ev) => {
      if (ev.value === ATTACK_KEYS.ICE_SHARD) {
        this.#selectedAttack = ATTACK_KEYS.ICE_SHARD;
        f2Params.x = this.#iceShardAttack.gameObject.x;
        f2Params.y = this.#iceShardAttack.gameObject.y;
        f2.refresh();
        return;
      }
      if (ev.value === ATTACK_KEYS.SLASH) {
        this.#selectedAttack = ATTACK_KEYS.SLASH;
        f2Params.x = this.#slashAttack.gameObject.x;
        f2Params.y = this.#slashAttack.gameObject.y;
        f2.refresh();
        return;
      }
    });

    const playAttackButton = f2.addButton({
      title: 'Play',
    });
    playAttackButton.on('click', () => {
      if (this.#selectedAttack === ATTACK_KEYS.ICE_SHARD) {
        this.#iceShardAttack.playAnimation();
        return;
      }
      if (this.#selectedAttack === ATTACK_KEYS.SLASH) {
        this.#slashAttack.playAnimation();
        return;
      }
    });

    f2.addBinding(f2Params, 'x', {
      min: 0,
      max: 1024,
      step: 1,
    }).on('change', (ev) => {
      this.#updateAttackGameObjectPosition('x', ev.value);
    });
    f2.addBinding(f2Params, 'y', {
      min: 0,
      max: 576,
      step: 1,
    }).on('change', (ev) => {
      this.#updateAttackGameObjectPosition('y', ev.value);
    });
  }

  /**
   * @param {'x' | 'y'} param
   * @param {number} value
   * @returns {void}
   */
  #updateAttackGameObjectPosition(param, value) {
    if (param === 'x') {
      if (this.#selectedAttack === ATTACK_KEYS.SLASH) {
        this.#slashAttack.gameObject.setX(value);
        return;
      }
      if (this.#selectedAttack === ATTACK_KEYS.ICE_SHARD) {
        this.#iceShardAttack.gameObject.setX(value);
        return;
      }
    }
    if (this.#selectedAttack === ATTACK_KEYS.SLASH) {
      this.#slashAttack.gameObject.setY(value);
      return;
    }
    if (this.#selectedAttack === ATTACK_KEYS.ICE_SHARD) {
      this.#iceShardAttack.gameObject.setY(value);
      return;
    }
  }
}
