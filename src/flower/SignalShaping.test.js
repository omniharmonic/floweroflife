import { describe, expect, it } from 'vitest';
import { shapeEnergy, slewLimit, shapeLightIntensity } from './SignalShaping.js';

describe('SignalShaping', () => {
  it('compresses strong input so it blooms instead of saturating', () => {
    expect(shapeEnergy(0.05, 1)).toBeGreaterThan(0.04);
    expect(shapeEnergy(0.35, 1)).toBeGreaterThan(0.18);
    expect(shapeEnergy(1, 1)).toBeLessThan(0.7);
    expect(shapeEnergy(1, 2)).toBeLessThan(0.82);
  });

  it('lets sensitivity make audio visibly stronger without clipping', () => {
    expect(shapeEnergy(0.35, 1.4)).toBeGreaterThan(shapeEnergy(0.35, 0.55) * 1.8);
    expect(shapeEnergy(0.8, 1.4)).toBeLessThan(0.82);
  });

  it('slew-limits sudden changes between frames', () => {
    expect(slewLimit(0.1, 1, 0.08)).toBeCloseTo(0.18);
    expect(slewLimit(0.8, 0, 0.04)).toBeCloseTo(0.76);
  });

  it('keeps camera lights soft even at high confidence', () => {
    expect(shapeLightIntensity(1, 1)).toBeLessThan(0.5);
    expect(shapeLightIntensity(1, 2)).toBeLessThan(0.7);
  });
});
