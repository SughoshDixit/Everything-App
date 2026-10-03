/**
 * Activity Route Quality Service
 * Evaluates raw GPS point series for horizontal accuracy, physical speed bounds,
 * stationary jitter, and temporal discontinuities without corrupting source data.
 */

import { ROUTE_INTELLIGENCE_CONFIG } from './routeConfig';
import type {
  GpsPoint,
  GpsQualityReport,
  GpsQualityGrade,
  RouteSportType
} from '../../types/routeIntelligence';

export class ActivityRouteQualityService {
  /**
   * Computes great-circle distance between two coordinates in meters (Haversine formula).
   */
  public static haversineMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
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
   * Performs rigorous GPS quality analysis on a chronological point stream.
   * Returns a comprehensive quality report and indices of accepted vs rejected points.
   */
  public static analyzeQuality(
    points: GpsPoint[],
    sportType: RouteSportType
  ): {
    report: GpsQualityReport;
    acceptedIndices: Set<number>;
    gapIndices: Set<number>;
  } {
    const totalPoints = points.length;
    const acceptedIndices = new Set<number>();
    const gapIndices = new Set<number>();
    const rejectionReasons: string[] = [];

    if (totalPoints === 0) {
      return {
        report: {
          totalPoints: 0,
          acceptedPoints: 0,
          rejectedPoints: 0,
          accuracyViolations: 0,
          speedJumpViolations: 0,
          stationaryDriftCount: 0,
          gapCount: 0,
          qualityGrade: 'POOR',
          qualityScore: 0,
          isEligibleForMapMatching: false,
          shouldRenderMap: false,
          isIndoorOrStationary: true,
          rejectionReasons: ['No GPS points recorded in activity.']
        },
        acceptedIndices,
        gapIndices
      };
    }

    let accuracyViolations = 0;
    let speedJumpViolations = 0;
    let stationaryDriftCount = 0;
    let duplicateCount = 0;

    const maxSpeedMps =
      ROUTE_INTELLIGENCE_CONFIG.MAX_SPEED_MPS[sportType] ||
      ROUTE_INTELLIGENCE_CONFIG.MAX_SPEED_MPS.RUN;

    // Check overall bounding box to detect indoor or stationary workouts
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    }

    const diagonalSpanMeters = this.haversineMeters(minLat, minLng, maxLat, maxLng);
    const isIndoorOrStationary =
      sportType === 'TREADMILL' ||
      sportType === 'CALISTHENICS' ||
      (totalPoints > 20 && diagonalSpanMeters < 30.0);

    let lastAcceptedPoint: GpsPoint | null = null;

    for (let i = 0; i < points.length; i++) {
      const current = points[i];

      // 1. Horizontal Accuracy Gate
      if (
        current.accuracy !== undefined &&
        current.accuracy > ROUTE_INTELLIGENCE_CONFIG.ACCURACY_THRESHOLD_METERS
      ) {
        accuracyViolations++;
        continue;
      }

      // 2. Duplicate Check
      if (lastAcceptedPoint) {
        const distFromLast = this.haversineMeters(
          lastAcceptedPoint.latitude,
          lastAcceptedPoint.longitude,
          current.latitude,
          current.longitude
        );

        if (
          distFromLast < 0.2 &&
          Math.abs(current.timestamp - lastAcceptedPoint.timestamp) < 1500
        ) {
          duplicateCount++;
          continue;
        }

        const timeDeltaSeconds = Math.max(
          0.1,
          (current.timestamp - lastAcceptedPoint.timestamp) / 1000
        );

        // 3. Gap & Discontinuity Detection
        if (
          timeDeltaSeconds > ROUTE_INTELLIGENCE_CONFIG.SEGMENT_TIME_GAP_SECONDS ||
          distFromLast > ROUTE_INTELLIGENCE_CONFIG.SEGMENT_DISTANCE_JUMP_METERS
        ) {
          gapIndices.add(i);
        }

        // 4. Physical Speed Jump Gate
        const calculatedSpeedMps = distFromLast / timeDeltaSeconds;
        const reportedSpeedMps =
          current.speed !== undefined
            ? current.speed > 50
              ? current.speed / 3.6 // convert km/h to m/s if likely km/h
              : current.speed
            : calculatedSpeedMps;

        // Reject if both calculated and reported speeds violate physical bounds
        if (
          calculatedSpeedMps > maxSpeedMps &&
          distFromLast > 10.0 &&
          timeDeltaSeconds < 10.0
        ) {
          speedJumpViolations++;
          continue;
        }

        // 5. Stationary Jitter Filter
        // When stationary or creeping under 0.5 m/s, ignore displacements under 1.2m
        // to prevent 4x GPS distance inflation while waiting at traffic lights or resting
        if (
          reportedSpeedMps < ROUTE_INTELLIGENCE_CONFIG.MIN_STATIONARY_SPEED_MPS &&
          distFromLast < ROUTE_INTELLIGENCE_CONFIG.MIN_DISPLACEMENT_METERS
        ) {
          stationaryDriftCount++;
          // Still retain point if it's the start of a gap or end of pause, otherwise skip
          if (timeDeltaSeconds < 5.0) {
            continue;
          }
        }
      }

      // Point passed all validation gates
      acceptedIndices.add(i);
      lastAcceptedPoint = current;
    }

    const acceptedPoints = acceptedIndices.size;
    const rejectedPoints = totalPoints - acceptedPoints;
    const gapCount = gapIndices.size;

    // Quality Score Calculation (0 - 100)
    let score = 100;
    if (totalPoints > 0) {
      const accuracyPenalty = (accuracyViolations / totalPoints) * 45;
      const speedJumpPenalty = (speedJumpViolations / totalPoints) * 35;
      const gapPenalty = Math.min(20, gapCount * 4);
      score = Math.max(0, Math.round(100 - accuracyPenalty - speedJumpPenalty - gapPenalty));
    }

    let qualityGrade: GpsQualityGrade = 'POOR';
    if (score >= 85) qualityGrade = 'EXCELLENT';
    else if (score >= 70) qualityGrade = 'GOOD';
    else if (score >= 50) qualityGrade = 'FAIR';

    if (accuracyViolations > 0) {
      rejectionReasons.push(
        `${accuracyViolations} points exceeded horizontal accuracy threshold (${ROUTE_INTELLIGENCE_CONFIG.ACCURACY_THRESHOLD_METERS}m).`
      );
    }
    if (speedJumpViolations > 0) {
      rejectionReasons.push(
        `${speedJumpViolations} points exceeded max plausible velocity for ${sportType} (${maxSpeedMps.toFixed(1)} m/s).`
      );
    }
    if (duplicateCount > 0) {
      rejectionReasons.push(`${duplicateCount} duplicate consecutive points filtered.`);
    }
    if (stationaryDriftCount > 0) {
      rejectionReasons.push(
        `${stationaryDriftCount} stationary jitter fixes excluded to protect distance accuracy.`
      );
    }
    if (gapCount > 0) {
      rejectionReasons.push(`${gapCount} route discontinuities / pauses detected.`);
    }

    const shouldRenderMap =
      !isIndoorOrStationary &&
      acceptedPoints >= ROUTE_INTELLIGENCE_CONFIG.MIN_POINTS_FOR_MAP;

    const isEligibleForMapMatching =
      shouldRenderMap &&
      qualityGrade !== 'POOR' &&
      sportType !== 'TRACK_WORKOUT' &&
      acceptedPoints >= 10;

    const report: GpsQualityReport = {
      totalPoints,
      acceptedPoints,
      rejectedPoints,
      accuracyViolations,
      speedJumpViolations,
      stationaryDriftCount,
      gapCount,
      qualityGrade,
      qualityScore: score,
      isEligibleForMapMatching,
      shouldRenderMap,
      isIndoorOrStationary,
      rejectionReasons
    };

    return {
      report,
      acceptedIndices,
      gapIndices
    };
  }
}
