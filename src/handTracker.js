// module handling MediaPipe hand landmarker and throw detection
export let handLandmarker = undefined;

let lastWristX = 0;
let lastWristY = 0;
let isThrowing = false;
let onThrow = null;

// register a callback to be called when a throw is detected
export const setOnThrow = (fn) => { onThrow = fn; };

// create the hand landmarker (loads the wasm and model)
export const createHandLandmarker = async () => {
    // dynamic import from CDN (provides FilesetResolver & HandLandmarker)
    const mp = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0');
    const { FilesetResolver, HandLandmarker } = mp;
    const visionGen = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(visionGen, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });

    console.log("Hand landmarker ready");
};

// run detection on a video frame and trigger callback on throw
export function detectThrow(videoInput) {
    if (!handLandmarker) return;
    const result = handLandmarker.detectForVideo(videoInput, Date.now());
    if (!result || !result.landmarks || result.landmarks.length === 0) return;

    const wrist = result.landmarks[0][0]; // point 0 is wrist (normalized coords)
    const distance = Math.hypot(wrist.x - lastWristX, wrist.y - lastWristY);
    console.log('Wrist distance:', distance);
    if (distance > 0.1 && isThrowing === false) {
        const throwPower = distance * 100;
        if (typeof onThrow === 'function') onThrow(throwPower, wrist);
        isThrowing = true;
    }

    if (distance < 0.02) {
        isThrowing = false;
    }

    lastWristX = wrist.x;
    lastWristY = wrist.y;
}