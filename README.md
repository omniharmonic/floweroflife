# Flower of Life Visualizer

Ambient, audio-reactive generative art for large displays and party spaces.

## Local Development

```bash
npm install
npm run dev
```

Open the local Vite URL, then use the permission overlay to enable microphone and camera reactivity. Press `F` or double-click the canvas for fullscreen.

## GPU And Display Notes

- The visualizer renders as a fullscreen Three.js shader, so the heavy work runs on the GPU.
- The renderer requests the browser's high-performance GPU profile and caps device pixel ratio to avoid overheating party laptops.
- GitHub Pages serves the app over HTTPS, so browser microphone and camera permissions work without paid hosting.
- For best venue results, run Chrome or Edge on a plugged-in laptop and disable battery saver.

## GitHub Pages Deployment

This project deploys with GitHub Actions to GitHub Pages at:

```text
https://omniharmonic.github.io/floweroflife/
```

The workflow runs unit tests and builds with the Vite base path for the repository:

```bash
npm run build:pages
```

## Verification

```bash
npm run test:run
npm run build
npm run test:e2e
```
