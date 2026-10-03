/**
 * In-Memory LRU Route & Activity Data Cache
 * Prevents redundant Firestore reads, duplicate Polyline6 decoding,
 * and repeated GeoJSON object generation on mobile devices.
 */

import type { ActivityDocument, RouteGeometryDocument } from '../../types/routeIntelligence';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class RouteCacheService {
  private static instance: RouteCacheService;

  // Max entries to prevent memory pressure on 2GB-4GB RAM phones
  private readonly MAX_GEOMETRY_ENTRIES = 40;
  private readonly MAX_ACTIVITY_ENTRIES = 30;
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

  // Decoded geometry points cache: compactGeometry string -> coordinates array
  private decodedPolylineCache = new Map<string, CacheEntry<[number, number][]>>();

  // Activity document cache: activityId -> ActivityDocument
  private activityDocCache = new Map<string, CacheEntry<ActivityDocument>>();

  // Derived geometry documents cache: activityId -> Record<string, RouteGeometryDocument>
  private geometryDocsCache = new Map<string, CacheEntry<Record<string, RouteGeometryDocument>>>();

  private constructor() {}

  public static getInstance(): RouteCacheService {
    if (!RouteCacheService.instance) {
      RouteCacheService.instance = new RouteCacheService();
    }
    return RouteCacheService.instance;
  }

  /**
   * Retrieves or sets decoded coordinates for a compact geometry string.
   */
  public getOrDecodePolyline(
    compactKey: string,
    decoderFn: (compact: string) => [number, number][]
  ): [number, number][] {
    const cached = this.decodedPolylineCache.get(compactKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.DEFAULT_TTL_MS) {
      // Refresh LRU order
      this.decodedPolylineCache.delete(compactKey);
      this.decodedPolylineCache.set(compactKey, { value: cached.value, timestamp: now });
      return cached.value;
    }

    const decoded = decoderFn(compactKey);

    // Evict oldest if exceeding limit
    if (this.decodedPolylineCache.size >= this.MAX_GEOMETRY_ENTRIES) {
      const oldestKey = this.decodedPolylineCache.keys().next().value;
      if (oldestKey) this.decodedPolylineCache.delete(oldestKey);
    }

    this.decodedPolylineCache.set(compactKey, { value: decoded, timestamp: now });
    return decoded;
  }

  /**
   * Caches an ActivityDocument and its associated geometries.
   */
  public setActivity(
    activityId: string,
    activity: ActivityDocument,
    geometries?: Record<string, RouteGeometryDocument>
  ): void {
    const now = Date.now();

    if (this.activityDocCache.size >= this.MAX_ACTIVITY_ENTRIES) {
      const oldestKey = this.activityDocCache.keys().next().value;
      if (oldestKey) this.activityDocCache.delete(oldestKey);
    }
    this.activityDocCache.set(activityId, { value: activity, timestamp: now });

    if (geometries) {
      if (this.geometryDocsCache.size >= this.MAX_ACTIVITY_ENTRIES) {
        const oldestKey = this.geometryDocsCache.keys().next().value;
        if (oldestKey) this.geometryDocsCache.delete(oldestKey);
      }
      this.geometryDocsCache.set(activityId, { value: geometries, timestamp: now });
    }
  }

  /**
   * Gets a cached ActivityDocument if present and not expired.
   */
  public getActivity(activityId: string): ActivityDocument | null {
    const cached = this.activityDocCache.get(activityId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.DEFAULT_TTL_MS) {
      this.activityDocCache.delete(activityId);
      return null;
    }
    return cached.value;
  }

  /**
   * Gets cached geometry documents for an activity if present.
   */
  public getGeometries(activityId: string): Record<string, RouteGeometryDocument> | null {
    const cached = this.geometryDocsCache.get(activityId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.DEFAULT_TTL_MS) {
      this.geometryDocsCache.delete(activityId);
      return null;
    }
    return cached.value;
  }

  /**
   * Clears all cached in-memory data (e.g. on user logout or low memory).
   */
  public clear(): void {
    this.decodedPolylineCache.clear();
    this.activityDocCache.clear();
    this.geometryDocsCache.clear();
  }
}
