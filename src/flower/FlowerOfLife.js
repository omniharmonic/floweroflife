import * as THREE from 'three';
import vertexShader from '../shaders/fol-vertex.glsl';
import fragmentShader from '../shaders/fol-fragment.glsl';
import { shapeEnergy, shapeLightIntensity, slewLimit } from './SignalShaping.js';

const LAYER_COUNT = 5;
const LIGHT_COUNT = 5;

function createLightUniforms() {
  return Array.from({ length: LIGHT_COUNT }, () => new THREE.Vector3(0, 0, 0));
}

export class FlowerOfLife {
  constructor(params) {
    this.group = new THREE.Group();
    this.materials = [];
    this.meshes = [];
    this.params = params;
    this.resolution = new THREE.Vector2(1, 1);
    this.shapedAudio = { rms: 0, bass: 0, mid: 0, treble: 0, motion: 0 };
    this.shapedLights = createLightUniforms();

    for (let i = 0; i < LAYER_COUNT; i += 1) {
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
        blending: i === 0 ? THREE.NormalBlending : THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: this.resolution },
          uRingCount: { value: params.ringCount },
          uCircleRadius: { value: params.circleRadius },
          uRingThickness: { value: params.ringThickness },
          uBaseHue: { value: params.baseHue },
          uHueDrift: { value: params.hueDrift },
          uBaseBrightness: { value: params.baseBrightness },
          uAudioRMS: { value: 0 },
          uAudioBass: { value: 0 },
          uAudioMid: { value: 0 },
          uAudioTreble: { value: 0 },
          uLights: { value: createLightUniforms() },
          uLightCount: { value: 0 },
          uMode2D3D: { value: params.mode2D3D },
          uLayerDepth: { value: params.layerDepth },
          uLayerIndex: { value: i },
          uLayerCount: { value: LAYER_COUNT },
          uMotionEnergy: { value: 0 },
          uBaselinePulse: { value: params.baselinePulse },
          uBaselinePulseRate: { value: params.baselinePulseRate },
          uAudioBloom: { value: params.audioBloom },
          uAudioPulse: { value: params.audioPulse },
          uAudioRipple: { value: params.audioRipple },
          uAudioHueShift: { value: params.audioHueShift },
          uAudioWarp: { value: params.audioWarp },
          uTrebleShimmer: { value: params.trebleShimmer },
          uMidSwirl: { value: params.midSwirl },
          uPsychedelicIntensity: { value: params.psychedelicIntensity },
        },
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      mesh.frustumCulled = false;
      mesh.renderOrder = i;
      this.materials.push(material);
      this.meshes.push(mesh);
      this.group.add(mesh);
    }
  }

  resize(width, height) {
    this.resolution.set(width, height);
  }

  update(time, audio, cameraState, params) {
    this.params = params;
    const lights = cameraState?.lights ?? [];
    const activeLayers = params.mode2D3D ? LAYER_COUNT : 1;
    this.shapedAudio.rms = slewLimit(this.shapedAudio.rms, shapeEnergy(audio.rms, params.audioSensitivity), 0.04);
    this.shapedAudio.bass = slewLimit(this.shapedAudio.bass, shapeEnergy(audio.bass, params.audioSensitivity), 0.032);
    this.shapedAudio.mid = slewLimit(this.shapedAudio.mid, shapeEnergy(audio.mid, params.audioSensitivity), 0.026);
    this.shapedAudio.treble = slewLimit(this.shapedAudio.treble, shapeEnergy(audio.treble, params.audioSensitivity), 0.02);
    this.shapedAudio.motion = slewLimit(
      this.shapedAudio.motion,
      shapeEnergy(cameraState?.motionEnergy ?? 0, params.motionSensitivity),
      0.012,
    );
    for (let i = 0; i < LIGHT_COUNT; i += 1) {
      const light = lights[i];
      const targetIntensity = shapeLightIntensity(light?.intensity ?? 0, params.cameraSensitivity);
      this.shapedLights[i].set(
        light?.x ?? this.shapedLights[i].x,
        light?.y ?? this.shapedLights[i].y,
        slewLimit(this.shapedLights[i].z, targetIntensity, 0.014),
      );
    }

    this.meshes.forEach((mesh, index) => {
      mesh.visible = index < activeLayers;
    });

    for (const material of this.materials) {
      material.uniforms.uTime.value = time;
      material.uniforms.uRingCount.value = params.ringCount;
      material.uniforms.uCircleRadius.value = params.circleRadius;
      material.uniforms.uRingThickness.value = params.ringThickness;
      material.uniforms.uBaseHue.value = params.baseHue;
      material.uniforms.uHueDrift.value = params.hueDrift;
      material.uniforms.uBaseBrightness.value = params.baseBrightness;
      material.uniforms.uAudioRMS.value = this.shapedAudio.rms;
      material.uniforms.uAudioBass.value = this.shapedAudio.bass;
      material.uniforms.uAudioMid.value = this.shapedAudio.mid;
      material.uniforms.uAudioTreble.value = this.shapedAudio.treble;
      material.uniforms.uMode2D3D.value = params.mode2D3D;
      material.uniforms.uLayerDepth.value = params.layerDepth;
      material.uniforms.uMotionEnergy.value = this.shapedAudio.motion;
      material.uniforms.uLightCount.value = Math.min(LIGHT_COUNT, lights.length);
      material.uniforms.uBaselinePulse.value = params.baselinePulse;
      material.uniforms.uBaselinePulseRate.value = params.baselinePulseRate;
      material.uniforms.uAudioBloom.value = params.audioBloom;
      material.uniforms.uAudioPulse.value = params.audioPulse;
      material.uniforms.uAudioRipple.value = params.audioRipple;
      material.uniforms.uAudioHueShift.value = params.audioHueShift;
      material.uniforms.uAudioWarp.value = params.audioWarp;
      material.uniforms.uTrebleShimmer.value = params.trebleShimmer;
      material.uniforms.uMidSwirl.value = params.midSwirl;
      material.uniforms.uPsychedelicIntensity.value = params.psychedelicIntensity;

      for (let i = 0; i < LIGHT_COUNT; i += 1) {
        material.uniforms.uLights.value[i].copy(this.shapedLights[i]);
      }
    }
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
    }
    for (const material of this.materials) {
      material.dispose();
    }
  }
}
