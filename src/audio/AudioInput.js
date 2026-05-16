const DEFAULT_SMOOTHING = {
  attack: 0.3,
  release: 0.05,
};

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function smoothBand(previous, next, smoothing = DEFAULT_SMOOTHING) {
  const coefficient = next > previous ? smoothing.attack : smoothing.release;
  return previous + (next - previous) * coefficient;
}

function averageFrequencyRange(frequency, sampleRate, fftSize, minHz, maxHz) {
  const binHz = sampleRate / fftSize;
  const start = Math.max(0, Math.floor(minHz / binHz));
  const end = Math.min(frequency.length - 1, Math.ceil(maxHz / binHz));
  let total = 0;
  let count = 0;

  for (let i = start; i <= end; i += 1) {
    total += frequency[i] / 255;
    count += 1;
  }

  return count ? clamp01(total / count) : 0;
}

export function computeBands({ timeDomain, frequency, sampleRate, fftSize }) {
  let squareTotal = 0;

  for (const value of timeDomain) {
    const centered = (value - 128) / 128;
    squareTotal += centered * centered;
  }

  return {
    rms: clamp01(Math.sqrt(squareTotal / Math.max(1, timeDomain.length))),
    bass: averageFrequencyRange(frequency, sampleRate, fftSize, 20, 250),
    mid: averageFrequencyRange(frequency, sampleRate, fftSize, 250, 2000),
    treble: averageFrequencyRange(frequency, sampleRate, fftSize, 2000, 8000),
  };
}

export class AudioInput {
  constructor({ smoothing = DEFAULT_SMOOTHING } = {}) {
    this.smoothing = smoothing;
    this.context = null;
    this.analyser = null;
    this.stream = null;
    this.frequency = null;
    this.timeDomain = null;
    this.rms = 0;
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.ready = false;
  }

  async init(stream) {
    this.stream = stream ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContextClass();
    const source = this.context.createMediaStreamSource(this.stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0;
    source.connect(this.analyser);
    this.frequency = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.fftSize);
    this.ready = true;
    return this;
  }

  update({ decayRate } = {}) {
    if (!this.ready || !this.analyser) {
      return this.snapshot();
    }

    this.analyser.getByteFrequencyData(this.frequency);
    this.analyser.getByteTimeDomainData(this.timeDomain);

    const bands = computeBands({
      timeDomain: this.timeDomain,
      frequency: this.frequency,
      sampleRate: this.context.sampleRate,
      fftSize: this.analyser.fftSize,
    });

    const smoothing = {
      ...this.smoothing,
      release: decayRate ?? this.smoothing.release,
    };

    this.rms = smoothBand(this.rms, bands.rms, smoothing);
    this.bass = smoothBand(this.bass, bands.bass, smoothing);
    this.mid = smoothBand(this.mid, bands.mid, smoothing);
    this.treble = smoothBand(this.treble, bands.treble, smoothing);

    return this.snapshot();
  }

  snapshot() {
    return {
      rms: this.rms,
      bass: this.bass,
      mid: this.mid,
      treble: this.treble,
    };
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.context?.close();
    this.ready = false;
  }
}
