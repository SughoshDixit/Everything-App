import type { GpsLocationPoint, Workout } from '../types';
import { AUTHENTIC_GPS_ACTIVITIES } from '../data/authenticStravaData';

// Pre-calculated realistic high-fidelity route coordinate paths for key Bangalore athletic landmarks
export const CUBBON_PARK_POINTS: GpsLocationPoint[] = [
  { latitude: 12.9760, longitude: 77.5925, altitude: 915, speed: 3.4, accuracy: 3.5, timestamp: Date.now() - 1440000 },
  { latitude: 12.9772, longitude: 77.5938, altitude: 916, speed: 3.6, accuracy: 3.2, timestamp: Date.now() - 1320000 },
  { latitude: 12.9785, longitude: 77.5955, altitude: 918, speed: 3.7, accuracy: 3.0, timestamp: Date.now() - 1200000 },
  { latitude: 12.9798, longitude: 77.5972, altitude: 920, speed: 3.5, accuracy: 3.1, timestamp: Date.now() - 1080000 },
  { latitude: 12.9810, longitude: 77.5990, altitude: 922, speed: 3.3, accuracy: 3.3, timestamp: Date.now() - 960000 },
  { latitude: 12.9805, longitude: 77.6012, altitude: 921, speed: 3.8, accuracy: 3.0, timestamp: Date.now() - 840000 },
  { latitude: 12.9788, longitude: 77.6030, altitude: 919, speed: 3.9, accuracy: 2.9, timestamp: Date.now() - 720000 },
  { latitude: 12.9765, longitude: 77.6025, altitude: 917, speed: 3.6, accuracy: 3.2, timestamp: Date.now() - 600000 },
  { latitude: 12.9745, longitude: 77.6005, altitude: 915, speed: 3.4, accuracy: 3.4, timestamp: Date.now() - 480000 },
  { latitude: 12.9730, longitude: 77.5980, altitude: 914, speed: 3.5, accuracy: 3.0, timestamp: Date.now() - 360000 },
  { latitude: 12.9725, longitude: 77.5950, altitude: 914, speed: 3.7, accuracy: 3.1, timestamp: Date.now() - 240000 },
  { latitude: 12.9740, longitude: 77.5930, altitude: 915, speed: 3.6, accuracy: 3.2, timestamp: Date.now() - 120000 },
  { latitude: 12.9760, longitude: 77.5925, altitude: 915, speed: 3.5, accuracy: 3.0, timestamp: Date.now() }
];

export const NANDI_HILLS_POINTS: GpsLocationPoint[] = [
  { latitude: 13.3550, longitude: 77.6720, altitude: 920, speed: 6.2, accuracy: 3.5, timestamp: Date.now() - 6000000 },
  { latitude: 13.3580, longitude: 77.6745, altitude: 965, speed: 5.8, accuracy: 3.2, timestamp: Date.now() - 5400000 },
  { latitude: 13.3610, longitude: 77.6770, altitude: 1040, speed: 5.1, accuracy: 3.1, timestamp: Date.now() - 4800000 },
  { latitude: 13.3635, longitude: 77.6785, altitude: 1120, speed: 4.8, accuracy: 3.4, timestamp: Date.now() - 4200000 },
  { latitude: 13.3660, longitude: 77.6800, altitude: 1210, speed: 4.5, accuracy: 3.0, timestamp: Date.now() - 3600000 },
  { latitude: 13.3680, longitude: 77.6820, altitude: 1320, speed: 4.2, accuracy: 3.2, timestamp: Date.now() - 3000000 },
  { latitude: 13.3695, longitude: 77.6830, altitude: 1410, speed: 4.6, accuracy: 3.1, timestamp: Date.now() - 2400000 },
  { latitude: 13.3705, longitude: 77.6835, altitude: 1478, speed: 5.4, accuracy: 2.8, timestamp: Date.now() - 1800000 },
  { latitude: 13.3690, longitude: 77.6845, altitude: 1450, speed: 8.5, accuracy: 3.0, timestamp: Date.now() - 1200000 },
  { latitude: 13.3650, longitude: 77.6810, altitude: 1250, speed: 11.2, accuracy: 3.5, timestamp: Date.now() - 600000 },
  { latitude: 13.3550, longitude: 77.6720, altitude: 920, speed: 9.8, accuracy: 3.2, timestamp: Date.now() }
];

export const TURAHALLI_FOREST_POINTS: GpsLocationPoint[] = [
  { latitude: 12.8830, longitude: 77.5210, altitude: 890, speed: 3.2, accuracy: 3.8, timestamp: Date.now() - 2500000 },
  { latitude: 12.8845, longitude: 77.5230, altitude: 905, speed: 3.4, accuracy: 3.5, timestamp: Date.now() - 2100000 },
  { latitude: 12.8860, longitude: 77.5255, altitude: 925, speed: 3.1, accuracy: 3.2, timestamp: Date.now() - 1700000 },
  { latitude: 12.8875, longitude: 77.5280, altitude: 945, speed: 2.9, accuracy: 3.0, timestamp: Date.now() - 1300000 },
  { latitude: 12.8885, longitude: 77.5260, altitude: 935, speed: 3.5, accuracy: 3.3, timestamp: Date.now() - 900000 },
  { latitude: 12.8865, longitude: 77.5235, altitude: 910, speed: 3.8, accuracy: 3.4, timestamp: Date.now() - 500000 },
  { latitude: 12.8830, longitude: 77.5210, altitude: 890, speed: 3.6, accuracy: 3.2, timestamp: Date.now() }
];

export const SOUTH_UNITED_PITCH_POINTS: GpsLocationPoint[] = [
  { latitude: 12.9350, longitude: 77.6240, altitude: 910, speed: 5.5, accuracy: 2.5, timestamp: Date.now() - 3600000 },
  { latitude: 12.9358, longitude: 77.6242, altitude: 910, speed: 7.2, accuracy: 2.4, timestamp: Date.now() - 3000000 },
  { latitude: 12.9362, longitude: 77.6250, altitude: 910, speed: 6.8, accuracy: 2.5, timestamp: Date.now() - 2400000 },
  { latitude: 12.9355, longitude: 77.6255, altitude: 910, speed: 8.1, accuracy: 2.3, timestamp: Date.now() - 1800000 },
  { latitude: 12.9348, longitude: 77.6248, altitude: 910, speed: 5.9, accuracy: 2.6, timestamp: Date.now() - 1200000 },
  { latitude: 12.9352, longitude: 77.6242, altitude: 910, speed: 7.5, accuracy: 2.4, timestamp: Date.now() - 600000 },
  { latitude: 12.9350, longitude: 77.6240, altitude: 910, speed: 4.8, accuracy: 2.5, timestamp: Date.now() }
];

export const INDOOR_STUDIO_POINTS: GpsLocationPoint[] = [
  { latitude: 12.9716, longitude: 77.5946, altitude: 915, speed: 0, accuracy: 10, timestamp: Date.now() - 2700000 },
  { latitude: 12.9716, longitude: 77.5946, altitude: 915, speed: 0, accuracy: 10, timestamp: Date.now() }
];

/**
 * Resolves the best available GPS route points for any workout in the collection.
 * 1. Checks authentic Strava activities by title / ID
 * 2. Checks landmark locations (Nandi, Turahalli, South United, Cubbon)
 * 3. Falls back to the closest authentic activity by sport & distance
 */
export function getRoutePointsForWorkout(workout: Workout): GpsLocationPoint[] {
  if (!workout) return CUBBON_PARK_POINTS;

  // 1. Exact or partial title match in authentic Strava GPS activities
  if (workout.title) {
    const wTitle = workout.title.toLowerCase().trim();
    const match = AUTHENTIC_GPS_ACTIVITIES.find((a) => {
      if (!a.title) return false;
      const aTitle = a.title.toLowerCase().trim();
      return aTitle === wTitle || aTitle.includes(wTitle) || wTitle.includes(aTitle);
    });
    if (match && match.routePoints && match.routePoints.length >= 2) {
      return match.routePoints;
    }
  }

  // 2. Specific athletic landmark matches
  if (workout.location) {
    const loc = workout.location.toLowerCase();
    if (loc.includes('nandi')) return NANDI_HILLS_POINTS;
    if (loc.includes('turahalli')) return TURAHALLI_FOREST_POINTS;
    if (loc.includes('south united') || workout.sport === 'Football') return SOUTH_UNITED_PITCH_POINTS;
    if (loc.includes('cubbon')) return CUBBON_PARK_POINTS;
  }

  if (workout.sport === 'Calisthenics') {
    return INDOOR_STUDIO_POINTS;
  }

  // 3. Find closest authentic activity by sport & distance
  const targetDist = parseFloat(workout.distance) || 5.0;
  const targetType = workout.sport === 'Cycling' ? 'cycle' : 'run';
  const sportMatches = AUTHENTIC_GPS_ACTIVITIES.filter(
    (a) => a.activityType === targetType && a.routePoints && a.routePoints.length >= 10
  );

  if (sportMatches.length > 0) {
    let best = sportMatches[0];
    let minDiff = Math.abs((best.distanceKm || 0) - targetDist);
    for (const act of sportMatches) {
      const diff = Math.abs((act.distanceKm || 0) - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        best = act;
      }
    }
    return best.routePoints;
  }

  return CUBBON_PARK_POINTS;
}

export interface ProjectorResult {
  project: (lat: number, lng: number) => [number, number];
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  center: { lat: number; lng: number };
  drawWidth: number;
  drawHeight: number;
}

/**
 * Creates an aspect-ratio-preserving projector that prevents route squishing/stretching.
 * Applies latitude cosine projection math so angles, curves, and turns are 100% geographically authentic.
 */
export function createAspectRatioProjector(
  points: { latitude: number; longitude: number }[] | [number, number][],
  viewBox: { x: number; y: number; width: number; height: number },
  padding: number = 20
): ProjectorResult {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

  for (const pt of points) {
    const lat = Array.isArray(pt) ? pt[1] : pt.latitude;
    const lng = Array.isArray(pt) ? pt[0] : pt.longitude;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }

  // Graceful fallback for single point or invalid coords
  if (!Number.isFinite(minLat) || minLat === maxLat) {
    minLat = 12.9716; maxLat = 12.9750;
  }
  if (!Number.isFinite(minLng) || minLng === maxLng) {
    minLng = 77.5946; maxLng = 77.5980;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Real-world metric correction factor: longitude shrinks by cos(centerLat)
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  const geoWidth = Math.max(0.00001, (maxLng - minLng) * cosLat);
  const geoHeight = Math.max(0.00001, maxLat - minLat);

  const usableW = Math.max(10, viewBox.width - padding * 2);
  const usableH = Math.max(10, viewBox.height - padding * 2);

  // Uniform scale that fits BOTH dimensions without stretching or squishing
  const scale = Math.min(usableW / geoWidth, usableH / geoHeight);

  const drawW = geoWidth * scale;
  const drawH = geoHeight * scale;

  // Center route within viewBox
  const offsetX = viewBox.x + (viewBox.width - drawW) / 2;
  const offsetY = viewBox.y + (viewBox.height - drawH) / 2;

  const project = (lat: number, lng: number): [number, number] => {
    const px = offsetX + ((lng - minLng) * cosLat) * scale;
    // In screen coordinates, top is 0, so higher latitude (north) is lower y
    const py = offsetY + drawH - (lat - minLat) * scale;
    return [px, py];
  };

  return {
    project,
    bounds: { minLat, maxLat, minLng, maxLng },
    center: { lat: centerLat, lng: centerLng },
    drawWidth: drawW,
    drawHeight: drawH
  };
}
