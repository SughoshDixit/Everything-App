/**
 * Route Intelligence Firestore & Storage Service
 * Handles persistence of Activities, Derived Geometry Subcollections,
 * Processing Jobs, and Trail Video Records.
 *
 * Integrates directly with the existing Firebase project (`kuchh-bhii`)
 * without disrupting existing historical collections.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { cleanForFirestore, DEFAULT_USER_ID } from '../firestoreService';
import { ActivityRouteProcessingService, type RouteProcessingResult } from './routeProcessingService';
import { RouteCacheService } from './routeCacheService';
import { PerfMonitor } from './performanceMonitoring';
import type {
  ActivityDocument,
  RouteGeometryDocument,
  ProcessingJobDocument,
  TrailVideoDocument,
  TrailVideoTemplate,
  TrailVideoAspectRatio,
  RouteSportType
} from '../../types/routeIntelligence';
import type { GpsActivityLog, StravaActivityPost } from '../../types';

export class RouteIntelligenceFirestoreService {
  private static normalizationCache = new Map<string, RouteProcessingResult>();
  private static recentVideoJobs = new Map<string, { job: TrailVideoDocument; timestamp: number }>();
  /**
   * Persists an Activity document and all its derived geometries to Firestore.
   */
  public static async saveProcessedActivity(
    result: RouteProcessingResult,
    userId: string = DEFAULT_USER_ID
  ): Promise<void> {
    const { activity, geometries } = result;

    // 1. Save master Activity document: activities/{activityId}
    const activityRef = doc(db, 'activities', activity.id);
    const cleanActivity = cleanForFirestore({
      ...activity,
      userId,
      updatedAt: new Date().toISOString()
    });
    await setDoc(activityRef, cleanActivity, { merge: true });

    // 2. Save derived geometry subcollection: activities/{activityId}/geometries/{geometryId}
    const geometriesCol = collection(db, 'activities', activity.id, 'geometries');

    const geomEntries = Object.values(geometries);
    for (const geom of geomEntries) {
      const geomRef = doc(geometriesCol, geom.id);
      await setDoc(geomRef, cleanForFirestore(geom), { merge: true });
    }

    // 3. Record completed normalization job
    const jobDoc: ProcessingJobDocument = {
      id: `job_norm_${Date.now()}`,
      activityId: activity.id,
      jobType: 'NORMALIZE',
      status: 'COMPLETED',
      attempts: 1,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    const jobRef = doc(db, 'activities', activity.id, 'processingJobs', jobDoc.id);
    await setDoc(jobRef, cleanForFirestore(jobDoc), { merge: true });
  }

  /**
   * Fetches an Activity document and its derived geometries by ID.
   */
  public static async fetchProcessedActivity(
    activityId: string
  ): Promise<{
    activity: ActivityDocument;
    geometries: Record<string, RouteGeometryDocument>;
  } | null> {
    const cache = RouteCacheService.getInstance();
    const cachedAct = cache.getActivity(activityId);
    const cachedGeoms = cache.getGeometries(activityId);

    if (cachedAct && cachedGeoms) {
      return { activity: cachedAct, geometries: cachedGeoms };
    }

    PerfMonitor.start(`fetchProcessedActivity_${activityId}`);
    const activityRef = doc(db, 'activities', activityId);
    const activitySnap = await getDoc(activityRef);

    if (!activitySnap.exists()) {
      PerfMonitor.end(`fetchProcessedActivity_${activityId}`, { found: false });
      return null;
    }

    const activity = activitySnap.data() as ActivityDocument;

    // Fetch geometry subcollection
    const geometriesCol = collection(db, 'activities', activityId, 'geometries');
    const geomSnaps = await getDocs(geometriesCol);
    const geometries: Record<string, RouteGeometryDocument> = {};

    geomSnaps.forEach((d) => {
      const g = d.data() as RouteGeometryDocument;
      geometries[g.geometryKind.toLowerCase()] = g;
    });

    // Cache in memory for subsequent instant retrieval
    cache.setActivity(activityId, activity, geometries);
    PerfMonitor.end(`fetchProcessedActivity_${activityId}`, { found: true, geoms: geomSnaps.size });

    return { activity, geometries };
  }

  /**
   * Creates an idempotent Trail Video render job document in Firestore for Phase 3.
   * Debounces duplicate requests for the same activity within 60 seconds.
   */
  public static async queueTrailVideoJob(
    activityId: string,
    template: TrailVideoTemplate = 'SIGNATURE_TRAIL_REPLAY',
    aspectRatio: TrailVideoAspectRatio = '9_16'
  ): Promise<TrailVideoDocument> {
    const now = Date.now();
    const recent = this.recentVideoJobs.get(activityId);
    if (recent && now - recent.timestamp < 60000) {
      // Reuse recent job to prevent redundant Cloud Run jobs
      return recent.job;
    }

    const videoId = `vid_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const videoDoc: TrailVideoDocument = {
      id: videoId,
      activityId,
      template,
      aspectRatio,
      status: 'READY',
      createdAt: nowIso
    };

    const videoRef = doc(db, 'activities', activityId, 'trailVideos', videoId);
    await setDoc(videoRef, cleanForFirestore(videoDoc), { merge: true });

    this.recentVideoJobs.set(activityId, { job: videoDoc, timestamp: now });
    return videoDoc;
  }

  /**
   * Normalizes an existing historical GpsActivityLog from the app into
   * a RouteProcessingResult on the fly, with zero data loss or mutation.
   * Cached in-memory to prevent repeated CPU load.
   */
  public static normalizeFromHistoricalGpsLog(
    log: GpsActivityLog,
    userId: string = DEFAULT_USER_ID
  ): RouteProcessingResult {
    const cached = this.normalizationCache.get(log.id);
    if (cached) return cached;

    let sportType: RouteSportType = 'RUN';
    if (log.activityType === 'cycle') sportType = 'RIDE';
    else if (log.activityType === 'walk') sportType = 'WALK';
    else if (log.activityType === 'drive') sportType = 'ROAD_TRIP';

    const rawPoints = (log.routePoints || []).map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      altitude: p.altitude,
      timestamp: p.timestamp,
      speed: p.speed,
      accuracy: p.accuracy
    }));

    const result = ActivityRouteProcessingService.processActivity({
      id: log.id,
      userId,
      source: 'DEVICE',
      sourceActivityId: log.id,
      sportType,
      title: log.title || `${sportType.charAt(0) + sportType.slice(1).toLowerCase()} Session`,
      startedAt: log.startTime,
      endedAt: log.endTime,
      rawPoints,
      notes: log.notes,
      mediaUrls: log.mediaUrls,
      importedMetrics: {
        distanceKm: log.distanceKm,
        durationSeconds: log.durationSeconds,
        calories: log.caloriesBurned,
        elevationGainMeters: log.elevationGainMeters
      }
    });

    this.normalizationCache.set(log.id, result);
    return result;
  }

  /**
   * Normalizes an existing StravaActivityPost into a RouteProcessingResult.
   * Cached in-memory to prevent repeated CPU load.
   */
  public static normalizeFromStravaPost(
    post: StravaActivityPost,
    userId: string = DEFAULT_USER_ID
  ): RouteProcessingResult {
    const cached = this.normalizationCache.get(post.id);
    if (cached) return cached;

    let sportType: RouteSportType = 'RUN';
    if (post.sportType === 'cycle') sportType = 'RIDE';
    else if (post.sportType === 'walk') sportType = 'WALK';
    else if (post.sportType === 'drive') sportType = 'ROAD_TRIP';
    else if (post.sportType === 'calisthenics') sportType = 'CALISTHENICS';
    else if (post.sportType === 'football') sportType = 'FOOTBALL';

    const rawPoints = (post.gpsActivity?.routePoints || []).map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      altitude: p.altitude,
      timestamp: p.timestamp,
      speed: p.speed,
      accuracy: p.accuracy
    }));

    const durationSeconds = (post.totalMoveMinutes || 25) * 60;

    const result = ActivityRouteProcessingService.processActivity({
      id: post.id,
      userId,
      source: 'STRAVA',
      sourceActivityId: post.id,
      sportType,
      title: post.title,
      startedAt: post.timestamp,
      endedAt: post.timestamp + durationSeconds * 1000,
      rawPoints,
      notes: post.description,
      mediaUrls: post.photos,
      importedMetrics: {
        distanceKm: post.totalDistanceKm,
        durationSeconds,
        calories: post.totalCalories,
        elevationGainMeters: post.elevationGainMeters
      }
    });

    this.normalizationCache.set(post.id, result);
    return result;
  }
}
