/**
 * Tactical Routine & Recovery Periodization Service
 * Smoothly governs the workout-to-rest lifecycle, DEFCON readiness state machine,
 * Active Recovery Protocol generation, and Military Rank Insignia progression.
 */

import type {
  DefconLevel,
  TacticalMissionDirective,
  ActiveRecoveryProtocol,
  MilitaryRankInfo,
  MusterStatus
} from '../types/tactical';
import { month1Calendar } from '../utils/calisthenicsCalendar';

const STORAGE_KEY_MUSTER = 'tactical_muster_status';
const STORAGE_KEY_RANKS = 'tactical_rank_points';
const STORAGE_KEY_DEMERITS = 'tactical_demerit_count';
const STORAGE_KEY_OVERRIDE = 'tactical_commander_override_date';

export const MILITARY_RANKS: MilitaryRankInfo[] = [
  {
    rankCode: 'E-1',
    rankTitle: 'Recruit',
    insignia: '🔰',
    level: 1,
    minPoints: 0,
    nextRankPoints: 100,
    perks: 'Basic combat training authorized',
  },
  {
    rankCode: 'E-2',
    rankTitle: 'Private First Class',
    insignia: '🥉',
    level: 2,
    minPoints: 100,
    nextRankPoints: 250,
    perks: 'Tactical split customization unlocked',
  },
  {
    rankCode: 'E-4',
    rankTitle: 'Specialist',
    insignia: '🥈',
    level: 3,
    minPoints: 250,
    nextRankPoints: 500,
    perks: 'Audio cadence coach customization unlocked',
  },
  {
    rankCode: 'E-5',
    rankTitle: 'Sergeant',
    insignia: '🎖️',
    level: 4,
    minPoints: 500,
    nextRankPoints: 850,
    perks: 'Commander override authority granted',
  },
  {
    rankCode: 'E-6',
    rankTitle: 'Staff Sergeant',
    insignia: '⭐',
    level: 5,
    minPoints: 850,
    nextRankPoints: 1500,
    perks: 'Squad leadership and elite tactical status',
  },
  {
    rankCode: 'O-5',
    rankTitle: 'Spartan Commander',
    insignia: '🦅',
    level: 6,
    minPoints: 1500,
    nextRankPoints: 3000,
    perks: 'Master of both combat PT and biological regeneration',
  },
];

export const DEFAULT_ACTIVE_RECOVERY_PROTOCOL: ActiveRecoveryProtocol = {
  id: 'protocol-cns-reset',
  title: 'Central Nervous System & Fascial Reset',
  codename: 'OPERATION AEGIS REGEN',
  durationMinutes: 16,
  hydrationTargetLiters: 3.5,
  description: 'Joint decompression, tissue myofascial release, and parasympathetic nervous activation.',
  steps: [
    {
      title: 'Pull-up Bar Dead Hang (Spinal Decompression)',
      durationSeconds: 120,
      cue: 'Passive hang. Relax your shoulder girdle and let gravity decompress lumbar discs.',
      targetArea: 'Spine & Forearms',
      iconName: 'Activity',
    },
    {
      title: 'Doorway Pec & Lat Fascial Release',
      durationSeconds: 180,
      cue: 'Lean forward gently into doorway. Open tight anterior deltoids and chest.',
      targetArea: 'Chest & Shoulders',
      iconName: 'Shield',
    },
    {
      title: 'Quads & Calves Foam Rolling',
      durationSeconds: 300,
      cue: 'Slow sweeps (1 inch per second). Pause on trigger knots for 20 seconds.',
      targetArea: 'Lower Extremities',
      iconName: 'Flame',
    },
    {
      title: 'Hip Flexor & Hamstring Dynamic Lengthening',
      durationSeconds: 180,
      cue: 'Kneeling lunge stretch. Squeeze the rear glute to release tight psoas muscles.',
      targetArea: 'Pelvic Girdle',
      iconName: 'Zap',
    },
    {
      title: 'Vedic Diaphragmatic Box Breathing (4-4-4-4)',
      durationSeconds: 180,
      cue: 'Inhale 4s through nose, hold 4s, exhale 4s, hold 4s. Shifts body into deep anabolic recovery.',
      targetArea: 'Autonomic Vagus Nerve',
      iconName: 'Moon',
    },
  ],
};

/**
 * Calculates Tactical Mission Directive for a given day
 */
export function getTacticalMissionDirective(
  dayNumber: number,
  streakCount: number,
  consecutiveHeavyDays: number = 0
): TacticalMissionDirective {
  const dayPlan = month1Calendar.find((d) => d.dayNumber === dayNumber) || month1Calendar[0];
  const isCalendarRest = dayPlan.isRestDay;

  // Auto-enforce DEFCON 1 if user has worked out 3 days in a row without a rest day
  const isOvertrainingEnforced = consecutiveHeavyDays >= 3;
  const isRest = isCalendarRest || isOvertrainingEnforced;

  let defconLevel: DefconLevel = 'DEFCON_3_COMBAT';
  const streakBonus = Math.min(6, Math.floor(streakCount / 4));
  let readinessScore = 90 + streakBonus;

  if (isRest) {
    defconLevel = 'DEFCON_1_REGEN';
    readinessScore = isOvertrainingEnforced ? 58 : 68;
  } else if (dayPlan.focusCategory.includes('Cardio') || dayPlan.focusCategory.includes('Core')) {
    defconLevel = 'DEFCON_2_MAINTENANCE';
    readinessScore = 80 + streakBonus;
  }

  const codename = isRest
    ? 'OPERATION AEGIS RECOVERY'
    : dayPlan.focusCategory.includes('Football')
    ? 'OPERATION WINGER BLITZ'
    : 'OPERATION IRON FORGE';

  const orders = isRest
    ? [
        'Mandatory combat lockout: Zero heavy pushing or pulling authorized.',
        'Execute full 16-minute Central Nervous System Decompression Protocol.',
        'Intake 3.5 Liters of water with sodium/potassium electrolytes.',
        'Complete 20 minutes Vedic Chant or deep parasympathetic audio wind-down.',
      ]
    : [
        `Execute Day ${dayNumber} Calisthenics: ${dayPlan.dayTitle}.`,
        'Maintain military form: Full range of motion, strict lockout, zero ego reps.',
        'Strict 60–90 second rest enforcement between working sets.',
        'Log workout volume immediately upon mission completion.',
      ];

  const briefing = isRest
    ? 'Soldier, biology is non-negotiable. Muscle fibers tear under load, but they multiply and fortify during recovery. Today you recharge your athletic battery to strike harder tomorrow.'
    : `Day ${dayNumber} of combat conditioning. Maintain focus, execute clean cadence, and leave nothing on the table.`;

  return {
    dayNumber,
    codename,
    title: dayPlan.dayTitle,
    defconLevel,
    readinessScore,
    isRestDay: isRest,
    briefing,
    orders,
    hydrationLiters: isRest ? 3.5 : 3.0,
    sleepTargetHours: 8,
    lockoutActive: isRest,
    recoveryProtocol: DEFAULT_ACTIVE_RECOVERY_PROTOCOL,
    recommendedCadence: isRest ? 'Regenerative' : 'Strict 3-1-1 Cadence',
  };
}

/**
 * Gets current military rank progression
 */
export function getMilitaryRankProgression(): {
  currentRank: MilitaryRankInfo;
  nextRank: MilitaryRankInfo | null;
  totalPoints: number;
  progressPct: number;
  demerits: number;
} {
  let points = 280; // Baseline starting points
  let demerits = 0;

  try {
    const savedPts = localStorage.getItem(STORAGE_KEY_RANKS);
    if (savedPts !== null) points = parseInt(savedPts, 10);
    const savedDemerits = localStorage.getItem(STORAGE_KEY_DEMERITS);
    if (savedDemerits !== null) demerits = parseInt(savedDemerits, 10);
  } catch (e) {
    // Ignore storage issues
  }

  let currentRank = MILITARY_RANKS[0];
  let nextRank: MilitaryRankInfo | null = MILITARY_RANKS[1];

  for (let i = 0; i < MILITARY_RANKS.length; i++) {
    if (points >= MILITARY_RANKS[i].minPoints) {
      currentRank = MILITARY_RANKS[i];
      nextRank = MILITARY_RANKS[i + 1] || null;
    }
  }

  const range = nextRank ? nextRank.minPoints - currentRank.minPoints : 1000;
  const currentOffset = points - currentRank.minPoints;
  const progressPct = nextRank ? Math.min(100, Math.max(0, Math.round((currentOffset / range) * 100))) : 100;

  return {
    currentRank,
    nextRank,
    totalPoints: points,
    progressPct,
    demerits,
  };
}

/**
 * Awards discipline points (e.g. for completing active recovery or a workout)
 */
export function awardDisciplinePoints(points: number): number {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_RANKS) || '280', 10);
    const updated = current + points;
    localStorage.setItem(STORAGE_KEY_RANKS, String(updated));
    return updated;
  } catch (e) {
    return 280;
  }
}

/**
 * Gets the current Morning Muster status for today
 */
export function getMusterStatus(): MusterStatus {
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MUSTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.musterDateStr === todayStr) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage issues
  }

  // Not mustered yet today
  return {
    musteredToday: false,
    musterDateStr: todayStr,
    demerits: 0,
    statusText: 'Pending Morning Roll Call (0630–0800 HRS)',
  };
}

/**
 * Records user reporting for duty in the morning
 */
export function reportForMusterDuty(): MusterStatus {
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} HRS`;

  const updated: MusterStatus = {
    musteredToday: true,
    musterTimestamp: Date.now(),
    musterDateStr: todayStr,
    demerits: 0,
    statusText: `Reported on deck at ${timeStr}. Commendation granted!`,
  };

  try {
    localStorage.setItem(STORAGE_KEY_MUSTER, JSON.stringify(updated));
    awardDisciplinePoints(25); // Award muster points
  } catch (e) {
    // Ignore
  }

  return updated;
}

/**
 * Checks if a Commander Override is active for today
 */
export function isCommanderOverrideActive(): boolean {
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const override = localStorage.getItem(STORAGE_KEY_OVERRIDE);
    return override === todayStr;
  } catch {
    return false;
  }
}

/**
 * Sets Commander Override for today (allowing high-intensity PT on rest day)
 */
export function setCommanderOverride(): void {
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    localStorage.setItem(STORAGE_KEY_OVERRIDE, todayStr);
  } catch {
    // Ignore
  }
}
