// Phaser Scene: single player square + throwing snowball when hand-throw detected
import { createHandLandmarker, detectThrow, setOnThrow } from './handTracker.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const SIZE = 50;

        // single player square
        const startX = W / 2 - SIZE / 2;
        const startY = H / 2 - SIZE / 2;
        this.player = this.add.rectangle(startX, startY, SIZE, SIZE, 0xffffff).setOrigin(0);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(SIZE, SIZE);

        // controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // webcam video element
        this.video = document.getElementById('webcam');
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then((stream) => {
                this.video.srcObject = stream;
                return this.video.play();
            })
            .catch((err) => console.warn('Webcam error:', err));

        // setup hand landmarker
        createHandLandmarker().catch(e => console.warn('HandLandmarker init failed', e));

        // register throw handler
        setOnThrow((power, wrist) => this.throwSnowball(power, wrist));
    }

    // spawn a small circle that moves to the right using power
    throwSnowball(power, wrist) {
        // spawn at player's center
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        const ball = this.add.circle(px, py, 10, 0x88ccff);
        this.physics.add.existing(ball);
        ball.body.setCollideWorldBounds(true);
        ball.body.onWorldBounds = true;

        // simple direction: use horizontal velocity derived from power
        const velocity = 200 + power * 5;
        //Set velcoity to directly up and destroy on any collision
        ball.body.setVelocity(0, -velocity);
        ball.body.world.on('worldbounds', function(body) {
            if (body.gameObject === ball) {
                ball.destroy();
            }
        });
    }

    update() {
        const speed = 200;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown)  this.player.body.setVelocityX(-speed);
        if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
        if (this.cursors.up.isDown)    this.player.body.setVelocityY(-speed);
        if (this.cursors.down.isDown)  this.player.body.setVelocityY(speed);

        // run the hand detection each frame (non-blocking; detector will ignore until ready)
        if (this.video && this.video.readyState >= 2) {
            detectThrow(this.video);
        }
    }
}