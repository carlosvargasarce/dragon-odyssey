import { Character } from '../character.js';
import IMovementBehavior from './IMovementBehavior.js';

export default class NormalMovement extends IMovementBehavior {
  /**
   *
   * @param {Character} character
   * @param {import("src/common/direction.js").Direction} direction
   */
  move(character, direction) {
    character.moveSprite(direction);
  }
}
