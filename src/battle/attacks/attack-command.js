export default class AttackCommand {
  constructor(attack, position) {
    this.attack = attack;
    this.position = position;
  }

  execute(callback) {
    this.attack.gameObject.setPosition(this.position.x, this.position.y);
    this.attack.playAnimation(callback);
  }
}
