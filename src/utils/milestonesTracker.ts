import type {
  GpsLocationPoint,
  GpsActivityLog,
  PersonalMilestones,
  ActivitySplit,
  WeeklyHeartPointsSummary,
  WorkoutSessionLog
} from '../types';

/**
 * Calculates geodesic distance between two GPS coordinates using the Haversine formula (in km).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS string.
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats pace in minutes per km (e.g. "4:45 /km").
 */
export function formatPace(distanceKm: number, durationSeconds: number): string {
  if (distanceKm <= 0.01 || durationSeconds <= 0) return "--:-- /km";
  const paceSecondsPerKm = durationSeconds / distanceKm;
  if (paceSecondsPerKm > 3600) return "--:-- /km";
  
  const min = Math.floor(paceSecondsPerKm / 60);
  const sec = Math.floor(paceSecondsPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
}

/**
 * Calculates cumulative positive elevation gain in meters.
 */
export function calculateElevationGain(points: GpsLocationPoint[]): number {
  if (!points || points.length < 2) return 0;
  let totalAscent = 0;

  for (let i = 1; i < points.length; i++) {
    const prevAlt = points[i - 1].altitude;
    const currAlt = points[i].altitude;
    if (prevAlt !== undefined && currAlt !== undefined) {
      const delta = currAlt - prevAlt;
      // Filter micro GPS altitude jitter (> 0.5m threshold)
      if (delta > 0.5 && delta < 50) {
        totalAscent += delta;
      }
    }
  }

  return Math.round(totalAscent);
}

/**
 * Calculates step counts based on activity type and distance.
 */
export function estimateSteps(activityType: 'run' | 'cycle' | 'walk', distanceKm: number): number {
  if (activityType === 'run') {
    return Math.round(distanceKm * 1250); // ~1250 steps/km
  } else if (activityType === 'walk') {
    return Math.round(distanceKm * 1350); // ~1350 steps/km
  }
  return 0; // Cycling does not add walking steps
}

/**
 * Slices GPS trajectory points into 100m split intervals.
 */
export function calculateSplits(points: GpsLocationPoint[], splitIntervalMeters = 100): ActivitySplit[] {
  if (!points || points.length < 2) return [];

  const splits: ActivitySplit[] = [];
  let currentSplitDistMeters = 0;
  let splitStartIndex = 0;
  let splitNumber = 1;

  for (let i = 1; i < points.length; i++) {
    const segDistKm = calculateDistanceKm(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
    const segDistMeters = segDistKm * 1000;
    currentSplitDistMeters += segDistMeters;

    if (currentSplitDistMeters >= splitIntervalMeters || i === points.length - 1) {
      const timeStart = points[splitStartIndex].timestamp;
      const timeEnd = points[i].timestamp;
      const durationSeconds = Math.max(1, Math.round((timeEnd - timeStart) / 1000));
      const distKm = currentSplitDistMeters / 1000;
      const speedKmh = distKm / (durationSeconds / 3600);

      const altStart = points[splitStartIndex].altitude || 0;
      const altEnd = points[i].altitude || 0;
      const elevationDelta = Math.round(altEnd - altStart);

      const fromM = (splitNumber - 1) * splitIntervalMeters;
      const toM = fromM + Math.round(currentSplitDistMeters);

      splits.push({
        splitNumber,
        distanceLabel: `${fromM}m - ${toM}m`,
        distanceMeters: Math.round(currentSplitDistMeters),
        durationSeconds,
        paceMinKm: formatPace(distKm, durationSeconds),
        elevationDeltaMeters: elevationDelta,
        speedKmh: Number(speedKmh.toFixed(1))
      });

      splitNumber++;
      currentSplitDistMeters = 0;
      splitStartIndex = i;
    }
  }

  return splits;
}

/**
 * Calculates Google Fit Heart Points and Estimated Calories.
 */
export function calculateFitMetrics(
  activityType: 'run' | 'cycle' | 'walk',
  distanceKm: number,
  durationSeconds: number,
  avgSpeedKmh: number
): { calories: number; heartPoints: number } {
  const durationMin = durationSeconds / 60;
  let calories = 0;
  let heartPoints = 0;

  if (activityType === 'run') {
    calories = Math.round(distanceKm * 65);
    heartPoints = Math.round(durationMin * 2); // 2 Heart Points/min for vigorous running
  } else if (activityType === 'cycle') {
    calories = Math.round(distanceKm * 32);
    heartPoints = avgSpeedKmh >= 20 ? Math.round(durationMin * 2) : Math.round(durationMin * 1);
  } else {
    // Walk
    calories = Math.round(distanceKm * 50);
    heartPoints = Math.round(durationMin * 1);
  }

  return { calories: Math.max(0, calories), heartPoints: Math.max(0, heartPoints) };
}

/**
 * Google Fit & WHO Weekly 150 Heart Points Calculation (Sunday to Saturday).
 */
export function calculateWeeklyHeartPoints(
  activities: GpsActivityLog[],
  workoutLogs: WorkoutSessionLog[]
): WeeklyHeartPointsSummary {
  const now = new Date();
  // Get Sunday of current week
  const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  // Accumulate GPS activities points this week
  activities.forEach((act) => {
    const actDate = new Date(act.startTime || act.date);
    if (actDate >= sunday && actDate <= saturday) {
      const d = actDate.getDay();
      dailyMap[d] = (dailyMap[d] || 0) + (act.heartPointsEarned || 0);
    }
  });

  // Accumulate Calisthenics & Football workout points this week (15 pts per session)
  workoutLogs.forEach((w) => {
    const wDate = new Date(w.date);
    if (wDate >= sunday && wDate <= saturday) {
      const d = wDate.getDay();
      dailyMap[d] = (dailyMap[d] || 0) + 15;
    }
  });

  let totalPoints = 0;
  const dailyBreakdown = dayNames.map((name, index) => {
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + index);
    const points = dailyMap[index] || 0;
    totalPoints += points;
    return {
      day: name,
      points,
      date: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: index === dayOfWeek
    };
  });

  const targetPoints = 150; // Google Fit mandatory weekly target

  return {
    weekStartDateStr: sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weekEndDateStr: saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    targetPoints,
    currentPoints: totalPoints,
    dailyBreakdown,
    isGoalAchieved: totalPoints >= targetPoints
  };
}

/**
 * Default baseline milestones for new users.
 */
export const defaultMilestones: PersonalMilestones = {
  fastest1kRunSeconds: 300, // 5:00 min baseline
  fastest5kRunSeconds: 1650, // 27:30 min baseline
  fastest1kCycleSeconds: 120, // 2:00 min baseline (30 km/h)
  fastest10kCycleSeconds: 1500, // 25:00 min baseline
  longestRunKm: 5.0,
  longestCycleKm: 15.0,
  topSpeedRunKmh: 14.5,
  topSpeedCycleKmh: 35.0,
  totalDistanceRunKm: 0,
  totalDistanceCycleKm: 0,
  lastUpdated: new Date().toISOString()
};

/**
 * Checks an activity against existing milestones, updates records, and returns unlocked milestones.
 */
export function evaluateMilestones(
  activity: GpsActivityLog,
  currentMilestones: PersonalMilestones
): { updatedMilestones: PersonalMilestones; unlocked: string[] } {
  const updated: PersonalMilestones = { ...currentMilestones };
  const unlocked: string[] = [];

  const durationSec = activity.durationSeconds;
  const dist = activity.distanceKm;
  const topSpeed = activity.topSpeedKmh;

  if (activity.activityType === 'run') {
    updated.totalDistanceRunKm = (updated.totalDistanceRunKm || 0) + dist;

    // Check Fastest 1km
    if (dist >= 1.0) {
      const estimated1kTime = (durationSec / dist);
      if (!updated.fastest1kRunSeconds || estimated1kTime < updated.fastest1kRunSeconds) {
        updated.fastest1kRunSeconds = Math.round(estimated1kTime);
        unlocked.push(`⚡ NEW RECORD: Fastest 1 km Run (${formatDuration(updated.fastest1kRunSeconds)})!`);
      }
    }

    // Check Fastest 5km
    if (dist >= 5.0) {
      const estimated5kTime = (durationSec / dist) * 5;
      if (!updated.fastest5kRunSeconds || estimated5kTime < updated.fastest5kRunSeconds) {
        updated.fastest5kRunSeconds = Math.round(estimated5kTime);
        unlocked.push(`🏆 NEW PB: Fastest 5 km Run (${formatDuration(updated.fastest5kRunSeconds)})!`);
      }
    }

    // Check Longest Run
    if (dist > (updated.longestRunKm || 0)) {
      updated.longestRunKm = Number(dist.toFixed(2));
      unlocked.push(`🌟 MILESTONE: Longest Run Ever (${updated.longestRunKm} km)!`);
    }

    // Top Speed
    if (topSpeed > (updated.topSpeedRunKmh || 0)) {
      updated.topSpeedRunKmh = Number(topSpeed.toFixed(1));
      unlocked.push(`🚀 SPEED DEMON: Top Sprint Speed (${updated.topSpeedRunKmh} km/h)!`);
    }
  } else if (activity.activityType === 'cycle') {
    updated.totalDistanceCycleKm = (updated.totalDistanceCycleKm || 0) + dist;

    // Check Fastest 1km Cycle
    if (dist >= 1.0) {
      const estimated1kTime = (durationSec / dist);
      if (!updated.fastest1kCycleSeconds || estimated1kTime < updated.fastest1kCycleSeconds) {
        updated.fastest1kCycleSeconds = Math.round(estimated1kTime);
        unlocked.push(`⚡ NEW RECORD: Fastest 1 km Cycling (${formatDuration(updated.fastest1kCycleSeconds)})!`);
      }
    }

    // Check Fastest 10km Cycle
    if (dist >= 10.0) {
      const estimated10kTime = (durationSec / dist) * 10;
      if (!updated.fastest10kCycleSeconds || estimated10kTime < updated.fastest10kCycleSeconds) {
        updated.fastest10kCycleSeconds = Math.round(estimated10kTime);
        unlocked.push(`🏆 NEW PB: Fastest 10 km Cycling (${formatDuration(updated.fastest10kCycleSeconds)})!`);
      }
    }

    // Longest Cycle
    if (dist > (updated.longestCycleKm || 0)) {
      updated.longestCycleKm = Number(dist.toFixed(2));
      unlocked.push(`🚴 TOUR DISTANCE: Longest Ride (${updated.longestCycleKm} km)!`);
    }

    // Top Speed Cycle
    if (topSpeed > (updated.topSpeedCycleKmh || 0)) {
      updated.topSpeedCycleKmh = Number(topSpeed.toFixed(1));
      unlocked.push(`🔥 MAX SPRINT: Top Cycling Speed (${updated.topSpeedCycleKmh} km/h)!`);
    }
  }

  updated.lastUpdated = new Date().toISOString();
  return { updatedMilestones: updated, unlocked };
}

/**
 * Converts a sequence of GPS points into an SVG Path for minimalist visual route cards.
 */
export function generateRouteSvgPath(points: GpsLocationPoint[], width = 280, height = 140): string {
  if (!points || points.length < 2) return '';

  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;

  points.forEach((p) => {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLon) minLon = p.longitude;
    if (p.longitude > maxLon) maxLon = p.longitude;
  });

  const latRange = maxLat - minLat || 0.0001;
  const lonRange = maxLon - minLon || 0.0001;
  const padding = 15;

  const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - padding * 2);
  const toY = (lat: number) => height - (padding + ((lat - minLat) / latRange) * (height - padding * 2));

  let pathStr = `M ${toX(points[0].longitude).toFixed(1)} ${toY(points[0].latitude).toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    pathStr += ` L ${toX(points[i].longitude).toFixed(1)} ${toY(points[i].latitude).toFixed(1)}`;
  }

  return pathStr;
}
