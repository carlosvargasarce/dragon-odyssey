import { Slash } from '../slash.js';
import AttackFactory from './attack-factory.js';

class SlashFactory extends AttackFactory {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {import('../../../types/typedef.js').Coordinate} position
   */
  createAttack(scene, position) {
    return new Slash(scene, position);
  }
}

export default SlashFactory;
