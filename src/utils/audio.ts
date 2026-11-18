// Web Audio API helper for tactile sound effects, rest countdowns, and ambient rhythms
let audioCtx: AudioContext | null = null;
let metronomeInterval: number | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Basic frequency tone beep
 */
export function playBeep(frequency = 440, durationMs = 150, type: OscillatorType = 'sine'): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (err) {
    console.warn('Audio playback not permitted or not supported yet:', err);
  }
}

/**
 * Crisp mechanical switch click-thud for checkboxes and buttons
 */
export function playMechanicalClick(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Transient high click (800Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.03);

    // Subtle low thud body (120Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(140, now + 0.005);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.06);
    gain2.gain.setValueAtTime(0.3, now + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.005);
    osc2.stop(now + 0.06);

    playHapticFeedback(12);
  } catch (err) {
    console.warn('Mechanical click error:', err);
  }
}

/**
 * Triumphant multi-chord level up / milestone fanfare
 */
export function playLevelUpChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // C5 (523), E5 (659), G5 (784), C6 (1046)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });

    playHapticFeedback([30, 50, 80]);
  } catch (err) {
    console.warn('Level up chime error:', err);
  }
}

/**
 * Dual-tone referee match whistle
 */
export function playWhistle(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [2500, 2750];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Slight pitch fluctuation
      osc.frequency.setValueAtTime(freq + 40, now + 0.1);
      osc.frequency.setValueAtTime(freq - 20, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });

    playHapticFeedback([40, 30, 40]);
  } catch (err) {
    console.warn('Whistle error:', err);
  }
}

/**
 * Military bugle fanfare for 0630 Muster
 */
export function playBugleChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Classic military bugle notes: G3 (196), C4 (261.6), E4 (329.6), G4 (392)
    const melody = [
      { freq: 261.63, delay: 0.0, dur: 0.18 },
      { freq: 329.63, delay: 0.18, dur: 0.18 },
      { freq: 392.0, delay: 0.36, dur: 0.28 },
      { freq: 523.25, delay: 0.65, dur: 0.5 },
    ];

    melody.forEach((m) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + m.delay;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(m.freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + m.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + m.dur);
    });

    playHapticFeedback([20, 20, 40]);
  } catch (err) {
    console.warn('Bugle error:', err);
  }
}

/**
 * 3-tone rest countdown complete chime
 */
export function playRestCompleteChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } catch (err) {
    console.warn('Chime error:', err);
  }
}

/**
 * Trigger vibration haptics on supported devices
 */
export function playHapticFeedback(pattern: number | number[] = 20): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Haptics not allowed or supported
  }
}

/**
 * Starts an audio cadence metronome (e.g. 175 SPM for running)
 */
export function startCadenceMetronome(spm = 175): void {
  stopCadenceMetronome();
  const intervalMs = (60 / spm) * 1000;
  metronomeInterval = window.setInterval(() => {
    playBeep(980, 40, 'triangle');
  }, intervalMs);
}

/**
 * Stops the audio cadence metronome
 */
export function stopCadenceMetronome(): void {
  if (metronomeInterval !== null) {
    clearInterval(metronomeInterval);
    metronomeInterval = null;
  }
}

/**
 * Starts a 432Hz Vedic / Carnatic focus drone
 */
export function startVedicDrone(freq = 432): void {
  try {
    stopVedicDrone();
    const ctx = getAudioContext();
    droneOsc = ctx.createOscillator();
    droneGain = ctx.createGain();

    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(freq, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.05, ctx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);

    droneOsc.start();
  } catch (err) {
    console.warn('Vedic drone error:', err);
  }
}

/**
 * Stops the 432Hz focus drone
 */
export function stopVedicDrone(): void {
  try {
    if (droneOsc) {
      droneOsc.stop();
      droneOsc.disconnect();
      droneOsc = null;
    }
    if (droneGain) {
      droneGain.disconnect();
      droneGain = null;
    }
  } catch {
    // Ignore cleanup errors
  }
}
