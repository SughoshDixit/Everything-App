import type {
  CycleLogsMap,
  CycleSettings,
  PeriodGroup,
  CycleMetrics,
  CurrentPhaseInfo
} from '../types';

export const SYMPTOM_EMOJIS: Record<string, string> = {
  cramps: '🩸',
  headache: '🤕',
  bloating: '🎈',
  fatigue: '😴',
  acne: '✨',
  backache: '🪵',
  'breast-tenderness': '🍈',
  nausea: '🤢'
};

export const SYMPTOM_LABELS: Record<string, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  fatigue: 'Fatigue',
  acne: 'Acne / Breakouts',
  backache: 'Backache',
  'breast-tenderness': 'Breast Tenderness',
  nausea: 'Nausea'
};

export const MOOD_EMOJIS: Record<string, string> = {
  calm: '😌',
  happy: '☀️',
  energetic: '⚡',
  sad: '🌧️',
  irritable: '⚡',
  anxious: '💭',
  tired: '🥱',
  'mood-swings': '🌀'
};

export const MOOD_LABELS: Record<string, string> = {
  calm: 'Calm',
  happy: 'Happy',
  energetic: 'Energetic',
  sad: 'Sad',
  irritable: 'Irritable',
  anxious: 'Anxious',
  tired: 'Tired',
  'mood-swings': 'Mood Swings'
};

// Date Utilities (Timezone-Safe)
export function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDateString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Group consecutive flow days (allowing <=3 days gap for spotting/missed log)
export function getPeriodGroups(logs: CycleLogsMap): PeriodGroup[] {
  const periodDays: Date[] = [];
  for (const [dateStr, log] of Object.entries(logs)) {
    if (log.flow && log.flow !== 'none') {
      periodDays.push(parseLocalDateString(dateStr));
    }
  }

  if (periodDays.length === 0) return [];

  periodDays.sort((a, b) => a.getTime() - b.getTime());

  const groups: Date[][] = [];
  let currentGroup: Date[] = [periodDays[0]];

  for (let i = 1; i < periodDays.length; i++) {
    const prevDate = periodDays[i - 1];
    const currDate = periodDays[i];
    const gap = getDaysDifference(prevDate, currDate);

    if (gap <= 3) {
      currentGroup.push(currDate);
    } else {
      groups.push(currentGroup);
      currentGroup = [currDate];
    }
  }
  groups.push(currentGroup);

  return groups.map((days) => {
    const start = days[0];
    const end = days[days.length - 1];
    return {
      startDateStr: getLocalDateString(start),
      endDateStr: getLocalDateString(end),
      startDate: start,
      endDate: end,
      length: getDaysDifference(start, end) + 1,
      daysStr: days.map((d) => getLocalDateString(d))
    };
  });
}

// Calculates cycle metrics and forecasts future events
export function calculateCycleMetrics(
  logs: CycleLogsMap,
  settings: CycleSettings
): CycleMetrics {
  const groups = getPeriodGroups(logs);

  let avgCycleLength = settings.cycleLength;
  let avgPeriodLength = settings.periodLength;
  const historicalCycles: { startDateStr: string; endDateStr: string; length: number }[] = [];

  if (groups.length >= 1) {
    let totalCycleLength = 0;
    let cycleCount = 0;
    let totalPeriodLength = 0;

    for (let i = 0; i < groups.length; i++) {
      totalPeriodLength += groups[i].length;

      if (i < groups.length - 1) {
        const diff = getDaysDifference(groups[i].startDate, groups[i + 1].startDate);
        if (diff >= 20 && diff <= 45) {
          historicalCycles.push({
            startDateStr: groups[i].startDateStr,
            endDateStr: groups[i + 1].startDateStr,
            length: diff
          });
          totalCycleLength += diff;
          cycleCount++;
        }
      }
    }

    if (cycleCount > 0) {
      avgCycleLength = Math.round(totalCycleLength / cycleCount);
    }
    avgPeriodLength = Math.round(totalPeriodLength / groups.length);
  }

  if (avgCycleLength < 20 || avgCycleLength > 45) avgCycleLength = settings.cycleLength;
  if (avgPeriodLength < 2 || avgPeriodLength > 10) avgPeriodLength = settings.periodLength;

  const predictions: CycleMetrics['predictions'] = {
    periods: [],
    ovulations: [],
    fertileWindows: []
  };

  if (groups.length > 0) {
    const latestGroup = groups[groups.length - 1];
    const latestLMP = latestGroup.startDate;

    for (let cycleNum = 1; cycleNum <= 3; cycleNum++) {
      const nextLMP = addDays(latestLMP, cycleNum * avgCycleLength);
      const periodEnd = addDays(nextLMP, avgPeriodLength - 1);
      const ovulationDay = addDays(nextLMP, -14);

      const fertileStart = addDays(ovulationDay, -5);
      const fertileEnd = ovulationDay;

      predictions.periods.push({
        startStr: getLocalDateString(nextLMP),
        endStr: getLocalDateString(periodEnd),
        start: nextLMP,
        end: periodEnd
      });

      predictions.ovulations.push(getLocalDateString(ovulationDay));

      const windowDays: string[] = [];
      let curr = new Date(fertileStart);
      while (curr <= fertileEnd) {
        windowDays.push(getLocalDateString(curr));
        curr = addDays(curr, 1);
      }
      predictions.fertileWindows.push(windowDays);
    }
  }

  return {
    groups,
    avgCycleLength,
    avgPeriodLength,
    predictions
  };
}

// Current Phase Info Helper
export function getCurrentPhaseInfo(
  todayStr: string,
  logs: CycleLogsMap,
  metrics: CycleMetrics
): CurrentPhaseInfo {
  const groups = metrics.groups;
  if (groups.length === 0) {
    return {
      phaseName: 'Follicular',
      cycleDay: 1,
      pregnancyChance: 'Low Chance',
      safetyLabel: 'No log data yet',
      phaseDescription: 'Log your first period day to activate cycle calculations.'
    };
  }

  const latestGroup = groups[groups.length - 1];
  const lmpDate = latestGroup.startDate;
  const todayDate = parseLocalDateString(todayStr);
  const diffDays = getDaysDifference(lmpDate, todayDate);

  const cycleDay = (diffDays % metrics.avgCycleLength) + 1;

  // Check if today is period day
  const isLoggedPeriod = logs[todayStr] && logs[todayStr].flow && logs[todayStr].flow !== 'none';
  if (isLoggedPeriod || cycleDay <= metrics.avgPeriodLength) {
    return {
      phaseName: 'Menstrual',
      cycleDay,
      pregnancyChance: 'Low Chance',
      safetyLabel: 'Menstrual Phase (Unlikely Ovulation)',
      phaseDescription: 'Estrogen and progesterone are low. Prioritize rest, warmth, and light stretching.'
    };
  }

  // Ovulation & Fertile check
  const isOvulationDay = metrics.predictions.ovulations.some((d) => d === todayStr) || cycleDay === metrics.avgCycleLength - 14;
  const isFertile = metrics.predictions.fertileWindows.some((w) => w.includes(todayStr)) || (cycleDay >= metrics.avgCycleLength - 19 && cycleDay <= metrics.avgCycleLength - 14);

  if (isOvulationDay) {
    return {
      phaseName: 'Ovulation',
      cycleDay,
      pregnancyChance: 'High Chance',
      safetyLabel: 'Peak Fertility Day (Ovulation)',
      phaseDescription: 'LH surge triggers egg release. High energy, heightened strength, and peak libido.'
    };
  }

  if (isFertile) {
    return {
      phaseName: 'Follicular',
      cycleDay,
      pregnancyChance: 'High Chance',
      safetyLabel: 'Fertile Window (High Chance)',
      phaseDescription: 'Rising estrogen. Ideal time for high-intensity calisthenics & football speed training.'
    };
  }

  if (cycleDay < metrics.avgCycleLength - 14) {
    return {
      phaseName: 'Follicular',
      cycleDay,
      pregnancyChance: 'Medium Chance',
      safetyLabel: 'Post-Menstrual Follicular Phase',
      phaseDescription: 'Estrogen is climbing. Increased muscle recovery, mental clarity, and endurance.'
    };
  }

  return {
    phaseName: 'Luteal',
    cycleDay,
    pregnancyChance: 'Low Chance',
    safetyLabel: 'Luteal Phase (Pre-Menstrual)',
    phaseDescription: 'Progesterone dominates. Focus on recovery, hydration, protein intake, and gentle mobility.'
  };
}

// Initial Sample Demo Data (3 Months Mock Logs matching pt/Cycle_Tracker/app.js)
export const initialCycleLogs: CycleLogsMap = {
  // Cycle 3: April 30 - May 3, 2026
  '2026-04-30': { flow: 'heavy', symptoms: ['cramps', 'backache'], moods: ['sad', 'tired'], notes: 'Start of cycle. Quite crampy.' },
  '2026-05-01': { flow: 'medium', symptoms: ['cramps', 'bloating'], moods: ['tired'], notes: 'Day 2: Better energy.' },
  '2026-05-02': { flow: 'medium', symptoms: ['headache'], moods: ['calm'], notes: '' },
  '2026-05-03': { flow: 'light', symptoms: [], moods: ['happy', 'calm'], notes: 'Flow tapering off.' },
  '2026-05-13': { flow: 'none', symptoms: [], moods: ['happy', 'energetic'], notes: 'Feeling great, peak energy.' },
  '2026-05-14': { flow: 'none', symptoms: [], moods: ['calm', 'energetic'], notes: 'Ovulation day predicted.' },

  // Cycle 2: May 28 - May 31, 2026
  '2026-05-28': { flow: 'heavy', symptoms: ['cramps', 'fatigue'], moods: ['sad', 'tired'], notes: 'Cycle started early in the morning.' },
  '2026-05-29': { flow: 'medium', symptoms: ['cramps', 'backache'], moods: ['irritable', 'tired'], notes: 'Mood swings today.' },
  '2026-05-30': { flow: 'medium', symptoms: ['bloating'], moods: ['calm'], notes: '' },
  '2026-05-31': { flow: 'light', symptoms: [], moods: ['happy'], notes: 'Over.' },
  '2026-06-10': { flow: 'none', symptoms: [], moods: ['energetic'], notes: 'High libido, clear skin.' },

  // Cycle 1: June 25 - June 28, 2026
  '2026-06-25': { flow: 'heavy', symptoms: ['cramps', 'bloating'], moods: ['sad', 'tired'], notes: 'Day 1. Standard cycle cramps.' },
  '2026-06-26': { flow: 'heavy', symptoms: ['cramps', 'headache'], moods: ['tired', 'mood-swings'], notes: 'Cramps are quite intense.' },
  '2026-06-27': { flow: 'medium', symptoms: ['fatigue'], moods: ['calm'], notes: 'Resting.' },
  '2026-06-28': { flow: 'light', symptoms: [], moods: ['happy', 'calm'], notes: 'Cycle finished.' },
  '2026-07-08': { flow: 'none', symptoms: [], moods: ['happy', 'energetic'], notes: 'Feeling motivated.' },
  '2026-07-09': { flow: 'none', symptoms: [], moods: ['calm'], notes: 'Predicted ovulation day.' },

  // Recent Cycle: July 23 - July 27, 2026
  '2026-07-23': { flow: 'heavy', symptoms: ['cramps'], moods: ['tired'], notes: 'Cycle started on time.' },
  '2026-07-24': { flow: 'medium', symptoms: ['cramps'], moods: ['calm'], notes: '' },
  '2026-07-25': { flow: 'medium', symptoms: [], moods: ['happy'], notes: '' },
  '2026-07-26': { flow: 'light', symptoms: [], moods: ['happy'], notes: 'Tapering off.' },
  '2026-07-27': { flow: 'light', symptoms: [], moods: ['calm'], notes: 'Ended.' }
};

export const initialCycleSettings: CycleSettings = {
  cycleLength: 28,
  periodLength: 5
};
