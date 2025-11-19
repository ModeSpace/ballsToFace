# Winter25-Hackathon

Minimal Phaser 3 demo that displays text and responds to clicks/taps.

Files added:
- `index.html` — small HTML wrapper that loads Phaser from CDN and `src/gameScene.js`.
- `src/gameScene.js` — minimal Phaser scene that shows text and toggles color on pointer down.

Run locally (from project root):

```bash
# Start a simple HTTP server (Python 3)
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

Notes:
- No build step required. Phaser is loaded from CDN.
- If you prefer npm, you can scaffold with `npm init` and install `phaser` as a dependency.

Members:
- Jimy Shi


