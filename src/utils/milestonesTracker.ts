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
export function estimateSteps(activityType: 'run' | 'cycle' | 'walk' | 'drive', distanceKm: number): number {
  if (activityType === 'run') {
    return Math.round(distanceKm * 1250); // ~1250 steps/km
  } else if (activityType === 'walk') {
    return Math.round(distanceKm * 1350); // ~1350 steps/km
  }
  return 0; // Cycling and Driving do not add foot steps
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
    currentSplitDistMeters += segDistKm * 1000;

    if (currentSplitDistMeters >= splitIntervalMeters || i === points.length - 1) {
      const splitDurationSec = (points[i].timestamp - points[splitStartIndex].timestamp) / 1000;
      const splitDistKm = currentSplitDistMeters / 1000;
      const elevationDelta = (points[i].altitude || 0) - (points[splitStartIndex].altitude || 0);

      splits.push({
        splitNumber,
        distanceLabel: `${splitIntervalMeters >= 1000 ? (splitNumber * (splitIntervalMeters / 1000)).toFixed(1) + 'km' : (splitNumber * splitIntervalMeters) + 'm'}`,
        distanceMeters: Math.round(currentSplitDistMeters),
        durationSeconds: Math.max(1, Math.round(splitDurationSec)),
        paceMinKm: formatPace(splitDistKm, splitDurationSec),
        elevationDeltaMeters: Math.round(elevationDelta),
        speedKmh: splitDurationSec > 0 ? Number(((splitDistKm / (splitDurationSec / 3600))).toFixed(1)) : 0
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
  activityType: 'run' | 'cycle' | 'walk' | 'drive',
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
  } else if (activityType === 'drive') {
    calories = Math.round(durationMin * 2.5); // passive driving calorie burn
    heartPoints = Math.min(15, Math.round(durationMin * 0.2));
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

/**
 * Generates rich, realistic sample outdoor activities with GPS tracks for instant flyby, video rendering and testing.
 */
export function generateSampleGpsActivity(type: 'marine_run' | 'coastal_cycle' | 'trail_run' | 'express_drive' = 'marine_run'): GpsActivityLog {
  const now = Date.now();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (type === 'coastal_cycle') {
    // 22.5 km Cycling Tour
    const startLat = 18.9220;
    const startLng = 72.8347;
    const numPoints = 220;
    const points: GpsLocationPoint[] = [];

    for (let i = 0; i < numPoints; i++) {
      const progress = i / numPoints;
      const angle = progress * Math.PI * 3.5;
      const lat = startLat + Math.sin(angle) * 0.08 + progress * 0.12;
      const lng = startLng + Math.cos(angle * 0.8) * 0.09 + progress * 0.06;
      const alt = 15 + Math.sin(progress * Math.PI * 4) * 45 + progress * 80;
      const speedKmh = 24 + Math.sin(progress * Math.PI * 8) * 9;
      points.push({
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        timestamp: now - (numPoints - i) * 12000,
        speed: speedKmh / 3.6
      });
    }

    const durationSec = 3120; // 52 mins
    const distanceKm = 22.5;
    const elevation = 165;
    const splits = calculateSplits(points, 500);

    return {
      id: `sample_cycle_${now}`,
      userId: 'men',
      activityType: 'cycle',
      date: dateStr,
      startTime: now - durationSec * 1000,
      endTime: now,
      distanceKm,
      durationSeconds: durationSec,
      avgSpeedKmh: 26.0,
      topSpeedKmh: 38.4,
      avgPaceMinKm: formatPace(distanceKm, durationSec),
      elevationGainMeters: elevation,
      routePoints: points,
      splits,
      stepsCount: 0,
      heartPointsEarned: 75,
      caloriesBurned: 580,
      milestonesReached: []
    };
  } else if (type === 'trail_run') {
    // 7.8 km Mountain Ridge Trail
    const startLat = 19.0176;
    const startLng = 72.8561;
    const numPoints = 160;
    const points: GpsLocationPoint[] = [];

    for (let i = 0; i < numPoints; i++) {
      const progress = i / numPoints;
      const lat = startLat + Math.sin(progress * Math.PI * 2.5) * 0.05 + progress * 0.07;
      const lng = startLng + Math.cos(progress * Math.PI * 3) * 0.06 + Math.sin(progress * Math.PI * 5) * 0.02;
      const alt = 40 + Math.sin(progress * Math.PI * 2) * 120 + progress * 90;
      const speedKmh = 10.5 + Math.cos(progress * Math.PI * 6) * 3;
      points.push({
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        timestamp: now - (numPoints - i) * 15000,
        speed: speedKmh / 3.6
      });
    }

    const durationSec = 2580; // 43 mins
    const distanceKm = 7.8;
    const elevation = 240;
    const splits = calculateSplits(points, 200);

    return {
      id: `sample_trail_${now}`,
      userId: 'men',
      activityType: 'run',
      date: dateStr,
      startTime: now - durationSec * 1000,
      endTime: now,
      distanceKm,
      durationSeconds: durationSec,
      avgSpeedKmh: 10.9,
      topSpeedKmh: 15.2,
      avgPaceMinKm: formatPace(distanceKm, durationSec),
      elevationGainMeters: elevation,
      routePoints: points,
      splits,
      stepsCount: 9750,
      heartPointsEarned: 68,
      caloriesBurned: 640,
      milestonesReached: []
    };
  } else if (type === 'express_drive') {
    // 48.2 km Coastal Highway Road Trip & Express Drive
    const startLat = 18.9890;
    const startLng = 72.8250;
    const numPoints = 280;
    const points: GpsLocationPoint[] = [];

    for (let i = 0; i < numPoints; i++) {
      const progress = i / numPoints;
      const lat = startLat + progress * 0.28 + Math.sin(progress * Math.PI * 3) * 0.015;
      const lng = startLng + progress * 0.16 + Math.cos(progress * Math.PI * 2) * 0.012;
      const alt = 8 + Math.sin(progress * Math.PI * 4) * 35 + progress * 40;
      const speedKmh = 72 + Math.sin(progress * Math.PI * 10) * 22; // 50 to 94 km/h cruising
      points.push({
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        timestamp: now - (numPoints - i) * 6000,
        speed: speedKmh / 3.6
      });
    }

    const durationSec = 2160; // 36 mins
    const distanceKm = 48.2;
    const elevation = 110;
    const splits = calculateSplits(points, 2000);

    return {
      id: `sample_drive_${now}`,
      userId: 'men',
      activityType: 'drive',
      date: dateStr,
      startTime: now - durationSec * 1000,
      endTime: now,
      distanceKm,
      durationSeconds: durationSec,
      avgSpeedKmh: 80.3,
      topSpeedKmh: 104.5,
      avgPaceMinKm: '0:45 /km',
      elevationGainMeters: elevation,
      routePoints: points,
      splits,
      stepsCount: 0,
      heartPointsEarned: 15,
      caloriesBurned: 190,
      milestonesReached: []
    };
  } else {
    // 5.2 km Marine Drive Sunrise Tempo Run (Default)
    const startLat = 18.9438;
    const startLng = 72.8232;
    const numPoints = 140;
    const points: GpsLocationPoint[] = [];

    for (let i = 0; i < numPoints; i++) {
      const progress = i / numPoints;
      const lat = startLat + progress * 0.045 + Math.sin(progress * Math.PI * 2) * 0.008;
      const lng = startLng - progress * 0.015 + Math.cos(progress * Math.PI * 1.5) * 0.006;
      const alt = 6 + Math.sin(progress * Math.PI * 3) * 12;
      const speedKmh = 12.2 + Math.sin(progress * Math.PI * 6) * 2.8;
      points.push({
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        timestamp: now - (numPoints - i) * 11000,
        speed: speedKmh / 3.6
      });
    }

    const durationSec = 1540; // 25m 40s
    const distanceKm = 5.2;
    const elevation = 32;
    const splits = calculateSplits(points, 100);

    return {
      id: `sample_marine_${now}`,
      userId: 'men',
      activityType: 'run',
      date: dateStr,
      startTime: now - durationSec * 1000,
      endTime: now,
      distanceKm,
      durationSeconds: durationSec,
      avgSpeedKmh: 12.1,
      topSpeedKmh: 16.5,
      avgPaceMinKm: '4:56 /km',
      elevationGainMeters: elevation,
      routePoints: points,
      splits,
      stepsCount: 6500,
      heartPointsEarned: 48,
      caloriesBurned: 420,
      milestonesReached: []
    };
  }
}
