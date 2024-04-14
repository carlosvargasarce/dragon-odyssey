import { Character } from '../character.js';

export default class IMovementBehavior {
  /**
   *
   * @param {Character} character
   * @param {import("src/common/direction.js").Direction} direction
   */
  move(character, direction) {
    throw new Error('This method should be implemented by subclasses');
  }
}
