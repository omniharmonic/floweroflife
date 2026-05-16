export const presets = {
  Altar: {
    ringCount: 2,
    baseHue: 44,
    hueDrift: 1.4,
    baseBrightness: 0.032,
    circleRadius: 0.245,
    ringThickness: 0.0058,
    audioSensitivity: 0.55,
    mode2D3D: 0,
    layerDepth: 0.08,
    baselinePulse: 0.44,
    audioBloom: 0.62,
    audioPulse: 0.55,
    audioRipple: 0.34,
    audioHueShift: 0.34,
    audioWarp: 0.22,
    trebleShimmer: 0.22,
    midSwirl: 0.26,
    psychedelicIntensity: 0.42,
  },
  Portal: {
    ringCount: 3,
    baseHue: 258,
    hueDrift: 2.1,
    baseBrightness: 0.03,
    circleRadius: 0.21,
    ringThickness: 0.005,
    audioSensitivity: 0.66,
    mode2D3D: 1,
    layerDepth: 0.18,
    baselinePulse: 0.62,
    audioBloom: 0.88,
    audioPulse: 0.82,
    audioRipple: 0.72,
    audioHueShift: 0.78,
    audioWarp: 0.68,
    trebleShimmer: 0.48,
    midSwirl: 0.72,
    psychedelicIntensity: 0.82,
  },
  Grid: {
    ringCount: 5,
    baseHue: 188,
    hueDrift: 2.6,
    baseBrightness: 0.026,
    circleRadius: 0.165,
    ringThickness: 0.0042,
    audioSensitivity: 0.6,
    mode2D3D: 0,
    layerDepth: 0.1,
    baselinePulse: 0.36,
    audioBloom: 0.7,
    audioPulse: 0.62,
    audioRipple: 0.58,
    audioHueShift: 0.5,
    audioWarp: 0.36,
    trebleShimmer: 0.52,
    midSwirl: 0.34,
    psychedelicIntensity: 0.62,
  },
};

export function applyPreset(params, presetName) {
  const preset = presets[presetName];
  if (!preset) {
    return { ...params };
  }

  const preservedLiveTuning = {
    audioSensitivity: params.audioSensitivity,
    decayRate: params.decayRate,
    cameraSensitivity: params.cameraSensitivity,
    motionSensitivity: params.motionSensitivity,
    baselinePulseRate: params.baselinePulseRate,
  };

  return {
    ...params,
    ...preset,
    ...preservedLiveTuning,
    preset: presetName,
  };
}
