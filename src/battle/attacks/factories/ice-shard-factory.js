import { IceShard } from '../ice-shard.js';
import AttackFactory from './attack-factory.js';

/**
 *
 * @param {Phaser.Scene} scene
 * @param {import('../../../types/typedef.js').Coordinate} position
 */
class IceShardFactory extends AttackFactory {
  createAttack(scene, position) {
    return new IceShard(scene, position);
  }
}

export default IceShardFactory;
