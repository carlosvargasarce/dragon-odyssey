import { PreLoader } from './scenes/PreLoader.js';
import { Battle } from './scenes/Battle.js';

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
  scene: [PreLoader, Battle],
};

export default new Phaser.Game(config);
