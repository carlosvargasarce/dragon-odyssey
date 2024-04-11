/**
 *
 * @param {Phaser.Scene} scene
 * @param {import('../../../types/typedef.js').Coordinate} position
 */
class AttackFactory {
  createAttack(scene, position) {
    throw new Error('Este método debe ser implementado por una subclase.');
  }
}

export default AttackFactory;
