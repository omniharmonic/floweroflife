export const defaultParams = {
  preset: 'Altar',
  ringCount: 2,
  circleRadius: 0.24,
  ringThickness: 0.006,
  baseHue: 44,
  hueDrift: 1.6,
  baseBrightness: 0.032,
  audioSensitivity: 0.58,
  decayRate: 0.035,
  mode2D3D: 0,
  layerDepth: 0.12,
  cameraSensitivity: 0.48,
  motionSensitivity: 0.22,
  baselinePulse: 0.48,
  baselinePulseRate: 0.32,
  audioBloom: 0.72,
  audioPulse: 0.68,
  audioRipple: 0.52,
  audioHueShift: 0.55,
  audioWarp: 0.4,
  trebleShimmer: 0.34,
  midSwirl: 0.42,
  psychedelicIntensity: 0.58,
};

export function createParams(overrides = {}) {
  return { ...defaultParams, ...overrides };
}
