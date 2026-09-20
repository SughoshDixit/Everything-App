/**
 * Advanced GPS Accuracy & Movement Filtering Engine
 * Implements:
 * 1. 2D Position Kalman Filter for Latitude & Longitude based on GPS accuracy variance.
 * 2. Stationary Noise Gate to eliminate false distance accumulation when stationary.
 * 3. Sport-specific Physical Speed Bounds to drop GPS teleportation anomalies.
 * 4. High-Precision Haversine geodesic distance calculation.
 */

export interface GpsFilterPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number; // m/s
  accuracy?: number; // meters
  timestamp: number; // epoch ms
}

export type GpsSignalQuality = 'excellent' | 'good' | 'weak' | 'invalid';

export interface GpsFilterState {
  lat: number;
  lng: number;
  variance: number; // estimated accuracy variance in degrees squared
  lastTimestamp: number;
  totalDistanceKm: number;
  points: GpsFilterPoint[];
  lastAcceptedPoint: GpsFilterPoint | null;
}

// Convert meters to approximate degrees latitude
const METERS_PER_DEGREE_LAT = 111139;

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates high-precision geodesic distance in kilometers between two GPS points.
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (EARTH_RADIUS_METERS * c) / 1000;
}

/**
 * Returns signal quality label based on GPS accuracy radius.
 */
export function evaluateGpsSignalQuality(accuracy?: number): GpsSignalQuality {
  if (accuracy === undefined || accuracy === null || accuracy <= 0 || accuracy > 40) {
    return 'invalid';
  }
  if (accuracy <= 8) return 'excellent';
  if (accuracy <= 18) return 'good';
  return 'weak';
}

/**
 * Max allowable human speed in km/h by activity type.
 */
export function getMaxAllowableSpeedKmh(activityType: 'run' | 'cycle' | 'walk' | 'drive'): number {
  switch (activityType) {
    case 'walk':
      return 11.0; // Fast walking max
    case 'run':
      return 30.0; // World-class sprint max
    case 'cycle':
      return 75.0; // Fast road cycling downhill
    case 'drive':
      return 220.0;
    default:
      return 35.0;
  }
}

/**
 * Creates an initialized GPS filter state.
 */
export function createGpsFilterState(): GpsFilterState {
  return {
    lat: 0,
    lng: 0,
    variance: -1,
    lastTimestamp: 0,
    totalDistanceKm: 0,
    points: [],
    lastAcceptedPoint: null
  };
}

/**
 * Evaluates an incoming raw GPS coordinate through the filter pipeline.
 * Returns the smoothed point and whether it contributed to distance.
 */
export function processRawGpsPoint(
  state: GpsFilterState,
  raw: GpsFilterPoint,
  activityType: 'run' | 'cycle' | 'walk' | 'drive'
): {
  filteredPoint: GpsFilterPoint;
  accepted: boolean;
  deltaDistanceKm: number;
  calculatedSpeedKmh: number;
  rejectionReason?: string;
} {
  const accuracy = raw.accuracy ?? 30;

  // 1. Accuracy Gate: Reject severely inaccurate points (e.g. cellular tower triangulation)
  const maxAccuracyThreshold = activityType === 'drive' ? 35 : 22;
  if (accuracy > maxAccuracyThreshold || accuracy <= 0) {
    return {
      filteredPoint: raw,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: `Accuracy too low (${Math.round(accuracy)}m > ${maxAccuracyThreshold}m)`
    };
  }

  // First valid point initialization
  if (state.variance < 0 || !state.lastAcceptedPoint) {
    state.lat = raw.latitude;
    state.lng = raw.longitude;
    state.variance = Math.pow(accuracy / METERS_PER_DEGREE_LAT, 2);
    state.lastTimestamp = raw.timestamp;
    state.lastAcceptedPoint = raw;
    state.points.push(raw);

    return {
      filteredPoint: raw,
      accepted: true,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0
    };
  }

  // Time delta in seconds
  const dtSeconds = Math.max(0.1, (raw.timestamp - state.lastTimestamp) / 1000);
  state.lastTimestamp = raw.timestamp;

  // 2. 2D Position Kalman Filter
  // Process noise (Q): assumed movement variance based on duration
  const qMetersPerSec = activityType === 'cycle' ? 6.0 : activityType === 'run' ? 3.5 : 1.5;
  const qDegrees = (qMetersPerSec * dtSeconds) / METERS_PER_DEGREE_LAT;
  const processVariance = qDegrees * qDegrees;

  // Predict
  state.variance += processVariance;

  // Measurement variance (R) from current GPS accuracy
  const measurementVariance = Math.pow(accuracy / METERS_PER_DEGREE_LAT, 2);

  // Kalman Gain (K)
  const k = state.variance / (state.variance + measurementVariance);

  // Update filtered position
  state.lat += k * (raw.latitude - state.lat);
  state.lng += k * (raw.longitude - state.lng);
  state.variance = (1 - k) * state.variance;

  const smoothedPoint: GpsFilterPoint = {
    latitude: Number(state.lat.toFixed(7)),
    longitude: Number(state.lng.toFixed(7)),
    altitude: raw.altitude,
    accuracy: Math.round(Math.sqrt(state.variance) * METERS_PER_DEGREE_LAT),
    speed: raw.speed,
    timestamp: raw.timestamp
  };

  // Distance from last accepted point
  const last = state.lastAcceptedPoint;
  const deltaKm = calculateHaversineKm(
    last.latitude,
    last.longitude,
    smoothedPoint.latitude,
    smoothedPoint.longitude
  );
  const deltaMeters = deltaKm * 1000;

  // Physical Speed in km/h (Prefer device Doppler hardware sensor if available)
  const physicalSpeedKmh =
    raw.speed !== undefined && raw.speed !== null && raw.speed >= 0
      ? Number((raw.speed * 3.6).toFixed(1))
      : Number((deltaKm / (dtSeconds / 3600)).toFixed(1));

  // 3. Physical Speed Bounds Gate (Reject teleport glitches)
  const maxSpeedKmh = getMaxAllowableSpeedKmh(activityType);
  if (physicalSpeedKmh > maxSpeedKmh) {
    return {
      filteredPoint: smoothedPoint,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: `Speed anomaly (${physicalSpeedKmh.toFixed(1)} km/h > ${maxSpeedKmh} km/h)`
    };
  }

  // 4. Stationary Noise Gate
  // When stationary, GPS points bounce within the accuracy bubble (3-12m).
  // If moving speed < 0.55 m/s (2.0 km/h) or distance is within accuracy threshold, ignore delta.
  const isMoving =
    (raw.speed !== undefined && raw.speed !== null && raw.speed >= 0
      ? raw.speed
      : deltaMeters / dtSeconds) > 0.55;

  const minimumMoveThresholdMeters = Math.max(3.5, accuracy * 0.45);

  if (deltaMeters < minimumMoveThresholdMeters || !isMoving) {
    // Stationary or micro-jitter: do not accumulate false distance, set speed to 0
    return {
      filteredPoint: smoothedPoint,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: 'Stationary / Micro-jitter filtered'
    };
  }

  // Legitimate movement detected!
  state.totalDistanceKm = Number((state.totalDistanceKm + deltaKm).toFixed(4));
  state.lastAcceptedPoint = smoothedPoint;
  state.points.push(smoothedPoint);

  return {
    filteredPoint: smoothedPoint,
    accepted: true,
    deltaDistanceKm: deltaKm,
    calculatedSpeedKmh: physicalSpeedKmh
  };
}
