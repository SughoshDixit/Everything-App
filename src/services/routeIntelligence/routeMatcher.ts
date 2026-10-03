/**
 * Route Matcher Abstraction & Valhalla Adapter
 * Implements map-matching for noisy GPS activity traces using Valhalla / OSM,
 * with rigorous sanity checks, deviation bounds, and graceful passthrough fallback.
 */

import { ROUTE_INTELLIGENCE_CONFIG } from './routeConfig';
import { ActivityRouteProcessingService } from './routeProcessingService';
import type {
  ActivityDocument,
  RouteGeometryDocument,
  RouteSportType,
  MatchProvider,
  GeoJsonCoordinate
} from '../../types/routeIntelligence';

export interface MapMatchResult {
  success: boolean;
  geometryKind: 'MATCHED' | 'CLEANED';
  matchedGeometry?: RouteGeometryDocument;
  matchProvider: MatchProvider;
  confidence: number; // 0.0 to 1.0
  distanceMeters: number;
  deviationPercent: number; // e.g. 4.2%
  fallbackReason?: string;
}

export interface IRouteMatcher {
  matchRoute(
    activity: ActivityDocument,
    cleanedGeometry: RouteGeometryDocument,
    sportType: RouteSportType
  ): Promise<MapMatchResult>;
}

/**
 * Valhalla Server-Side Route Matcher
 * Calls Valhalla's /trace_route endpoint using OpenStreetMap-based routing data.
 */
export class ValhallaRouteMatcher implements IRouteMatcher {
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl =
      apiUrl ||
      (import.meta as any).env?.VITE_VALHALLA_API_URL ||
      'https://valhalla.openstreetmap.de';
    this.apiKey = apiKey || (import.meta as any).env?.VITE_VALHALLA_API_KEY;
  }

  /**
   * Selects appropriate Valhalla costing profile for sport type
   */
  private getCostingProfile(sportType: RouteSportType): string {
    switch (sportType) {
      case 'RIDE':
        return 'bicycle';
      case 'ROAD_TRIP':
        return 'auto';
      case 'RUN':
      case 'WALK':
      case 'HIKE':
      case 'TRAIL_RUN':
      default:
        return 'pedestrian';
    }
  }

  public async matchRoute(
    activity: ActivityDocument,
    cleanedGeometry: RouteGeometryDocument,
    sportType: RouteSportType
  ): Promise<MapMatchResult> {
    // 1. Eligibility Check
    if (!activity.qualityReport?.isEligibleForMapMatching) {
      return {
        success: false,
        geometryKind: 'CLEANED',
        matchProvider: 'NONE',
        confidence: 0,
        distanceMeters: cleanedGeometry.distanceMeters,
        deviationPercent: 0,
        fallbackReason: 'Activity trace is not eligible for map matching (indoor, track, or poor quality).'
      };
    }

    // 2. Extract coordinates to match
    let coordsToMatch: [number, number][] = [];
    if (cleanedGeometry.segments && cleanedGeometry.segments.length > 0) {
      coordsToMatch = cleanedGeometry.segments.flat().map((c) => [c[0], c[1]]);
    } else if (cleanedGeometry.compactGeometry.startsWith('[')) {
      coordsToMatch = JSON.parse(cleanedGeometry.compactGeometry);
    }

    if (coordsToMatch.length < 5) {
      return {
        success: false,
        geometryKind: 'CLEANED',
        matchProvider: 'NONE',
        confidence: 0,
        distanceMeters: cleanedGeometry.distanceMeters,
        deviationPercent: 0,
        fallbackReason: 'Too few coordinates for reliable map matching.'
      };
    }

    const costing = this.getCostingProfile(sportType);

    // Prepare Valhalla trace_route payload
    const shape = coordsToMatch.map(([lon, lat]) => ({ lat, lon }));
    const payload = {
      shape,
      costing,
      costing_options: {
        pedestrian: {
          use_trails: 1.0,
          walking_speed: 5.0
        },
        bicycle: {
          bicycle_type: 'Road',
          use_roads: 0.8
        }
      },
      shape_match: 'map_snap',
      trace_options: {
        search_radius: 35.0, // 35 meters search radius
        gps_accuracy: 10.0,
        breakage_distance: 150.0
      }
    };

    try {
      const url = `${this.apiUrl}/trace_route${this.apiKey ? `?api_key=${this.apiKey}` : ''}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Valhalla HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.trip || !data.trip.legs || data.trip.legs.length === 0) {
        throw new Error('No matched trip leg returned by Valhalla');
      }

      // Extract matched geometry polyline6
      const matchedPolyline = data.trip.legs[0].shape;
      const matchedPoints = ActivityRouteProcessingService.decodePolyline(matchedPolyline, 6);
      const matchedDistanceMeters = Math.round(data.trip.summary.length * 1000);

      // 3. Sanity Checks: Matched distance deviation vs Cleaned distance
      const cleanedDist = cleanedGeometry.distanceMeters;
      const deviation = Math.abs(matchedDistanceMeters - cleanedDist);
      const deviationPercent = cleanedDist > 0 ? (deviation / cleanedDist) * 100 : 0;

      // Reject if matched route deviates by more than 18% from physical GPS trace
      if (deviationPercent > 18.0) {
        return {
          success: false,
          geometryKind: 'CLEANED',
          matchProvider: 'NONE',
          confidence: 0.3,
          distanceMeters: cleanedDist,
          deviationPercent: Math.round(deviationPercent * 10) / 10,
          fallbackReason: `Matched route deviated by ${deviationPercent.toFixed(1)}% from physical GPS trace (exceeds 18% safety threshold).`
        };
      }

      const matchedGeoJsonCoords: GeoJsonCoordinate[] = matchedPoints.map((p) => [
        p.longitude,
        p.latitude,
        0
      ]);

      const nowIso = new Date().toISOString();
      const matchedGeometryDoc: RouteGeometryDocument = {
        id: `${activity.id}_geom_matched`,
        activityId: activity.id,
        geometryKind: 'MATCHED',
        encoding: 'POLYLINE6',
        compactGeometry: matchedPolyline,
        pointCount: matchedPoints.length,
        distanceMeters: matchedDistanceMeters,
        matchProvider: 'VALHALLA',
        matchConfidence: 0.94,
        processingVersion: ROUTE_INTELLIGENCE_CONFIG.PROCESSING_VERSION,
        segments: [matchedGeoJsonCoords],
        bounds: cleanedGeometry.bounds,
        metadata: {
          valhallaCosting: costing,
          deviationPercent: Math.round(deviationPercent * 10) / 10
        },
        createdAt: nowIso
      };

      return {
        success: true,
        geometryKind: 'MATCHED',
        matchedGeometry: matchedGeometryDoc,
        matchProvider: 'VALHALLA',
        confidence: 0.94,
        distanceMeters: matchedDistanceMeters,
        deviationPercent: Math.round(deviationPercent * 10) / 10
      };
    } catch (e: any) {
      return {
        success: false,
        geometryKind: 'CLEANED',
        matchProvider: 'NONE',
        confidence: 0,
        distanceMeters: cleanedGeometry.distanceMeters,
        deviationPercent: 0,
        fallbackReason: `Valhalla server matching request failed: ${e.message}. Safely fallen back to Cleaned GPS geometry.`
      };
    }
  }
}

/**
 * Passthrough / Local Development Route Matcher
 * Used for offline development and local test simulation.
 */
export class PassthroughRouteMatcher implements IRouteMatcher {
  public async matchRoute(
    activity: ActivityDocument,
    cleanedGeometry: RouteGeometryDocument,
    _sportType: RouteSportType
  ): Promise<MapMatchResult> {
    if (!activity.qualityReport?.isEligibleForMapMatching) {
      return {
        success: false,
        geometryKind: 'CLEANED',
        matchProvider: 'PASSTHROUGH',
        confidence: 0,
        distanceMeters: cleanedGeometry.distanceMeters,
        deviationPercent: 0,
        fallbackReason: 'Trace is not eligible for map matching.'
      };
    }

    const nowIso = new Date().toISOString();
    const matchedGeometryDoc: RouteGeometryDocument = {
      ...cleanedGeometry,
      id: `${activity.id}_geom_matched`,
      geometryKind: 'MATCHED',
      matchProvider: 'PASSTHROUGH',
      matchConfidence: 0.88,
      createdAt: nowIso
    };

    return {
      success: true,
      geometryKind: 'MATCHED',
      matchedGeometry: matchedGeometryDoc,
      matchProvider: 'PASSTHROUGH',
      confidence: 0.88,
      distanceMeters: cleanedGeometry.distanceMeters,
      deviationPercent: 0.0
    };
  }
}

/**
 * Route Matcher Factory
 */
export function createRouteMatcher(useValhalla = false): IRouteMatcher {
  if (useValhalla) {
    return new ValhallaRouteMatcher();
  }
  return new PassthroughRouteMatcher();
}
