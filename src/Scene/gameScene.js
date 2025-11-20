import { createHandLandmarker, detectThrow, setOnThrow, setOnLandmarks } from '../handTracker.js';

var count = 0;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const SIZE = 50;

        // player square
        const startX = W / 2 - SIZE / 2;
        const startY = H / 2 - SIZE / 2;
        this.player = this.add.rectangle(startX, startY, SIZE, SIZE, 0xffffff).setOrigin(0);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(SIZE, SIZE);

        // controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // webcam video element (existing in DOM)
        this.video = document.getElementById('webcam');
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then((stream) => {
                this.video.srcObject = stream;
                return this.video.play();
            })
            .catch((err) => console.warn('Webcam error:', err));

        // style video to be a small camera in top-right corner (DOM overlay)
        const miniW = 160;
        const miniH = 120;
        Object.assign(this.video.style, {
            position: 'absolute',
            width: `${miniW}px`,
            height: `${miniH}px`,
            top: '10px',
            right: '10px',
            border: '3px solid rgba(255,255,255,0.9)',
            borderRadius: '6px',
            zIndex: 9999,
            objectFit: 'cover',
            pointerEvents: 'none'
        });

        // hand landmarker setup
        createHandLandmarker().catch(e => console.warn('HandLandmarker init failed', e));

        // throw handler (existing)
        setOnThrow((power, wrist) => this.throwSnowball(power, wrist));

        // landmarks callback: keep latest positions
        this.latest = null;
        setOnLandmarks((data) => {
            this.latest = data; // may be null when no hand
        });

        // graphics for overlays
        this.overlay = this.add.graphics();
        this.overlay.setDepth(1000);
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    }

    throwSnowball(power, wrist) {
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        const ball = this.add.circle(px, py, 10, 0x88ccff);
        this.physics.add.existing(ball);
        ball.body.setCollideWorldBounds(true);
        ball.body.onWorldBounds = true;
        const velocity = 200 + power * 5;
        ball.body.setVelocity(0, -velocity);
        ball.body.world.on('worldbounds', function(body) {
            if (body.gameObject === ball) {
                ball.destroy();
            }
        });
    }

    update() {
        const playerSpeed = 200;
        this.player.body.setVelocity(0);
        if (this.cursors.left.isDown)  this.player.body.setVelocityX(-playerSpeed);
        if (this.cursors.right.isDown) this.player.body.setVelocityX(playerSpeed);
        if (this.cursors.up.isDown)    this.player.body.setVelocityY(-playerSpeed);
        if (this.cursors.down.isDown)  this.player.body.setVelocityY(playerSpeed);
        if (this.wasd.A.isDown)        this.player.body.setVelocityX(-playerSpeed);
        if (this.wasd.D.isDown)        this.player.body.setVelocityX(playerSpeed);
        if (this.wasd.W.isDown)        this.player.body.setVelocityY(-playerSpeed);
        if (this.wasd.S.isDown)        this.player.body.setVelocityY(playerSpeed);

        // call detector every N frames
        if (this.video && this.video.readyState >= 2) {
            if (count % 3 === 0) {
                detectThrow(this.video);
            }
        }
        count++;

        // draw overlays for wrist/elbow
        this.overlay.clear();
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        if (!this.latest) return;

        const { wrist, elbow } = this.latest;
        // convert normalized coords to screen
        const wristX = wrist.x * W;
        const wristY = wrist.y * H;
        const elbowX = elbow.x * W;
        const elbowY = elbow.y * H;

        // boxes
        this.overlay.lineStyle(2, 0xffff00);
        this.overlay.strokeRect(wristX - 10, wristY - 10, 20, 20); // wrist box
        this.overlay.lineStyle(2, 0xff00ff);
        this.overlay.strokeRect(elbowX - 10, elbowY - 10, 20, 20); // elbow box
    }
}