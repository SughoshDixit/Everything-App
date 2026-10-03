/**
 * Battery-Conscious Location Tracking Provider Abstraction
 * Manages live GPS recording with configurable sample intervals, accuracy gates,
 * distance displacement filtering, and local buffering to prevent battery drain
 * and UI freezing.
 */

import type { GpsPoint, RouteSportType } from '../../types/routeIntelligence';
import { ROUTE_INTELLIGENCE_CONFIG } from './routeConfig';
import { ActivityRouteQualityService } from './routeQualityService';

export interface LocationTrackingConfig {
  sampleIntervalMs: number;
  minDisplacementMeters: number;
  accuracyThresholdMeters: number;
  batchSyncSize: number;
  highAccuracy: boolean;
}

export interface TrackingStatus {
  isTracking: boolean;
  isPaused: boolean;
  pointCount: number;
  acceptedCount: number;
  currentAccuracy?: number;
  currentSpeedMps?: number;
  elapsedSeconds: number;
  distanceMeters: number;
  batteryOptimized: boolean;
}

export type LocationUpdateListener = (point: GpsPoint, status: TrackingStatus) => void;

export class LocationTrackingProvider {
  private static instance: LocationTrackingProvider;

  // Sport-specific balanced configurations for battery vs fidelity
  private static readonly DEFAULT_CONFIGS: Record<RouteSportType, LocationTrackingConfig> = {
    RUN: {
      sampleIntervalMs: 3000, // 3 seconds
      minDisplacementMeters: 2.5,
      accuracyThresholdMeters: 35.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    WALK: {
      sampleIntervalMs: 4000, // 4 seconds
      minDisplacementMeters: 2.0,
      accuracyThresholdMeters: 35.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    RIDE: {
      sampleIntervalMs: 2500, // 2.5 seconds
      minDisplacementMeters: 4.0,
      accuracyThresholdMeters: 40.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    HIKE: {
      sampleIntervalMs: 5000, // 5 seconds (trail battery saving)
      minDisplacementMeters: 3.0,
      accuracyThresholdMeters: 35.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    TRAIL_RUN: {
      sampleIntervalMs: 3000,
      minDisplacementMeters: 2.5,
      accuracyThresholdMeters: 35.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    ROAD_TRIP: {
      sampleIntervalMs: 3000,
      minDisplacementMeters: 8.0,
      accuracyThresholdMeters: 50.0,
      batchSyncSize: 50,
      highAccuracy: true
    },
    TRACK_WORKOUT: {
      sampleIntervalMs: 2000, // 2 seconds
      minDisplacementMeters: 2.0,
      accuracyThresholdMeters: 25.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    FOOTBALL: {
      sampleIntervalMs: 2000,
      minDisplacementMeters: 1.5,
      accuracyThresholdMeters: 25.0,
      batchSyncSize: 30,
      highAccuracy: true
    },
    TREADMILL: {
      sampleIntervalMs: 10000,
      minDisplacementMeters: 0,
      accuracyThresholdMeters: 100,
      batchSyncSize: 10,
      highAccuracy: false
    },
    CALISTHENICS: {
      sampleIntervalMs: 10000,
      minDisplacementMeters: 0,
      accuracyThresholdMeters: 100,
      batchSyncSize: 10,
      highAccuracy: false
    },
    OTHER: {
      sampleIntervalMs: 3500,
      minDisplacementMeters: 3.0,
      accuracyThresholdMeters: 35.0,
      batchSyncSize: 30,
      highAccuracy: true
    }
  };

  private currentSport: RouteSportType = 'RUN';
  private config: LocationTrackingConfig = LocationTrackingProvider.DEFAULT_CONFIGS.RUN;
  private isTracking = false;
  private isPaused = false;
  private startTime = 0;
  private accumulatedDistanceMeters = 0;
  private pointsBuffer: GpsPoint[] = [];
  private lastAcceptedPoint: GpsPoint | null = null;
  private listeners: Set<LocationUpdateListener> = new Set();
  private watchId: number | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  public static getInstance(): LocationTrackingProvider {
    if (!LocationTrackingProvider.instance) {
      LocationTrackingProvider.instance = new LocationTrackingProvider();
    }
    return LocationTrackingProvider.instance;
  }

  /**
   * Starts battery-conscious recording for a given sport.
   */
  public start(sportType: RouteSportType = 'RUN'): void {
    if (this.isTracking) return;

    this.currentSport = sportType;
    this.config = LocationTrackingProvider.DEFAULT_CONFIGS[sportType] || LocationTrackingProvider.DEFAULT_CONFIGS.RUN;
    this.isTracking = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.accumulatedDistanceMeters = 0;
    this.pointsBuffer = [];
    this.lastAcceptedPoint = null;

    // 1. Android Native Bridge integration (Starts Android Foreground Service)
    if (typeof window !== 'undefined' && window.AndroidBridge?.startLocationTracking) {
      try {
        const nativeType = sportType === 'RIDE' ? 'cycle' : sportType === 'WALK' ? 'walk' : 'run';
        window.AndroidBridge.startLocationTracking(nativeType);

        // Native update callback
        window.onNativeGpsUpdate = (pos: any) => {
          this.ingestRawCoordinate({
            latitude: pos.latitude,
            longitude: pos.longitude,
            altitude: pos.altitude,
            speed: pos.speed,
            accuracy: pos.accuracy ?? 5,
            timestamp: pos.timestamp || Date.now()
          });
        };

        // Periodic drain of any buffered points from native service
        this.pollIntervalId = setInterval(() => {
          this.drainNativeBuffer();
        }, this.config.sampleIntervalMs);
      } catch (e) {
        console.warn('Native tracking start failed, falling back to browser geolocation', e);
        this.startBrowserGeolocation();
      }
    } else {
      this.startBrowserGeolocation();
    }
  }

  /**
   * Pauses the current activity without stopping the session.
   */
  public pause(): void {
    this.isPaused = true;
  }

  /**
   * Resumes a paused session.
   */
  public resume(): void {
    this.isPaused = false;
  }

  /**
   * Stops tracking and immediately turns off GPS to conserve battery.
   */
  public stop(): GpsPoint[] {
    this.isTracking = false;
    this.isPaused = false;

    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Stop Native Foreground Service
    if (typeof window !== 'undefined' && window.AndroidBridge?.stopLocationTracking) {
      try {
        const rawJson = window.AndroidBridge.stopLocationTracking();
        if (typeof rawJson === 'string' && rawJson.length > 0) {
          const remaining: any[] = JSON.parse(rawJson);
          remaining.forEach((p) => {
            this.ingestRawCoordinate({
              latitude: p.latitude,
              longitude: p.longitude,
              altitude: p.altitude,
              speed: p.speed,
              accuracy: p.accuracy ?? 5,
              timestamp: p.timestamp || Date.now()
            });
          });
        }
      } catch (e) {
        console.warn('Error stopping native location tracking', e);
      }
    }

    return [...this.pointsBuffer];
  }

  public getCurrentSport(): RouteSportType {
    return this.currentSport;
  }

  public subscribe(listener: LocationUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStatus(): TrackingStatus {
    const elapsedSeconds = this.startTime > 0 ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    return {
      isTracking: this.isTracking,
      isPaused: this.isPaused,
      pointCount: this.pointsBuffer.length,
      acceptedCount: this.pointsBuffer.length,
      currentAccuracy: this.lastAcceptedPoint?.accuracy,
      currentSpeedMps: this.lastAcceptedPoint?.speed,
      elapsedSeconds,
      distanceMeters: Math.round(this.accumulatedDistanceMeters),
      batteryOptimized: true
    };
  }

  public getRecordedPoints(): GpsPoint[] {
    return [...this.pointsBuffer];
  }

  private drainNativeBuffer(): void {
    if (!this.isTracking || this.isPaused) return;
    if (typeof window !== 'undefined' && window.AndroidBridge?.getBufferedGpsPoints) {
      try {
        const rawJson = window.AndroidBridge.getBufferedGpsPoints();
        if (!rawJson) return;
        const pts: any[] = JSON.parse(rawJson);
        if (Array.isArray(pts) && pts.length > 0) {
          pts.forEach((p) => {
            this.ingestRawCoordinate({
              latitude: p.latitude,
              longitude: p.longitude,
              altitude: p.altitude,
              speed: p.speed,
              accuracy: p.accuracy ?? 5,
              timestamp: p.timestamp || Date.now()
            });
          });
        }
      } catch (e) {
        console.warn('Failed draining native GPS buffer:', e);
      }
    }
  }

  private startBrowserGeolocation(): void {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.ingestRawCoordinate({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude || undefined,
          speed: pos.coords.speed || undefined,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        });
      },
      (err) => console.warn('Geolocation watch error:', err.message),
      {
        enableHighAccuracy: this.config.highAccuracy,
        maximumAge: 2000,
        timeout: 10000
      }
    );
  }

  private ingestRawCoordinate(point: GpsPoint): void {
    if (!this.isTracking || this.isPaused) return;

    // 1. Accuracy gate (> threshold dropped)
    if (point.accuracy !== undefined && point.accuracy > this.config.accuracyThresholdMeters) {
      return;
    }

    // 2. Stationary / Displacement filter
    if (this.lastAcceptedPoint) {
      const dist = ActivityRouteQualityService.haversineMeters(
        this.lastAcceptedPoint.latitude,
        this.lastAcceptedPoint.longitude,
        point.latitude,
        point.longitude
      );

      const dt = Math.max(0.1, (point.timestamp - this.lastAcceptedPoint.timestamp) / 1000);
      const speed = dist / dt;

      // Reject stationary noise to prevent 4x distance inflation
      if (dist < this.config.minDisplacementMeters && speed < ROUTE_INTELLIGENCE_CONFIG.MIN_STATIONARY_SPEED_MPS) {
        return;
      }

      this.accumulatedDistanceMeters += dist;
    }

    this.lastAcceptedPoint = point;
    this.pointsBuffer.push(point);

    const status = this.getStatus();
    this.listeners.forEach((fn) => fn(point, status));
  }
}
