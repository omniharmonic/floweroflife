import { FaceLandmarker, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { smoothPoint } from '../flower/FlowerMath.js';

const SAMPLE_WIDTH = 72;
const SAMPLE_HEIGHT = 40;
const LIGHT_LIMIT = 5;
const VISION_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

function luminance(data, index) {
  return data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
}

export class HandFaceTracker {
  constructor() {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.className = 'tracking-video';
    this.canvas = document.createElement('canvas');
    this.canvas.width = SAMPLE_WIDTH;
    this.canvas.height = SAMPLE_HEIGHT;
    this.context = this.canvas.getContext('2d', { willReadFrequently: true });
    this.previousFrame = null;
    this.lights = [];
    this.motionEnergy = 0;
    this.ready = false;
    this.visionReady = false;
    this.lastSample = 0;
    this.previousTrackedLights = [];
  }

  async init(stream) {
    this.stream = stream ?? (await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }));
    this.video.srcObject = this.stream;
    await this.video.play();
    await this.initVisionTasks();
    this.ready = true;
    return this;
  }

  async initVisionTasks() {
    try {
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
      const [handLandmarker, faceLandmarker] = await Promise.all([
        HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: HAND_MODEL_URL,
            delegate: 'GPU',
          },
          numHands: 2,
          runningMode: 'VIDEO',
        }),
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_MODEL_URL,
            delegate: 'GPU',
          },
          numFaces: 1,
          runningMode: 'VIDEO',
        }),
      ]);
      this.handLandmarker = handLandmarker;
      this.faceLandmarker = faceLandmarker;
      this.visionReady = true;
    } catch (error) {
      console.info('MediaPipe unavailable; falling back to camera motion tracking.', error);
      this.visionReady = false;
    }
  }

  update(time) {
    if (!this.ready || time - this.lastSample < 1 / 15 || !this.video.videoWidth) {
      return this.snapshot();
    }

    this.lastSample = time;
    if (this.visionReady) {
      return this.updateLandmarks(time);
    }

    return this.updateMotionFallback();
  }

  updateLandmarks(time) {
    const timestamp = Math.round(time * 1000);
    const handResults = this.handLandmarker.detectForVideo(this.video, timestamp);
    const faceResults = this.faceLandmarker.detectForVideo(this.video, timestamp);
    const candidates = [];

    for (const landmarks of handResults.landmarks ?? []) {
      const wrist = landmarks[0];
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      candidates.push(this.landmarkToLight(indexTip, 0.95));
      candidates.push(this.landmarkToLight(thumbTip, 0.72));
      candidates.push(this.landmarkToLight(wrist, 0.48));
    }

    const face = faceResults.faceLandmarks?.[0];
    if (face?.[1]) {
      candidates.push(this.landmarkToLight(face[1], 0.5));
    }

    const selected = candidates.filter(Boolean).slice(0, LIGHT_LIMIT);
    let motion = 0;
    this.lights = selected.map((light, index) => {
      const previous = this.lights[index] ?? light;
      const previousTracked = this.previousTrackedLights[index] ?? light;
      const position = smoothPoint(previous, light, 0.24);
      motion += Math.hypot(light.x - previousTracked.x, light.y - previousTracked.y);
      return {
        x: position.x,
        y: position.y,
        intensity: previous.intensity * 0.82 + light.intensity * 0.18,
      };
    });
    this.previousTrackedLights = selected;
    this.motionEnergy = this.motionEnergy * 0.9 + Math.min(1, motion * 1.8) * 0.1;
    return this.snapshot();
  }

  landmarkToLight(landmark, intensity) {
    if (!landmark) {
      return null;
    }

    return {
      x: landmark.x * 2 - 1,
      y: 1 - landmark.y * 2,
      intensity,
    };
  }

  updateMotionFallback() {
    this.context.drawImage(this.video, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
    const current = this.context.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);

    if (!this.previousFrame) {
      this.previousFrame = current;
      return this.snapshot();
    }

    const candidates = [];
    let totalMotion = 0;

    for (let y = 2; y < SAMPLE_HEIGHT - 2; y += 2) {
      for (let x = 2; x < SAMPLE_WIDTH - 2; x += 2) {
        const index = (y * SAMPLE_WIDTH + x) * 4;
        const delta = Math.abs(luminance(current.data, index) - luminance(this.previousFrame.data, index)) / 255;
        if (delta > 0.055) {
          const normalized = {
            x: (x / SAMPLE_WIDTH) * 2 - 1,
            y: 1 - (y / SAMPLE_HEIGHT) * 2,
          };
          candidates.push({ ...normalized, intensity: Math.min(1, delta * 5) });
          totalMotion += delta;
        }
      }
    }

    candidates.sort((a, b) => b.intensity - a.intensity);
    const selected = candidates.slice(0, LIGHT_LIMIT);
    this.motionEnergy = this.motionEnergy * 0.86 + Math.min(1, totalMotion / 16) * 0.14;
    this.lights = selected.map((light, index) => {
      const previous = this.lights[index] ?? light;
      const position = smoothPoint(previous, light, 0.22);
      return {
        x: position.x,
        y: position.y,
        intensity: previous.intensity * 0.72 + light.intensity * 0.28,
      };
    });
    this.previousFrame = current;
    return this.snapshot();
  }

  snapshot() {
    return {
      lights: this.lights,
      motionEnergy: this.motionEnergy,
    };
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.handLandmarker?.close();
    this.faceLandmarker?.close();
    this.ready = false;
  }
}
