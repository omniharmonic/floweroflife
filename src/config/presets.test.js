import { describe, expect, it } from 'vitest';
import { applyPreset, presets } from './presets.js';

describe('presets', () => {
  it('provides altar, portal, and grid moods', () => {
    expect(Object.keys(presets)).toEqual(['Altar', 'Portal', 'Grid']);
  });

  it('applies presets without discarding unrelated live settings', () => {
    const params = applyPreset(
      {
        audioSensitivity: 0.42,
        ringCount: 1,
      },
      'Portal',
    );

    expect(params.audioSensitivity).toBe(0.42);
    expect(params.ringCount).toBe(3);
    expect(params.mode2D3D).toBe(1);
  });

  it('gives each preset a complete modulation profile', () => {
    for (const preset of Object.values(presets)) {
      expect(preset).toEqual(
        expect.objectContaining({
          baselinePulse: expect.any(Number),
          audioBloom: expect.any(Number),
          audioPulse: expect.any(Number),
          audioRipple: expect.any(Number),
          audioHueShift: expect.any(Number),
          audioWarp: expect.any(Number),
          trebleShimmer: expect.any(Number),
          midSwirl: expect.any(Number),
          psychedelicIntensity: expect.any(Number),
        }),
      );
    }
  });
});
