import Preloader from './scenes/preloader.js';
import Battle from './scenes/battle.js';

const config = {
  type: Phaser.CANVAS,
  pixelArt: false,
  backgroundColor: '#000000',
  scale: {
    width: 1024,
    height: 576,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
  },
  scene: [Preloader, Battle],
};

export default new Phaser.Game(config);
