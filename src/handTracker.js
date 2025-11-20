import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let lastWristX = 0;
let lastWristY = 0;
let isThrowing = false;
let cooldown = 0;

let onThrow = null;
let onLandmarks = null;

export function setOnThrow(fn) { onThrow = fn; }
export function setOnLandmarks(fn) { onLandmarks = fn; }

export const createHandLandmarker = async () => {
    const visionGen = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(visionGen, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
    });
};

export function detectThrow(videoInput) {
    if (!handLandmarker) return;

    const result = handLandmarker.detectForVideo(videoInput, Date.now());
    if (!result || !result.landmarks || result.landmarks.length === 0) {
        if (onLandmarks) onLandmarks(null);
        return;
    }

    const lm = result.landmarks[0];
    const wrist = lm[0];
    const indexMcp = lm[5];
    const pinkyMcp = lm[17];
    const knuckleMid = { x: (indexMcp.x + pinkyMcp.x) / 2, y: (indexMcp.y + pinkyMcp.y) / 2 };
    const elbow = {
        x: wrist.x + (wrist.x - knuckleMid.x) * 0.6,
        y: wrist.y + (wrist.y - knuckleMid.y) * 0.6,
    };

    const vx = wrist.x - lastWristX;
    const vy = wrist.y - lastWristY;
    const speed = Math.hypot(vx, vy);

    if (speed > 0.1 && !isThrowing && cooldown <= 0) {
        cooldown = 10;
        const power = speed * 300;
        if (onThrow) onThrow(power, wrist);
        isThrowing = true;
    }
    if (speed < 0.02) {
        isThrowing = false;
    }
    cooldown--;

    lastWristX = wrist.x;
    lastWristY = wrist.y;

    if (onLandmarks) {
        onLandmarks({
            wrist,
            elbow
        });
    }
}