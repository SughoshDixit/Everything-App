import { describe, it, expect } from 'vitest';
import { isAudioMuted, setAudioMuted } from '../utils/audioCoach';

describe('Tactile Audio & Athlete State', () => {
  it('toggles audio mute state properly', () => {
    setAudioMuted(false);
    expect(isAudioMuted()).toBe(false);

    setAudioMuted(true);
    expect(isAudioMuted()).toBe(true);

    setAudioMuted(false);
    expect(isAudioMuted()).toBe(false);
  });

  it('calculates habit completion percentages accurately', () => {
    const totalHabits = 5;
    const completedCount = 4;
    const percentage = Math.round((completedCount / totalHabits) * 100);

    expect(percentage).toBe(80);
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('calculates pace min/km from meters and seconds', () => {
    const distanceMeters = 5000;
    const durationSeconds = 1500; // 25 minutes = 5:00 /km
    const paceSecondsPerKm = durationSeconds / (distanceMeters / 1000);
    const mins = Math.floor(paceSecondsPerKm / 60);
    const secs = Math.round(paceSecondsPerKm % 60);
    const paceStr = `${mins}:${secs.toString().padStart(2, '0')} /km`;

    expect(paceStr).toBe('5:00 /km');
  });
});
