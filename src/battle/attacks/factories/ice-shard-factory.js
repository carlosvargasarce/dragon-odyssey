import { IceShard } from '../ice-shard.js';
import AttackFactory from './attack-factory.js';

class IceShardFactory extends AttackFactory {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {import('../../../types/typedef.js').Coordinate} position
   */
  createAttack(scene, position) {
    return new IceShard(scene, position);
  }
}

export default IceShardFactory;
