import type { GpsLocationPoint, GpsActivityLog, PersonalMilestones } from '../types';

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
    heartPoints = Math.round(durationMin * 2); // Vigorous cardio
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
  // Invert Y because SVG coordinates increase downwards, latitude increases upwards
  const toY = (lat: number) => height - (padding + ((lat - minLat) / latRange) * (height - padding * 2));

  let pathStr = `M ${toX(points[0].longitude).toFixed(1)} ${toY(points[0].latitude).toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    pathStr += ` L ${toX(points[i].longitude).toFixed(1)} ${toY(points[i].latitude).toFixed(1)}`;
  }

  return pathStr;
}
