/**
 * Activity Route Processing Service
 * Logical Pipeline:
 * Raw Activity Data -> Normalization -> GPS Quality Analysis ->
 * Segment Detection -> Cleaned Geometry -> Simplified Geometry -> Video Geometry
 *
 * RAW GPS IS IMMUTABLY PRESERVED AS SOURCE OF TRUTH.
 */

import { ROUTE_INTELLIGENCE_CONFIG } from './routeConfig';
import { ActivityRouteQualityService } from './routeQualityService';
import { ActivityMetricsService } from './activityMetricsService';
import type {
  ActivityDocument,
  ActivitySource,
  GpsPoint,
  GeoJsonCoordinate,
  RouteGeometryDocument,
  RouteSportType,
  VideoGeometryPoint,
  VideoRenderPayload,
  PrivacyLevel
} from '../../types/routeIntelligence';

export interface RouteProcessingResult {
  activity: ActivityDocument;
  geometries: {
    raw: RouteGeometryDocument;
    cleaned: RouteGeometryDocument;
    simplified: RouteGeometryDocument;
    video: RouteGeometryDocument;
  };
  videoPayload?: VideoRenderPayload;
}

export class ActivityRouteProcessingService {
  /**
   * Decodes Google encoded polyline (precision 5 or 6) into GpsPoint array.
   */
  public static decodePolyline(str: string, precision = 5): GpsPoint[] {
    const factor = Math.pow(10, precision);
    let index = 0;
    let lat = 0;
    let lng = 0;
    const points: GpsPoint[] = [];

    while (index < str.length) {
      let b: number;
      let shift = 0;
      let result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / factor,
        longitude: lng / factor,
        timestamp: Date.now() - (str.length - index) * 1000
      });
    }

    return points;
  }

  /**
   * Encodes coordinate points into a compact polyline string (default precision 6).
   */
  public static encodePolyline(points: { latitude: number; longitude: number }[], precision = 6): string {
    const factor = Math.pow(10, precision);
    let output = '';
    let lastLat = 0;
    let lastLng = 0;

    for (const p of points) {
      const lat = Math.round(p.latitude * factor);
      const lng = Math.round(p.longitude * factor);

      output += this.encodeValue(lat - lastLat);
      output += this.encodeValue(lng - lastLng);

      lastLat = lat;
      lastLng = lng;
    }

    return output;
  }

  private static encodeValue(val: number): string {
    let num = val < 0 ? ~(val << 1) : val << 1;
    let str = '';
    while (num >= 0x20) {
      str += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
      num >>= 5;
    }
    str += String.fromCharCode(num + 63);
    return str;
  }

  /**
   * Performs Douglas-Peucker simplification on coordinates to reduce DOM/WebGL payload
   * while strictly preserving road/trail turns and loops.
   */
  public static simplifyCoordinates(
    coords: [number, number][],
    tolerance = ROUTE_INTELLIGENCE_CONFIG.SIMPLIFICATION_EPSILON_DEGREES
  ): [number, number][] {
    if (coords.length <= 2) return coords;

    const sqTolerance = tolerance * tolerance;
    let maxSqDist = 0;
    let index = 0;

    const [firstLng, firstLat] = coords[0];
    const [lastLng, lastLat] = coords[coords.length - 1];

    for (let i = 1; i < coords.length - 1; i++) {
      const [currLng, currLat] = coords[i];
      const sqDist = this.getSqSegmentDistance(
        currLng,
        currLat,
        firstLng,
        firstLat,
        lastLng,
        lastLat
      );
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      const left = this.simplifyCoordinates(coords.slice(0, index + 1), tolerance);
      const right = this.simplifyCoordinates(coords.slice(index), tolerance);
      return left.slice(0, -1).concat(right);
    }

    return [coords[0], coords[coords.length - 1]];
  }

  private static getSqSegmentDistance(
    pLng: number,
    pLat: number,
    aLng: number,
    aLat: number,
    bLng: number,
    bLat: number
  ): number {
    let x = aLng;
    let y = aLat;
    let dx = bLng - x;
    let dy = bLat - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((pLng - x) * dx + (pLat - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = bLng;
        y = bLat;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = pLng - x;
    dy = pLat - y;
    return dx * dx + dy * dy;
  }

  /**
   * Applies privacy zone redaction by trimming coordinates within the specified radius
   * from the start and end of the activity.
   */
  public static applyPrivacyTrimming(
    points: GpsPoint[],
    radiusMeters = ROUTE_INTELLIGENCE_CONFIG.PRIVACY_ZONE_DEFAULT_RADIUS_METERS
  ): GpsPoint[] {
    if (points.length < 5) return points;

    const start = points[0];
    const end = points[points.length - 1];

    let firstSafeIndex = 0;
    for (let i = 0; i < points.length; i++) {
      const d = ActivityRouteQualityService.haversineMeters(
        start.latitude,
        start.longitude,
        points[i].latitude,
        points[i].longitude
      );
      if (d >= radiusMeters) {
        firstSafeIndex = i;
        break;
      }
    }

    let lastSafeIndex = points.length - 1;
    for (let i = points.length - 1; i >= 0; i--) {
      const d = ActivityRouteQualityService.haversineMeters(
        end.latitude,
        end.longitude,
        points[i].latitude,
        points[i].longitude
      );
      if (d >= radiusMeters) {
        lastSafeIndex = i;
        break;
      }
    }

    if (firstSafeIndex < lastSafeIndex && lastSafeIndex - firstSafeIndex >= 3) {
      return points.slice(firstSafeIndex, lastSafeIndex + 1);
    }

    return points;
  }

  /**
   * Master pipeline: Normalizes raw activity input and derives RAW, CLEANED,
   * SIMPLIFIED, and VIDEO route geometries.
   */
  public static processActivity(
    rawInput: {
      id?: string;
      userId?: string;
      source: ActivitySource;
      sourceActivityId?: string;
      sportType: RouteSportType;
      title: string;
      startedAt?: number;
      endedAt?: number;
      privacyLevel?: PrivacyLevel;
      rawPoints?: GpsPoint[];
      summaryPolyline?: string;
      notes?: string;
      mediaUrls?: string[];
      // Imported metadata to preserve
      importedMetrics?: {
        distanceKm?: number;
        durationSeconds?: number;
        calories?: number;
        elevationGainMeters?: number;
      };
    }
  ): RouteProcessingResult {
    const activityId = rawInput.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = rawInput.userId || 'sughosh';
    const privacyLevel: PrivacyLevel = rawInput.privacyLevel || 'PRIVATE';

    // 1. Normalize points
    let points: GpsPoint[] = [];
    if (rawInput.rawPoints && rawInput.rawPoints.length > 0) {
      points = [...rawInput.rawPoints].sort((a, b) => a.timestamp - b.timestamp);
    } else if (rawInput.summaryPolyline) {
      points = this.decodePolyline(rawInput.summaryPolyline, 5);
    }

    // 2. GPS Quality Analysis
    const { report, acceptedIndices, gapIndices } =
      ActivityRouteQualityService.analyzeQuality(points, rawInput.sportType);

    // 3. Extract Accepted Points
    const acceptedPoints: GpsPoint[] = [];
    for (let i = 0; i < points.length; i++) {
      if (acceptedIndices.has(i)) {
        acceptedPoints.push(points[i]);
      }
    }

    // 4. Compute Accurate Metrics from accepted points
    const fallbackElapsed = rawInput.importedMetrics?.durationSeconds ||
      (rawInput.startedAt && rawInput.endedAt
        ? Math.round((rawInput.endedAt - rawInput.startedAt) / 1000)
        : 0);

    const computedMetrics = ActivityMetricsService.computeMetrics(
      acceptedPoints,
      rawInput.sportType,
      fallbackElapsed
    );

    // Distinguish and merge imported metrics if available
    const finalDistanceMeters =
      rawInput.importedMetrics?.distanceKm !== undefined
        ? Math.round(rawInput.importedMetrics.distanceKm * 1000)
        : computedMetrics.distanceMeters;

    const finalCalories =
      rawInput.importedMetrics?.calories ||
      Math.round(computedMetrics.distanceKm * 65);

    const finalElevationGain =
      rawInput.importedMetrics?.elevationGainMeters !== undefined
        ? rawInput.importedMetrics.elevationGainMeters
        : computedMetrics.elevationGainMeters;

    // 5. Segment Detection & Geometry Construction
    // Cleaned Segments: split across identified gaps to avoid fake straight lines
    const cleanedSegments: GeoJsonCoordinate[][] = [];
    let currentSegment: GeoJsonCoordinate[] = [];

    for (let i = 0; i < points.length; i++) {
      if (acceptedIndices.has(i)) {
        const p = points[i];
        if (gapIndices.has(i) && currentSegment.length > 0) {
          cleanedSegments.push(currentSegment);
          currentSegment = [];
        }
        currentSegment.push([p.longitude, p.latitude, p.altitude || 0]);
      }
    }
    if (currentSegment.length > 0) {
      cleanedSegments.push(currentSegment);
    }

    // Flattened cleaned coords for bounding box and single polyline representation
    const flatCleanedCoords = cleanedSegments.flat();

    // Bounding Box
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const c of flatCleanedCoords) {
      const [lng, lat] = c;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    const bounds = flatCleanedCoords.length > 0 ? { minLat, maxLat, minLng, maxLng } : undefined;

    // Simplified Geometry
    const simplifiedCoords: [number, number][] = this.simplifyCoordinates(
      flatCleanedCoords.map((c) => [c[0], c[1]])
    );

    // Video Geometry (normalized progress 0.0 to 1.0 with cumulative distance)
    let cumulativeDist = 0;
    const videoProgressPoints: VideoGeometryPoint[] = [];

    for (let i = 0; i < acceptedPoints.length; i++) {
      const curr = acceptedPoints[i];
      if (i > 0) {
        const prev = acceptedPoints[i - 1];
        cumulativeDist += ActivityRouteQualityService.haversineMeters(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude
        );
      }
      const progress = computedMetrics.distanceMeters > 0
        ? Math.min(1.0, cumulativeDist / computedMetrics.distanceMeters)
        : i / Math.max(1, acceptedPoints.length - 1);

      videoProgressPoints.push({
        coordinate: [curr.longitude, curr.latitude],
        cumulativeDistanceMeters: Math.round(cumulativeDist),
        normalizedProgress: Math.round(progress * 10000) / 10000,
        timestamp: curr.timestamp,
        elevation: curr.altitude
      });
    }

    // Route Render Mode Decision
    const routeRenderMode = report.shouldRenderMap ? 'CLEANED' : 'NO_MAP';

    const nowIso = new Date().toISOString();
    const rawGeometryId = `${activityId}_geom_raw`;
    const cleanedGeometryId = `${activityId}_geom_cleaned`;
    const simplifiedGeometryId = `${activityId}_geom_simplified`;
    const videoGeometryId = `${activityId}_geom_video`;

    // Assembled Derived Geometries
    const rawGeometryDoc: RouteGeometryDocument = {
      id: rawGeometryId,
      activityId,
      geometryKind: 'RAW',
      encoding: 'POLYLINE6',
      compactGeometry: this.encodePolyline(points),
      pointCount: points.length,
      distanceMeters: finalDistanceMeters,
      matchProvider: 'NONE',
      processingVersion: ROUTE_INTELLIGENCE_CONFIG.PROCESSING_VERSION,
      bounds,
      createdAt: nowIso
    };

    const cleanedGeometryDoc: RouteGeometryDocument = {
      id: cleanedGeometryId,
      activityId,
      geometryKind: 'CLEANED',
      encoding: 'POLYLINE6',
      compactGeometry: this.encodePolyline(acceptedPoints),
      pointCount: acceptedPoints.length,
      distanceMeters: computedMetrics.distanceMeters,
      matchProvider: 'NONE',
      processingVersion: ROUTE_INTELLIGENCE_CONFIG.PROCESSING_VERSION,
      segments: cleanedSegments,
      bounds,
      createdAt: nowIso
    };

    const simplifiedGeometryDoc: RouteGeometryDocument = {
      id: simplifiedGeometryId,
      activityId,
      geometryKind: 'SIMPLIFIED',
      encoding: 'GEOJSON',
      compactGeometry: JSON.stringify(simplifiedCoords),
      pointCount: simplifiedCoords.length,
      distanceMeters: computedMetrics.distanceMeters,
      matchProvider: 'NONE',
      processingVersion: ROUTE_INTELLIGENCE_CONFIG.PROCESSING_VERSION,
      bounds,
      createdAt: nowIso
    };

    const videoGeometryDoc: RouteGeometryDocument = {
      id: videoGeometryId,
      activityId,
      geometryKind: 'VIDEO',
      encoding: 'GEOJSON',
      compactGeometry: JSON.stringify(videoProgressPoints),
      pointCount: videoProgressPoints.length,
      distanceMeters: computedMetrics.distanceMeters,
      matchProvider: 'NONE',
      processingVersion: ROUTE_INTELLIGENCE_CONFIG.PROCESSING_VERSION,
      bounds,
      createdAt: nowIso
    };

    // Master Activity Document
    const activityDoc: ActivityDocument = {
      id: activityId,
      userId,
      source: rawInput.source,
      sourceActivityId: rawInput.sourceActivityId,
      sportType: rawInput.sportType,
      title: rawInput.title,
      startedAt: rawInput.startedAt || (points[0]?.timestamp ?? Date.now()),
      endedAt: rawInput.endedAt || (points[points.length - 1]?.timestamp ?? Date.now()),
      elapsedTimeSeconds: computedMetrics.elapsedTimeSeconds,
      movingTimeSeconds: computedMetrics.movingTimeSeconds,
      distanceMeters: finalDistanceMeters,
      elevationGainMeters: finalElevationGain,
      calories: finalCalories,
      averagePaceSecondsPerKm: computedMetrics.averagePaceSecondsPerKm,
      averagePaceString: computedMetrics.averagePaceString,
      averageSpeedMps: computedMetrics.averageSpeedMps,
      averageSpeedKmh: computedMetrics.averageSpeedKmh,
      maxSpeedKmh: computedMetrics.maxSpeedKmh,
      privacyLevel,
      routeRenderMode,
      rawGeometryId,
      cleanedGeometryId,
      simplifiedGeometryId,
      videoGeometryId,
      processingStatus: 'COMPLETED',
      qualityReport: report,
      splits: computedMetrics.splits,
      notes: rawInput.notes,
      mediaUrls: rawInput.mediaUrls,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Video Render Payload for Phase 3
    const videoPayload: VideoRenderPayload | undefined = bounds
      ? {
          activityId,
          title: rawInput.title,
          athleteName: userId === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit',
          dateString: new Date(activityDoc.startedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          sportType: rawInput.sportType,
          totalDistanceKm: computedMetrics.distanceKm,
          movingTimeFormatted: ActivityMetricsService.formatDuration(activityDoc.movingTimeSeconds),
          averagePaceFormatted: computedMetrics.averagePaceString,
          elevationGainMeters: finalElevationGain,
          progressPoints: videoProgressPoints,
          bounds,
          privacyRedacted: privacyLevel !== 'PUBLIC',
          templateConfig: {
            template: 'SIGNATURE_TRAIL_REPLAY',
            aspectRatio: '9_16',
            width: 1080,
            height: 1920,
            fps: 30,
            durationSeconds: 15
          }
        }
      : undefined;

    return {
      activity: activityDoc,
      geometries: {
        raw: rawGeometryDoc,
        cleaned: cleanedGeometryDoc,
        simplified: simplifiedGeometryDoc,
        video: videoGeometryDoc
      },
      videoPayload
    };
  }
}
