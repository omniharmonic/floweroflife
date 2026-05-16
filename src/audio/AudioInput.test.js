import { describe, expect, it } from 'vitest';
import { computeBands, smoothBand } from './AudioInput.js';

describe('AudioInput helpers', () => {
  it('smooths with fast attack and slow release', () => {
    expect(smoothBand(0.1, 0.9, { attack: 0.3, release: 0.05 })).toBeCloseTo(0.34);
    expect(smoothBand(0.9, 0.1, { attack: 0.3, release: 0.05 })).toBeCloseTo(0.86);
  });

  it('uses decay rate as the release coefficient', () => {
    expect(smoothBand(1, 0, { attack: 0.3, release: 0.02 })).toBeCloseTo(0.98);
    expect(smoothBand(1, 0, { attack: 0.3, release: 0.2 })).toBeCloseTo(0.8);
  });

  it('computes RMS and frequency bands in 0..1 range', () => {
    const timeDomain = new Uint8Array([128, 255, 128, 0]);
    const frequency = new Uint8Array(1024);
    frequency.fill(0);
    frequency[3] = 255;
    frequency[30] = 128;
    frequency[160] = 64;

    const bands = computeBands({
      timeDomain,
      frequency,
      sampleRate: 48000,
      fftSize: 2048,
    });

    expect(bands.rms).toBeGreaterThan(0);
    expect(bands.bass).toBeGreaterThan(bands.mid);
    expect(bands.mid).toBeGreaterThan(bands.treble);
    expect(Object.values(bands).every((value) => value >= 0 && value <= 1)).toBe(true);
  });
});
