/**
 * Activity Route Intelligence & Performance Tracking Models
 * Strict TypeScript contracts for Route Intelligence, GPS Quality,
 * Geometry Subcollections, Processing Jobs, and Trail Video.
 */

export type ActivitySource =
  | 'STRAVA'
  | 'GOOGLE_FIT'
  | 'DEVICE'
  | 'GPX_IMPORT'
  | 'FIT_IMPORT'
  | 'MANUAL';

export type RouteSportType =
  | 'RUN'
  | 'WALK'
  | 'RIDE'
  | 'HIKE'
  | 'TRAIL_RUN'
  | 'ROAD_TRIP'
  | 'TRACK_WORKOUT'
  | 'TREADMILL'
  | 'CALISTHENICS'
  | 'FOOTBALL'
  | 'OTHER';

export type PrivacyLevel = 'PRIVATE' | 'FOLLOWERS' | 'PUBLIC';

export type RouteRenderMode = 'RAW' | 'CLEANED' | 'MATCHED' | 'NO_MAP';

export type GeometryKind = 'RAW' | 'CLEANED' | 'MATCHED' | 'SIMPLIFIED' | 'VIDEO';

export type MatchProvider = 'NONE' | 'VALHALLA' | 'PASSTHROUGH';

export type ProcessingJobType =
  | 'NORMALIZE'
  | 'QUALITY_ANALYSIS'
  | 'MAP_MATCH'
  | 'THUMBNAIL'
  | 'VIDEO';

export type ProcessingJobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export type TrailVideoTemplate = 'SIGNATURE_TRAIL_REPLAY';

export type TrailVideoAspectRatio = '9_16' | '1_1' | '16_9';

export type TrailVideoStatus = 'READY' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface GpsPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number; // Unix ms
  speed?: number; // m/s or km/h
  accuracy?: number; // horizontal accuracy in meters
  bearing?: number; // degrees
}

export interface ActivitySplitMetric {
  splitNumber: number;
  distanceLabel: string; // e.g. "1.0 km"
  distanceMeters: number;
  durationSeconds: number;
  paceMinKm: string; // e.g. "4:48 /km"
  speedKmh: number;
  elevationDeltaMeters: number;
  isFastestSplit?: boolean;
}

export type GpsQualityGrade = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface GpsQualityReport {
  totalPoints: number;
  acceptedPoints: number;
  rejectedPoints: number;
  accuracyViolations: number;
  speedJumpViolations: number;
  stationaryDriftCount: number;
  gapCount: number;
  qualityGrade: GpsQualityGrade;
  qualityScore: number; // 0 - 100
  isEligibleForMapMatching: boolean;
  shouldRenderMap: boolean;
  isIndoorOrStationary: boolean;
  rejectionReasons: string[];
}

export type GeoJsonCoordinate = [number, number, number?];

export interface ActivityDocument {
  id: string;
  userId: string;
  source: ActivitySource;
  sourceActivityId?: string;
  sportType: RouteSportType;
  title: string;
  startedAt: number; // Unix ms
  endedAt: number; // Unix ms
  elapsedTimeSeconds: number;
  movingTimeSeconds: number;
  distanceMeters: number;
  elevationGainMeters: number;
  calories: number;
  averagePaceSecondsPerKm: number;
  averagePaceString: string;
  averageSpeedMps: number;
  averageSpeedKmh: number;
  maxSpeedKmh?: number;
  privacyLevel: PrivacyLevel;
  routeRenderMode: RouteRenderMode;
  rawGeometryId?: string;
  cleanedGeometryId?: string;
  matchedGeometryId?: string;
  simplifiedGeometryId?: string;
  videoGeometryId?: string;
  processingStatus: ProcessingJobStatus;
  qualityReport?: GpsQualityReport;
  splits: ActivitySplitMetric[];
  recordBadges?: any[];
  notes?: string;
  mediaUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RouteGeometryDocument {
  id: string;
  activityId: string;
  geometryKind: GeometryKind;
  encoding: 'POLYLINE6' | 'GEOJSON';
  compactGeometry: string; // Encoded polyline or JSON string of coordinates [[lng, lat]]
  pointCount: number;
  distanceMeters: number;
  matchProvider: MatchProvider;
  matchConfidence?: number; // 0.0 - 1.0
  processingVersion: string;
  segments?: GeoJsonCoordinate[][]; // MultiLineString support for routes with gaps
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ProcessingJobDocument {
  id: string;
  activityId: string;
  jobType: ProcessingJobType;
  status: ProcessingJobStatus;
  errorMessage?: string;
  attempts: number;
  metadata?: Record<string, any>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TrailVideoDocument {
  id: string;
  activityId: string;
  template: TrailVideoTemplate;
  aspectRatio: TrailVideoAspectRatio;
  status: TrailVideoStatus;
  storagePath?: string;
  downloadUrl?: string;
  thumbnailStoragePath?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface VideoGeometryPoint {
  coordinate: [number, number]; // [lng, lat] GeoJSON convention
  cumulativeDistanceMeters: number;
  normalizedProgress: number; // 0.0 to 1.0
  timestamp: number;
  elevation?: number;
}

export interface VideoRenderPayload {
  activityId: string;
  title: string;
  athleteName: string;
  dateString: string;
  sportType: RouteSportType;
  totalDistanceKm: number;
  movingTimeFormatted: string;
  averagePaceFormatted: string;
  elevationGainMeters: number;
  progressPoints: VideoGeometryPoint[];
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  privacyRedacted: boolean;
  templateConfig: {
    template: TrailVideoTemplate;
    aspectRatio: TrailVideoAspectRatio;
    width: number;
    height: number;
    fps: number;
    durationSeconds: number;
  };
}
