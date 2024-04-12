import Battle from './scenes/battle.js';
import Options from './scenes/options.js';
import Preloader from './scenes/preloader.js';
import Test from './scenes/test.js';
import Title from './scenes/title.js';
import World from './scenes/world.js';

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
  scene: [Preloader, Battle, World, Title, Options, Test],
};

export default new Phaser.Game(config);
