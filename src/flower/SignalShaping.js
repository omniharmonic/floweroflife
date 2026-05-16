function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function shapeEnergy(value, sensitivity = 1) {
  const scaled = clamp01(value * sensitivity);
  return (1 - Math.exp(-scaled * 2.0)) * 0.68;
}

export function shapeLightIntensity(value, sensitivity = 1) {
  const scaled = clamp01(value * sensitivity);
  return Math.sqrt(scaled) * 0.46;
}

export function slewLimit(previous, next, maxStep) {
  const delta = next - previous;
  const step = Math.min(Math.abs(delta), maxStep);
  return previous + Math.sign(delta) * step;
}
