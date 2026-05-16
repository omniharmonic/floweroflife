import './styles.css';
import { SceneManager } from './scene/SceneManager.js';
import { FlowerOfLife } from './flower/FlowerOfLife.js';
import { AudioInput } from './audio/AudioInput.js';
import { GUIControls } from './controls/GUIControls.js';
import { createParams } from './config/defaults.js';
import { PermissionsOverlay } from './ui/PermissionsOverlay.js';
import { HandFaceTracker } from './tracking/HandFaceTracker.js';

const container = document.querySelector('#app');
const params = createParams();
const sceneManager = new SceneManager(container);
const flower = new FlowerOfLife(params);
const audioInput = new AudioInput();
const tracker = new HandFaceTracker();

let latestAudio = audioInput.snapshot();
let latestCamera = tracker.snapshot();

sceneManager.scene.add(flower.group);

const gui = new GUIControls(params, {
  onChange: () => {
    flower.update(sceneManager.clock.elapsedTime, latestAudio, latestCamera, params);
  },
});

new PermissionsOverlay({
  onEnable: async () => {
    const results = await Promise.allSettled([audioInput.init(), tracker.init()]);
    const successes = results.filter((result) => result.status === 'fulfilled');

    if (!successes.length) {
      throw new Error('No media permissions granted');
    }
  },
});

function animate() {
  requestAnimationFrame(animate);
  const time = sceneManager.clock.getElapsedTime();
  const size = sceneManager.renderer.getSize(flower.resolution);
  flower.resize(size.x, size.y);
  latestAudio = audioInput.update({ decayRate: params.decayRate });
  latestCamera = tracker.update(time);
  flower.update(time, latestAudio, latestCamera, params);
  sceneManager.render();
}

animate();

window.addEventListener('beforeunload', () => {
  gui.dispose();
  flower.dispose();
  audioInput.stop();
  tracker.stop();
  sceneManager.dispose();
});
