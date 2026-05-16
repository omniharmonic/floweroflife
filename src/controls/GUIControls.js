import GUI from 'lil-gui';
import { applyPreset, presets } from '../config/presets.js';

export class GUIControls {
  constructor(params, { onChange }) {
    this.params = params;
    this.onChange = onChange;
    this.gui = new GUI({ title: 'Lattice Tuning' });
    this.gui.domElement.classList.add('fol-gui');
    this.flowerFolder = this.gui.addFolder('Flower of Life');
    this.audioFolder = this.gui.addFolder('Audio Modulation');
    this.psychedelicFolder = this.gui.addFolder('Psychedelic Field');
    this.interactionFolder = this.gui.addFolder('Interaction');
    this.addControls();
  }

  addControls() {
    this.flowerFolder
      .add(this.params, 'preset', Object.keys(presets))
      .name('preset')
      .onChange((presetName) => {
        Object.assign(this.params, applyPreset(this.params, presetName));
        this.refresh();
        this.onChange(this.params);
      });

    this.flowerFolder.add(this.params, 'ringCount', 1, 6, 1).name('rings').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'mode2D3D', { '2D lattice': 0, '3D portal': 1 }).name('mode').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'circleRadius', 0.12, 0.34, 0.001).name('circle radius').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'ringThickness', 0.002, 0.016, 0.0005).name('line weight').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'baseHue', 0, 360, 1).name('base hue').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'hueDrift', 0, 5, 0.05).name('hue drift').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'baseBrightness', 0.005, 0.09, 0.001).name('brightness floor').onChange(this.onChange);
    this.flowerFolder.add(this.params, 'layerDepth', 0.02, 0.28, 0.005).name('3D depth').onChange(this.onChange);

    this.audioFolder.add(this.params, 'audioSensitivity', 0, 1.6, 0.01).name('input gain').onChange(this.onChange);
    this.audioFolder.add(this.params, 'decayRate', 0.008, 0.08, 0.002).name('decay length').onChange(this.onChange);
    this.audioFolder.add(this.params, 'audioBloom', 0, 1.5, 0.01).name('halo bloom').onChange(this.onChange);
    this.audioFolder.add(this.params, 'audioPulse', 0, 1.5, 0.01).name('breath pulse').onChange(this.onChange);
    this.audioFolder.add(this.params, 'audioRipple', 0, 1.5, 0.01).name('ripple rings').onChange(this.onChange);
    this.audioFolder.add(this.params, 'audioHueShift', 0, 1.5, 0.01).name('color drift').onChange(this.onChange);
    this.audioFolder.add(this.params, 'trebleShimmer', 0, 1.5, 0.01).name('treble shimmer').onChange(this.onChange);

    this.psychedelicFolder.add(this.params, 'baselinePulse', 0, 1.25, 0.01).name('baseline pulse').onChange(this.onChange);
    this.psychedelicFolder.add(this.params, 'baselinePulseRate', 0.05, 1.2, 0.01).name('pulse rate').onChange(this.onChange);
    this.psychedelicFolder.add(this.params, 'midSwirl', 0, 1.5, 0.01).name('mid swirl').onChange(this.onChange);
    this.psychedelicFolder.add(this.params, 'audioWarp', 0, 1.4, 0.01).name('geometry warp').onChange(this.onChange);
    this.psychedelicFolder.add(this.params, 'psychedelicIntensity', 0, 1.4, 0.01).name('field intensity').onChange(this.onChange);

    this.interactionFolder.add(this.params, 'cameraSensitivity', 0, 0.9, 0.01).name('camera lights').onChange(this.onChange);
    this.interactionFolder.add(this.params, 'motionSensitivity', 0, 0.75, 0.01).name('motion ripple').onChange(this.onChange);
  }

  refresh() {
    this.gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
  }

  dispose() {
    this.gui.destroy();
  }
}
