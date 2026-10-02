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

  // 1. Accuracy Gate: Drop noisy fixes with wide error margins
  const maxAccuracyThreshold = activityType === 'drive' ? 30 : 16;
  if (accuracy > maxAccuracyThreshold || accuracy <= 0) {
    return {
      filteredPoint: raw,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: `Accuracy too low (${Math.round(accuracy)}m > ${maxAccuracyThreshold}m)`
    };
  }

  // Deduplicate points with identical or backwards timestamps
  if (state.lastTimestamp > 0 && raw.timestamp <= state.lastTimestamp) {
    return {
      filteredPoint: raw,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: 'Duplicate timestamp'
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
  const qMetersPerSec = activityType === 'cycle' ? 5.0 : activityType === 'run' ? 3.0 : 1.2;
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
  const rawGeodesicKm = calculateHaversineKm(
    last.latitude,
    last.longitude,
    smoothedPoint.latitude,
    smoothedPoint.longitude
  );
  const rawGeodesicMeters = rawGeodesicKm * 1000;

  // Has valid Doppler hardware velocity?
  const hasHardwareSpeed = raw.speed !== undefined && raw.speed !== null && raw.speed >= 0;
  const dopplerSpeedMs = hasHardwareSpeed ? raw.speed! : -1;
  const physicalSpeedKmh = hasHardwareSpeed
    ? Number((dopplerSpeedMs * 3.6).toFixed(1))
    : Number((rawGeodesicKm / (dtSeconds / 3600)).toFixed(1));

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

  // 4. Stationary Drift Gate
  // When stationary or walking < 0.65 m/s (~2.3 km/h), do NOT accumulate false distance
  if (hasHardwareSpeed && dopplerSpeedMs < 0.65) {
    return {
      filteredPoint: smoothedPoint,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: 'Stationary / Doppler zero-clamp'
    };
  }

  // Minimum physical movement threshold
  const minMoveMeters = hasHardwareSpeed
    ? Math.max(1.0, dopplerSpeedMs * dtSeconds * 0.4)
    : Math.max(2.5, accuracy * 0.35);

  if (rawGeodesicMeters < minMoveMeters) {
    return {
      filteredPoint: smoothedPoint,
      accepted: false,
      deltaDistanceKm: 0,
      calculatedSpeedKmh: 0,
      rejectionReason: 'Micro-displacement threshold'
    };
  }

  // 5. Doppler Speed-Bounded Distance Integration
  // When Doppler velocity is available, bound step distance to physical max (speed * dt * 1.3)
  // This completely stops GPS position jitter from multiplying distance by 4x!
  let trueStepMeters = rawGeodesicMeters;
  if (hasHardwareSpeed && dopplerSpeedMs > 0) {
    const dopplerMaxMeters = dopplerSpeedMs * dtSeconds * 1.3 + 0.4;
    trueStepMeters = Math.min(rawGeodesicMeters, dopplerMaxMeters);
  }

  const effectiveDeltaKm = trueStepMeters / 1000;

  // Legitimate movement detected and accurately measured!
  state.totalDistanceKm = Number((state.totalDistanceKm + effectiveDeltaKm).toFixed(4));
  state.lastAcceptedPoint = smoothedPoint;
  state.points.push(smoothedPoint);

  return {
    filteredPoint: smoothedPoint,
    accepted: true,
    deltaDistanceKm: effectiveDeltaKm,
    calculatedSpeedKmh: physicalSpeedKmh
  };
}
