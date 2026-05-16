import { describe, expect, it } from 'vitest';
import {
  axialDistance,
  generateFlowerCenters,
  normalizeScreenPoint,
  smoothPoint,
} from './FlowerMath.js';

describe('FlowerMath', () => {
  it('counts lattice centers for each flower ring', () => {
    expect(generateFlowerCenters(1)).toHaveLength(7);
    expect(generateFlowerCenters(2)).toHaveLength(19);
    expect(generateFlowerCenters(3)).toHaveLength(37);
    expect(generateFlowerCenters(5)).toHaveLength(91);
  });

  it('keeps only centers inside axial hex distance', () => {
    const centers = generateFlowerCenters(2);

    expect(centers.every((center) => axialDistance(center.q, center.r) <= 2)).toBe(true);
    expect(centers.some((center) => center.q === 2 && center.r === 0)).toBe(true);
    expect(centers.some((center) => center.q === 2 && center.r === 1)).toBe(false);
  });

  it('normalizes screen coordinates into centered shader space', () => {
    expect(normalizeScreenPoint({ x: 0, y: 0 }, { width: 200, height: 100 })).toEqual({
      x: -1,
      y: 1,
    });
    expect(normalizeScreenPoint({ x: 200, y: 100 }, { width: 200, height: 100 })).toEqual({
      x: 1,
      y: -1,
    });
  });

  it('smooths points without overshooting', () => {
    expect(smoothPoint({ x: 0, y: 0 }, { x: 10, y: -10 }, 0.25)).toEqual({
      x: 2.5,
      y: -2.5,
    });
  });
});
