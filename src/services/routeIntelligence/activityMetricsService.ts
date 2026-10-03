/**
 * Activity Metrics Service
 * Computes exact geodesic distance, moving vs elapsed time, sport-specific pace/speed,
 * 1.0 km kilometre splits, and smoothed elevation gain from accepted GPS points.
 */

import { ActivityRouteQualityService } from './routeQualityService';
import { ROUTE_INTELLIGENCE_CONFIG } from './routeConfig';
import type {
  GpsPoint,
  ActivitySplitMetric,
  RouteSportType
} from '../../types/routeIntelligence';

export interface ComputedActivityMetrics {
  distanceMeters: number;
  distanceKm: number;
  elapsedTimeSeconds: number;
  movingTimeSeconds: number;
  averagePaceSecondsPerKm: number;
  averagePaceString: string;
  averageSpeedMps: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  elevationGainMeters: number;
  splits: ActivitySplitMetric[];
  fastestSplit?: ActivitySplitMetric;
}

export class ActivityMetricsService {
  /**
   * Formats seconds per km into traditional runner's pace: mm:ss /km
   */
  public static formatPace(secondsPerKm: number): string {
    if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0 || secondsPerKm > 3600) {
      return '--:-- /km';
    }
    const mins = Math.floor(secondsPerKm / 60);
    const secs = Math.round(secondsPerKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
  }

  /**
   * Formats elapsed/moving duration in seconds to hh:mm:ss or mm:ss
   */
  public static formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  /**
   * Computes accurate physical metrics from an array of accepted GPS points.
   */
  public static computeMetrics(
    points: GpsPoint[],
    _sportType: RouteSportType,
    fallbackElapsedSeconds?: number
  ): ComputedActivityMetrics {
    if (points.length < 2) {
      const elapsed = fallbackElapsedSeconds || 0;
      return {
        distanceMeters: 0,
        distanceKm: 0,
        elapsedTimeSeconds: elapsed,
        movingTimeSeconds: elapsed,
        averagePaceSecondsPerKm: 0,
        averagePaceString: '--:-- /km',
        averageSpeedMps: 0,
        averageSpeedKmh: 0,
        maxSpeedKmh: 0,
        elevationGainMeters: 0,
        splits: []
      };
    }

    let totalDistanceMeters = 0;
    let movingTimeSeconds = 0;
    let maxSpeedMps = 0;

    // Splits tracking
    const splits: ActivitySplitMetric[] = [];
    let currentSplitMeters = 0;
    let currentSplitDuration = 0;
    let currentSplitElevationDelta = 0;
    let currentSplitNumber = 1;

    // Elevation tracking with 5-point moving window
    const rawAltitudes: number[] = [];
    let totalElevationGain = 0;

    const startTime = points[0].timestamp;
    const endTime = points[points.length - 1].timestamp;
    const rawElapsedSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
    const elapsedTimeSeconds = fallbackElapsedSeconds || rawElapsedSeconds;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      const dt = Math.max(0.1, (curr.timestamp - prev.timestamp) / 1000);
      const stepDistance = ActivityRouteQualityService.haversineMeters(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );

      // Collect altitudes for smoothing
      if (curr.altitude !== undefined) {
        rawAltitudes.push(curr.altitude);
      }

      // Detect moving state vs pause
      const speed = stepDistance / dt;
      if (speed > maxSpeedMps) {
        maxSpeedMps = speed;
      }

      const isMoving =
        speed >= ROUTE_INTELLIGENCE_CONFIG.MIN_STATIONARY_SPEED_MPS &&
        stepDistance >= ROUTE_INTELLIGENCE_CONFIG.MIN_DISPLACEMENT_METERS;

      if (isMoving) {
        totalDistanceMeters += stepDistance;
        movingTimeSeconds += dt;

        currentSplitMeters += stepDistance;
        currentSplitDuration += dt;

        if (curr.altitude !== undefined && prev.altitude !== undefined) {
          const altDiff = curr.altitude - prev.altitude;
          currentSplitElevationDelta += altDiff;
        }

        // 1.0 km Split Trigger
        if (currentSplitMeters >= 1000) {
          const splitPaceSec = (currentSplitDuration / currentSplitMeters) * 1000;
          const splitSpeed = (currentSplitMeters / currentSplitDuration) * 3.6;

          splits.push({
            splitNumber: currentSplitNumber,
            distanceLabel: `${currentSplitNumber}.0 km`,
            distanceMeters: Math.round(currentSplitMeters),
            durationSeconds: Math.round(currentSplitDuration),
            paceMinKm: this.formatPace(splitPaceSec),
            speedKmh: Math.round(splitSpeed * 10) / 10,
            elevationDeltaMeters: Math.round(currentSplitElevationDelta)
          });

          currentSplitNumber++;
          currentSplitMeters = 0;
          currentSplitDuration = 0;
          currentSplitElevationDelta = 0;
        }
      }
    }

    // Final partial split if > 100 meters remaining
    if (currentSplitMeters > 100 && currentSplitDuration > 5) {
      const splitPaceSec = (currentSplitDuration / currentSplitMeters) * 1000;
      const splitSpeed = (currentSplitMeters / currentSplitDuration) * 3.6;
      const partialKm = (totalDistanceMeters / 1000).toFixed(2);

      splits.push({
        splitNumber: currentSplitNumber,
        distanceLabel: `${partialKm} km`,
        distanceMeters: Math.round(currentSplitMeters),
        durationSeconds: Math.round(currentSplitDuration),
        paceMinKm: this.formatPace(splitPaceSec),
        speedKmh: Math.round(splitSpeed * 10) / 10,
        elevationDeltaMeters: Math.round(currentSplitElevationDelta)
      });
    }

    // Identify fastest split
    let fastestSplit: ActivitySplitMetric | undefined;
    if (splits.length > 0) {
      let minPaceSeconds = Infinity;
      for (const sp of splits) {
        // Parse "M:SS /km"
        const match = sp.paceMinKm.match(/(\d+):(\d+)/);
        if (match) {
          const sec = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
          if (sec < minPaceSeconds && sp.distanceMeters >= 500) {
            minPaceSeconds = sec;
            fastestSplit = sp;
          }
        }
      }
      if (fastestSplit) {
        fastestSplit.isFastestSplit = true;
      }
    }

    // Smooth elevation gain with 5-point moving window
    if (rawAltitudes.length >= 5) {
      const smoothedAlt: number[] = [];
      const windowSize = 5;
      for (let i = 0; i <= rawAltitudes.length - windowSize; i++) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          sum += rawAltitudes[i + j];
        }
        smoothedAlt.push(sum / windowSize);
      }

      for (let i = 1; i < smoothedAlt.length; i++) {
        const delta = smoothedAlt[i] - smoothedAlt[i - 1];
        if (delta > 0.4) {
          // ignore small barometric tremors
          totalElevationGain += delta;
        }
      }
    }

    const effectiveMovingTime = Math.max(1, Math.round(movingTimeSeconds));
    const distanceKm = totalDistanceMeters / 1000;
    const avgSpeedMps = totalDistanceMeters / effectiveMovingTime;
    const averageSpeedKmh = Math.round(avgSpeedMps * 3.6 * 100) / 100;
    const avgPaceSec = totalDistanceMeters > 50 ? (effectiveMovingTime / totalDistanceMeters) * 1000 : 0;
    const averagePaceString = this.formatPace(avgPaceSec);
    const maxSpeedKmh = Math.round(maxSpeedMps * 3.6 * 10) / 10;

    return {
      distanceMeters: Math.round(totalDistanceMeters),
      distanceKm: Math.round(distanceKm * 100) / 100,
      elapsedTimeSeconds,
      movingTimeSeconds: effectiveMovingTime,
      averagePaceSecondsPerKm: Math.round(avgPaceSec),
      averagePaceString,
      averageSpeedMps: Math.round(avgSpeedMps * 100) / 100,
      averageSpeedKmh,
      maxSpeedKmh,
      elevationGainMeters: Math.round(totalElevationGain),
      splits,
      fastestSplit
    };
  }
}
