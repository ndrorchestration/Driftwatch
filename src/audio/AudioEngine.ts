/**
 * AudioEngine.ts — SchizophonicTrio audio engine extracted from App.tsx
 *
 * Three sonically distinct layers:
 *  · Optimizer (Reson)   — drone oscillators, Ionian scale
 *  · Generator (Amethyst) — filtered white noise
 *  · Critic (Apogee)     — spatially positioned HRTF chimes
 *
 * Usage:
 *   const engine = new AudioEngine();
 *   engine.update(consensus, modalFreq);   // call each animation frame
 *   engine.triggerChime(position, camera); // call on dissonance event
 *   engine.resume();                       // call on first user gesture
 *   engine.getByteFrequencyData(array);    // feed spectral analyser canvas
 *   engine.dispose();                      // call on component unmount
 */

import * as THREE from 'three';

// Ionian Scale (C Major) — C2 G2 C3 E3 G3
const IONIAN_FREQS = [65.41, 98.0, 130.81, 164.81, 196.0];

export class AudioEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  analyser: AnalyserNode;

  // Optimizer (Reson) — drone
  private droneOscs: OscillatorNode[] = [];
  private droneFilter: BiquadFilterNode;

  // Generator (Amethyst) — noise
  private noiseFilter: BiquadFilterNode;
  private noiseGain: GainNode;

  constructor() {
    this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.ctx.destination);

    // --- Optimizer (Reson) ---
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 400;
    this.droneFilter.connect(this.masterGain);

    IONIAN_FREQS.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      gain.gain.value = i === 0 ? 0.05 : 0.02;
      osc.connect(gain);
      gain.connect(this.droneFilter);
      osc.start();
      this.droneOscs.push(osc);
    });

    // --- Generator (Amethyst) — BufferSource noise loop ---
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'highpass';
    this.noiseFilter.frequency.value = 2000;
    this.noiseFilter.Q.value = 10;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.05;

    noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    noiseSource.start();
  }

  /** Call each animation frame with current system state */
  update(consensus: number, modalFreq: number): void {
    if (this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;

    this.droneOscs.forEach((osc, i) => {
      const baseFreq = IONIAN_FREQS[i];
      const vibrato = Math.sin(now * modalFreq * Math.PI * 2) * modalFreq * 0.5;
      osc.frequency.setTargetAtTime(baseFreq + vibrato, now, 0.1);
    });

    // suppress unused param lint — consensus drives future mix expansion
    void consensus;

    const noiseFreq = 2000 + modalFreq * 200;
    this.noiseFilter.frequency.setTargetAtTime(noiseFreq, now, 0.1);
    this.noiseGain.gain.setTargetAtTime(0.05 + modalFreq * 0.01, now, 0.1);
  }

  /** Critic (Apogee) — spatially positioned chime on dissonance event */
  triggerChime(pos: THREE.Vector3, _camera: THREE.Camera): void {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    panner.positionX.value = pos.x;
    panner.positionY.value = pos.y;
    panner.positionZ.value = pos.z;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const baseFreq = 800 + Math.random() * 1200;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.3);
  }

  resume(): void {
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  getByteFrequencyData(array: Uint8Array): void {
    this.analyser.getByteFrequencyData(array);
  }

  dispose(): void {
    this.droneOscs.forEach((osc) => osc.stop());
    this.masterGain.disconnect();
    this.ctx.close();
  }
}
