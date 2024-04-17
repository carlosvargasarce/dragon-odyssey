import { MudShot } from '../mud-shot.js';
import AttackFactory from './attack-factory.js';

class MudShotFactory extends AttackFactory {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {import('../../../types/typedef.js').Coordinate} position
   */
  createAttack(scene, position) {
    return new MudShot(scene, position);
  }
}

export default MudShotFactory;
