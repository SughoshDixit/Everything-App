/**
 * Military Cadence & Tactical Audio Engine
 * Provides authentic military PT cadence calls, drill instructor bark commands,
 * morning muster bugle calls, and rest interval orders.
 */

import { speakText, playBeepTone, cancelSpeech, isAudioMuted } from '../utils/audioCoach';

export const CADENCE_REP_CUES: Record<number, string> = {
  1: 'Down... UP! ONE! Chest to deck, clean lockout!',
  2: 'Down... UP! TWO! Keep your core rigid, recruit!',
  3: 'Down... UP! THREE! Do not rush the eccentric!',
  4: 'Down... UP! FOUR! Solid foundation! Hold that plank!',
  5: 'Down... UP! FIVE! Halfway there, push the floor away!',
  6: 'Down... UP! SIX! Pain is weakness leaving the system!',
  7: 'Down... UP! SEVEN! Lock your elbows, stay relentless!',
  8: 'Down... UP! EIGHT! No excuses, finish every inch!',
  9: 'Down... UP! NINE! One more for the brotherhood!',
  10: 'Down... UP! TEN! Stand tall! Mission accomplished!',
};

export const TACTICAL_MOTTOES = [
  'Discipline equals freedom! - Jocko Willink',
  'You do not rise to the occasion. You sink to the level of your training.',
  'Don’t count the days. Make the days count.',
  'The only easy day was yesterday.',
  'Sweat in peace so you don’t bleed in war.',
  'When your mind tells you that you are done, you are only at 40 percent.',
];

/**
 * Speaks a drill sergeant cadence rep count with crisp pacing
 */
export function speakMilitaryCadenceRep(repNumber: number): void {
  if (isAudioMuted()) return;
  const cue = CADENCE_REP_CUES[repNumber] || `Down... UP! Rep ${repNumber}! Stay disciplined!`;
  playBeepTone(440, 80);
  setTimeout(() => {
    speakText(cue, 1.05);
  }, 100);
}

/**
 * Speaks muster call to arms for 0630 morning roll call
 */
export function speakMorningMusterCall(): void {
  if (isAudioMuted()) return;
  cancelSpeech();
  // Play bugle-like wake up triple tone
  playBeepTone(523, 120); // C5
  setTimeout(() => playBeepTone(659, 120), 140); // E5
  setTimeout(() => playBeepTone(783, 200), 280); // G5
  setTimeout(() => {
    speakText(
      'Attention on deck! 0630 Morning Muster. Report for duty, soldier. Discipline equals freedom!',
      1.0
    );
  }, 500);
}

/**
 * Speaks a strict tactical rest countdown order
 */
export function speakTacticalRestOrder(secondsLeft: number): void {
  if (isAudioMuted()) return;
  if (secondsLeft === 30) {
    playBeepTone(440, 90);
    speakText('30 seconds tactical breather. Deep diaphragmatic breathing. Refocus your mind.', 1.0);
  } else if (secondsLeft === 10) {
    playBeepTone(660, 100);
    speakText('10 seconds! Fall in! Hands on the deck! Prepare to push!', 1.05);
  } else if (secondsLeft <= 3 && secondsLeft > 0) {
    playBeepTone(880, 120);
    speakText(String(secondsLeft), 1.2);
  }
}

/**
 * Speaks a mandatory rest day enforcement directive
 */
export function speakEnforcedRestOrder(): void {
  if (isAudioMuted()) return;
  cancelSpeech();
  playBeepTone(330, 250);
  speakText(
    'Stand down, soldier! Today is DEFCON 1 Mandatory Tactical Recovery. Muscles do not grow under load; they rebuild during rest. Execute the decompression and mobility protocol. Overreaching today is an injury tomorrow!',
    0.98
  );
}

/**
 * Speaks excuse rejection and direct military rebuttal
 */
export function speakExcuseRejection(rebuttal: string): void {
  if (isAudioMuted()) return;
  cancelSpeech();
  playBeepTone(440, 150);
  speakText(`Excuse rejected! ${rebuttal}`, 1.05);
}
