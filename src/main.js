import GameScene from './gameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    physics: {
        default: 'arcade'
    },
    scene: [ GameScene ]
};

new Phaser.Game(config);