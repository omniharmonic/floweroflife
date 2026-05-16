precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform int uRingCount;
uniform float uCircleRadius;
uniform float uRingThickness;
uniform float uBaseHue;
uniform float uHueDrift;
uniform float uBaseBrightness;
uniform float uAudioRMS;
uniform float uAudioBass;
uniform float uAudioMid;
uniform float uAudioTreble;
uniform vec3 uLights[5];
uniform int uLightCount;
uniform int uMode2D3D;
uniform float uLayerDepth;
uniform float uLayerIndex;
uniform float uLayerCount;
uniform float uMotionEnergy;
uniform float uBaselinePulse;
uniform float uBaselinePulseRate;
uniform float uAudioBloom;
uniform float uAudioPulse;
uniform float uAudioRipple;
uniform float uAudioHueShift;
uniform float uAudioWarp;
uniform float uTrebleShimmer;
uniform float uMidSwirl;
uniform float uPsychedelicIntensity;

float axialDistance(float q, float r) {
  return (abs(q) + abs(r) + abs(q + r)) * 0.5;
}

vec2 axialToCartesian(float q, float r, float radius) {
  return vec2(radius * (q + r * 0.5), radius * (sqrt(3.0) * 0.5 * r));
}

vec2 cartesianToAxial(vec2 p, float radius) {
  float r = p.y / (radius * sqrt(3.0) * 0.5);
  float q = p.x / radius - r * 0.5;
  return vec2(q, r);
}

vec2 roundAxial(vec2 axial) {
  float x = axial.x;
  float z = axial.y;
  float y = -x - z;
  float rx = floor(x + 0.5);
  float ry = floor(y + 0.5);
  float rz = floor(z + 0.5);
  float xDiff = abs(rx - x);
  float yDiff = abs(ry - y);
  float zDiff = abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return vec2(rx, rz);
}

vec2 neighborOffset(int index) {
  if (index == 1) return vec2(1.0, 0.0);
  if (index == 2) return vec2(1.0, -1.0);
  if (index == 3) return vec2(0.0, -1.0);
  if (index == 4) return vec2(-1.0, 0.0);
  if (index == 5) return vec2(-1.0, 1.0);
  if (index == 6) return vec2(0.0, 1.0);
  return vec2(0.0, 0.0);
}

float sdFlower(vec2 p, float radius, int ringCount) {
  float nearest = 1000.0;
  vec2 nearestAxial = roundAxial(cartesianToAxial(p, radius));

  for (int i = 0; i < 7; i++) {
    vec2 axial = nearestAxial + neighborOffset(i);

    if (axialDistance(axial.x, axial.y) <= float(ringCount)) {
      vec2 center = axialToCartesian(axial.x, axial.y, radius);
      float circleDistance = abs(length(p - center) - radius);
      nearest = min(nearest, circleDistance);
    }
  }

  return nearest;
}

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

float organicField(vec2 p, float offset) {
  float swirl = 1.0 + uMidSwirl * (0.35 + uAudioMid * 0.55);
  float a = sin(p.x * 1.7 * swirl + p.y * 1.1 + uTime * (0.1 + uAudioMid * 0.08) + offset);
  float b = sin(length(p + vec2(0.23, -0.17)) * (3.5 + uPsychedelicIntensity * 1.8) - uTime * 0.08 + offset * 1.7);
  float c = cos((p.x - p.y) * (1.8 + uMidSwirl * 0.9) + uTime * 0.06 - offset);
  return 0.5 + 0.5 * (a * 0.45 + b * 0.35 + c * 0.2);
}

float lightField(vec2 p) {
  float field = 0.0;

  for (int i = 0; i < 5; i++) {
    if (i >= uLightCount) {
      break;
    }

    vec2 lightPos = uLights[i].xy;
    float intensity = uLights[i].z;
    float d = length(p - lightPos);
    field += intensity * exp(-d * d * 2.9);
  }

  return smoothstep(0.0, 0.8, clamp(field, 0.0, 1.0));
}

float brightnessAtHue(vec2 p, float distanceToRing, float hueOffset) {
  float audioEnergy = clamp(uAudioRMS * 1.05 + uAudioBass * 0.75 + uMotionEnergy * 0.42, 0.0, 1.0);
  float bassPulse = smoothstep(0.04, 0.5, uAudioBass);
  float pulseRate = 0.08 + uBaselinePulseRate * 0.45;
  float breathA = 0.5 + 0.5 * sin(uTime * pulseRate + uLayerIndex * 0.47 + bassPulse * uAudioPulse * 0.9);
  float breathB = 0.5 + 0.5 * sin(uTime * pulseRate * 0.53 + length(p) * 1.8 - uAudioBass * uAudioPulse);
  float breath = mix(breathA, breathB, 0.38 + uPsychedelicIntensity * 0.16);
  float ringMask = 1.0 - smoothstep(uRingThickness * 0.6, uRingThickness * 4.2, distanceToRing);
  float halo = exp(-distanceToRing * 19.0);
  float radial = length(p);
  float organism = organicField(p, hueOffset + uLayerIndex * 0.4);
  float ripple = sin(radial * (3.6 + uAudioRipple * 3.8 + uAudioTreble * uTrebleShimmer * 2.4) - uTime * (0.28 + uAudioBass * 0.5) + organism * 2.2);
  float cameraGlow = lightField(p);
  float trebleSpeckle = 0.5 + 0.5 * sin((p.x + p.y) * (9.0 + uTrebleShimmer * 11.0) + uTime * (0.75 + uAudioTreble * 2.4));
  float shimmer = mix(organicField(p * 1.35 + vec2(hueOffset * 0.05), hueOffset), trebleSpeckle, uAudioTreble * uTrebleShimmer * 0.35);

  float basePulse = mix(1.0, mix(0.7, 1.45 + audioEnergy * uAudioPulse * 0.45, breath), uBaselinePulse);
  float base = uBaseBrightness * basePulse;
  float reactive = audioEnergy * (0.08 + uAudioBloom * 0.16 + uAudioRipple * 0.08 * ripple) + bassPulse * uAudioPulse * 0.075 + cameraGlow * 0.18;
  float softLine = ringMask * (0.18 + reactive * (0.55 + uPsychedelicIntensity * 0.55) + shimmer * (0.035 + uTrebleShimmer * 0.035));
  float softHalo = halo * (0.07 + reactive * (0.75 + uAudioBloom * 1.2) + organism * (0.018 + uPsychedelicIntensity * 0.035));
  return base + softLine + softHalo;
}

void main() {
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (vUv * 2.0 - 1.0) * aspect;
  float layerCenter = uLayerIndex - (uLayerCount - 1.0) * 0.5;
  float parallax = layerCenter * uLayerDepth;

  if (uMode2D3D == 1) {
    float orbit = uTime * 0.035;
    p += vec2(cos(orbit + uLayerIndex), sin(orbit * 0.8 + uLayerIndex)) * parallax;
    p *= 1.0 + abs(layerCenter) * 0.028;
  }

  float warpField = organicField(p * (0.85 + uMidSwirl * 0.25), uLayerIndex) - 0.5;
  float audioWarp = (uAudioRMS * 0.55 + uAudioBass * 0.35 + uAudioMid * 0.25) * uAudioWarp;
  vec2 warpedP = p + warpField * (0.01 + uPsychedelicIntensity * 0.014 + audioWarp * 0.035);
  float morphRadius = uCircleRadius * (1.0 + (organicField(p * 0.45, 4.0 + uLayerIndex) - 0.5) * uPsychedelicIntensity * 0.035);
  float distanceToRing = sdFlower(warpedP, morphRadius, uRingCount);
  float hue = mod((uBaseHue + uHueDrift * uTime + uAudioBass * uAudioHueShift * 48.0 + uMotionEnergy * 8.0 + uLayerIndex * 6.0) / 360.0 + length(p) * (0.016 + uPsychedelicIntensity * 0.018), 1.0);
  float saturation = 0.36 + uAudioMid * (0.08 + uAudioHueShift * 0.16) + uPsychedelicIntensity * 0.08;

  float red = brightnessAtHue(p + vec2(0.001, 0.0), distanceToRing, 0.0);
  float green = brightnessAtHue(p, distanceToRing, 0.7);
  float blue = brightnessAtHue(p - vec2(0.001, 0.0), distanceToRing, 1.4);
  vec3 prism = vec3(red, green, blue);
  vec3 color = hsl2rgb(vec3(hue, saturation, 0.58)) * prism;

  float vignette = 1.0 - smoothstep(0.12, 1.55, length(p));
  float layerAlpha = uMode2D3D == 1 ? mix(0.16, 0.42, 1.0 - abs(layerCenter) / max(1.0, uLayerCount)) : 0.86;
  gl_FragColor = vec4(color * vignette * layerAlpha, 1.0);
}
