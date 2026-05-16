import { describe, expect, it } from 'vitest';
import { defaultParams } from './defaults.js';

describe('defaultParams', () => {
  it('starts with restrained sensitivity and slow decay for meditative motion', () => {
    expect(defaultParams.audioSensitivity).toBeGreaterThanOrEqual(0.52);
    expect(defaultParams.audioSensitivity).toBeLessThanOrEqual(0.68);
    expect(defaultParams.decayRate).toBeLessThanOrEqual(0.045);
    expect(defaultParams.motionSensitivity).toBeLessThanOrEqual(0.28);
    expect(defaultParams.cameraSensitivity).toBeLessThanOrEqual(0.55);
    expect(defaultParams.hueDrift).toBeLessThanOrEqual(2.2);
  });

  it('exposes composable psychedelic and audio modulation lanes', () => {
    expect(defaultParams.baselinePulse).toBeGreaterThan(0);
    expect(defaultParams.baselinePulseRate).toBeGreaterThan(0);
    expect(defaultParams.audioBloom).toBeGreaterThan(0);
    expect(defaultParams.audioPulse).toBeGreaterThan(0);
    expect(defaultParams.audioRipple).toBeGreaterThan(0);
    expect(defaultParams.audioHueShift).toBeGreaterThan(0);
    expect(defaultParams.audioWarp).toBeGreaterThan(0);
    expect(defaultParams.trebleShimmer).toBeGreaterThan(0);
    expect(defaultParams.midSwirl).toBeGreaterThan(0);
    expect(defaultParams.psychedelicIntensity).toBeGreaterThan(0);
    expect(defaultParams.psychedelicIntensity).toBeLessThanOrEqual(1);
  });
});
