import { Slash } from '../slash.js';
import AttackFactory from './attack-factory.js';

/**
 *
 * @param {Phaser.Scene} scene
 * @param {import('../../../types/typedef.js').Coordinate} position
 */
class SlashFactory extends AttackFactory {
  createAttack(scene, position) {
    return new Slash(scene, position);
  }
}

export default SlashFactory;
