import GameScene from './Scene/gameScene.js';
import TitleScene from "./Scene/titleScene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    physics: {
        default: 'arcade'
    },
    scene: [ TitleScene, GameScene ]
};

new Phaser.Game(config);