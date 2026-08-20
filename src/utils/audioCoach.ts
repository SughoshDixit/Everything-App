/**
 * Audio Voice Coach & Sound Engine
 * Provides synthesized voice coaching (exercise introductions, form cues, benefits,
 * transition alerts, and countdown pacing) + audio chimes for workouts.
 */

let isMutedState = false;

// Initialize mute state from localStorage if available
try {
  const savedMute = localStorage.getItem('everything_app_voice_muted');
  if (savedMute !== null) {
    isMutedState = savedMute === 'true';
  }
} catch (e) {
  // Ignore storage errors
}

export function isAudioMuted(): boolean {
  return isMutedState;
}

export function setAudioMuted(muted: boolean): void {
  isMutedState = muted;
  try {
    localStorage.setItem('everything_app_voice_muted', String(muted));
  } catch (e) {
    // Ignore storage errors
  }
  if (muted) {
    cancelSpeech();
  }
}

export function toggleAudioMute(): boolean {
  setAudioMuted(!isMutedState);
  return isMutedState;
}

export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(text: string, rate: number = 0.95, onEnd?: () => void): void {
  if (isMutedState) {
    if (onEnd) onEnd();
    return;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const cleanText = text.replace(/[#*_\n\r]/g, ' ').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate; // 0.95 natural human cadence
    utterance.pitch = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
}

export function speakExerciseIntro(exercise: {
  name: string;
  category?: string;
  recommendedSets?: number;
  recommendedReps?: string;
  instructions?: string;
  keyCues?: string[];
  keyBenefits?: string[];
}): void {
  let speech = `Next exercise: ${exercise.name}. `;
  if (exercise.recommendedSets && exercise.recommendedReps) {
    speech += `Target: ${exercise.recommendedSets} sets of ${exercise.recommendedReps}. `;
  }
  if (exercise.instructions) {
    speech += `${exercise.instructions} `;
  }
  if (exercise.keyCues && exercise.keyCues.length > 0) {
    speech += `Form tip: ${exercise.keyCues[0]}. `;
  }
  if (exercise.keyBenefits && exercise.keyBenefits.length > 0) {
    speech += `Benefit: ${exercise.keyBenefits[0]}.`;
  }
  speakText(speech);
}

export function speakWarmupStep(step: {
  title: string;
  durationSeconds: number;
  instructions?: string;
}): void {
  const speech = `Warm up step: ${step.title}. ${step.instructions || 'Stay loose, breathe steady and warm up joints.'}`;
  speakText(speech);
}

export function speakTransitionAlert(focusName: string): void {
  const speech = `Warm up complete! 60 seconds rest. Catch your breath and hydrate. Next up: ${focusName}!`;
  speakText(speech);
}

export function speakCountdown(num: number): void {
  if (num <= 3 && num > 0) {
    playBeepTone(num === 1 ? 880 : 440, 100);
    speakText(String(num), 1.2);
  }
}

// Audio Beep Chime Synthesis using Web Audio API
export function playBeepTone(freq: number = 520, durationMs: number = 150): void {
  if (isMutedState) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    // AudioContext might be blocked before user gesture
  }
}
