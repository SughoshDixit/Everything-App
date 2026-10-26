import type {
  AutoDetectedActivity,
  GpsActivityLog,
  GpsLocationPoint,
  ActivitySplit,
  ActivityRecordBadge
} from '../types';
import {
  CUBBON_PARK_POINTS,
  NANDI_HILLS_POINTS,
  TURAHALLI_FOREST_POINTS,
  SOUTH_UNITED_PITCH_POINTS
} from '../utils/routeGeometryGenerator';

const STORAGE_KEY = 'kuchh_bhii_auto_activities';

/**
 * Auto-Activity Detection Service:
 * Bridges native Android low-power sensor cadence detection with the web layer.
 * Recovers missed workouts when the user forgot to open the app and allows 1-tap
 * confirmation and inclusion in daily streaks and recap posts.
 */
class AutoActivityDetectionService {
  private listeners: Set<(activities: AutoDetectedActivity[]) => void> = new Set();

  public subscribe(callback: (activities: AutoDetectedActivity[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(activities: AutoDetectedActivity[]): void {
    this.listeners.forEach((fn) => fn(activities));
  }

  /**
   * Retrieves pending auto-detected activities from Android bridge or localStorage fallback.
   */
  public async getPendingActivities(): Promise<AutoDetectedActivity[]> {
    let nativeList: AutoDetectedActivity[] = [];

    // Query native bridge if running in Android app
    if (
      typeof window !== 'undefined' &&
      window.AndroidBridge &&
      typeof window.AndroidBridge.getAutoDetectedActivitiesJson === 'function'
    ) {
      try {
        const jsonStr = window.AndroidBridge.getAutoDetectedActivitiesJson();
        if (jsonStr && jsonStr !== '[]') {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed)) {
            nativeList = parsed;
          }
        }
      } catch (e) {
        console.warn('Failed parsing native auto-detected activities:', e);
      }
    }

    // Query localStorage fallback
    let localList: AutoDetectedActivity[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localList = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading localStorage auto-detected activities:', e);
    }

    // Merge without duplicates by ID
    const mergedMap = new Map<string, AutoDetectedActivity>();
    nativeList.forEach((item) => mergedMap.set(item.id, item));
    localList.forEach((item) => {
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    const pending = Array.from(mergedMap.values())
      .filter((a) => a.status === 'pending_review')
      .sort((a, b) => b.startTime - a.startTime);

    return pending;
  }

  /**
   * Confirm an auto-detected workout (removes from pending list).
   */
  public async confirmActivity(id: string): Promise<boolean> {
    let success = false;

    if (
      typeof window !== 'undefined' &&
      window.AndroidBridge &&
      typeof window.AndroidBridge.confirmAutoDetectedActivity === 'function'
    ) {
      try {
        success = window.AndroidBridge.confirmAutoDetectedActivity(id);
      } catch (e) {
        console.warn('Native confirmActivity error:', e);
      }
    }

    // Also update localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: AutoDetectedActivity[] = JSON.parse(stored);
        const updated = list.map((item) =>
          item.id === id ? { ...item, status: 'confirmed' as const } : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        success = true;
      }
    } catch (e) {
      console.warn('Local confirm error:', e);
    }

    const remaining = await this.getPendingActivities();
    this.notifyListeners(remaining);
    return success;
  }

  /**
   * Discard an auto-detected workout.
   */
  public async discardActivity(id: string): Promise<boolean> {
    let success = false;

    if (
      typeof window !== 'undefined' &&
      window.AndroidBridge &&
      typeof window.AndroidBridge.discardAutoDetectedActivity === 'function'
    ) {
      try {
        success = window.AndroidBridge.discardAutoDetectedActivity(id);
      } catch (e) {
        console.warn('Native discardActivity error:', e);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: AutoDetectedActivity[] = JSON.parse(stored);
        const filtered = list.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        success = true;
      }
    } catch (e) {
      console.warn('Local discard error:', e);
    }

    const remaining = await this.getPendingActivities();
    this.notifyListeners(remaining);
    return success;
  }

  /**
   * Simulates a missed background activity detection.
   * Useful for immediate user verification and testing.
   */
  public async simulateMissedWorkout(
    type: 'run' | 'walk' | 'cycle' | 'football' | 'workout',
    durationMinutes = 26,
    distanceKm = 4.15
  ): Promise<AutoDetectedActivity> {
    // Check if native bridge simulation is available
    if (
      typeof window !== 'undefined' &&
      window.AndroidBridge &&
      typeof window.AndroidBridge.simulateBackgroundActivityDetection === 'function'
    ) {
      try {
        const jsonStr = window.AndroidBridge.simulateBackgroundActivityDetection(
          type,
          durationMinutes,
          distanceKm
        );
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr) as AutoDetectedActivity;
          const pending = await this.getPendingActivities();
          this.notifyListeners(pending);
          return parsed;
        }
      } catch (e) {
        console.warn('Native simulation error:', e);
      }
    }

    // Fallback web simulation
    const now = Date.now();
    const durationSeconds = durationMinutes * 60;
    const startTime = now - durationSeconds * 1000;

    const avgCadence =
      type === 'run' ? 164 : type === 'football' ? 152 : type === 'cycle' ? 40 : 108;

    const calories =
      type === 'run'
        ? Math.round(distanceKm * 64)
        : type === 'football'
        ? Math.round(durationMinutes * 9.5)
        : type === 'cycle'
        ? Math.round(distanceKm * 32)
        : Math.round(distanceKm * 48);

    const title =
      type === 'run'
        ? 'Auto-Detected Morning Run'
        : type === 'football'
        ? 'Auto-Detected Football Match'
        : type === 'cycle'
        ? 'Auto-Detected Ride'
        : 'Auto-Detected Fitness Walk';

    const simulated: AutoDetectedActivity = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activityType: type,
      startTime,
      endTime: now,
      durationSeconds,
      distanceKm,
      estimatedCalories: calories,
      avgCadenceSpm: avgCadence,
      confidenceScore: 94,
      detectionSource: 'cadence_accelerometer',
      status: 'pending_review',
      suggestedTitle: title,
      notes: `Passive cadence analysis detected ${avgCadence} spm over ${durationMinutes} minutes.`
    };

    // Store in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: AutoDetectedActivity[] = stored ? JSON.parse(stored) : [];
      list.unshift(simulated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed saving simulated activity to localStorage:', e);
    }

    const pending = await this.getPendingActivities();
    this.notifyListeners(pending);
    return simulated;
  }

  /**
   * Converts an AutoDetectedActivity into a fully compliant GpsActivityLog with
   * realistic route points, splits, metrics, and milestones ready to be saved.
   */
  public convertAutoDetectedToGpsLog(
    act: AutoDetectedActivity,
    userPersona: 'men' | 'women' = 'men'
  ): GpsActivityLog {
    const durationSec = Math.max(60, act.durationSeconds);
    const distKm = Math.max(0.1, act.distanceKm);

    // Pace calculation (min/km)
    const totalPaceSeconds = distKm > 0 ? durationSec / distKm : 300;
    const paceMin = Math.floor(totalPaceSeconds / 60);
    const paceSec = Math.floor(totalPaceSeconds % 60);
    const avgPaceMinKm = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

    const avgSpeedKmh = distKm > 0 ? (distKm / (durationSec / 3600)) : 10;
    const topSpeedKmh = Math.round((avgSpeedKmh * 1.25) * 10) / 10;

    // Pick appropriate high-fidelity route points template
    let basePoints: GpsLocationPoint[] = CUBBON_PARK_POINTS;
    if (act.activityType === 'football') {
      basePoints = SOUTH_UNITED_PITCH_POINTS;
    } else if (act.activityType === 'cycle') {
      basePoints = NANDI_HILLS_POINTS;
    } else if (act.activityType === 'walk') {
      basePoints = TURAHALLI_FOREST_POINTS;
    }

    // Scale and time-align route points
    const stepTime = Math.floor((durationSec * 1000) / Math.max(1, basePoints.length - 1));
    const routePoints: GpsLocationPoint[] = basePoints.map((pt, idx) => ({
      ...pt,
      timestamp: act.startTime + idx * stepTime,
      speed: Math.round((avgSpeedKmh / 3.6 + (Math.random() * 0.4 - 0.2)) * 10) / 10
    }));

    // Generate kilometre splits
    const splits: ActivitySplit[] = [];
    const splitCount = Math.max(1, Math.floor(distKm));
    const splitSecs = Math.floor(durationSec / splitCount);

    for (let i = 1; i <= splitCount; i++) {
      const sPaceMin = Math.floor(splitSecs / 60);
      const sPaceSec = Math.floor(splitSecs % 60);
      splits.push({
        splitNumber: i,
        distanceLabel: `${i}.0 km`,
        distanceMeters: 1000,
        durationSeconds: splitSecs,
        paceMinKm: `${sPaceMin}:${sPaceSec.toString().padStart(2, '0')}`,
        elevationDeltaMeters: Math.floor(Math.random() * 12) + 2,
        speedKmh: Math.round(avgSpeedKmh * 10) / 10
      });
    }

    // Heart points & record badges
    const heartPoints = Math.round((durationSec / 60) * (act.activityType === 'run' ? 2.2 : 1.4));
    const badges: ActivityRecordBadge[] = [];

    if (distKm >= 5.0 && act.activityType === 'run') {
      badges.push({
        id: `badge_${Date.now()}_5k`,
        category: 'fastest',
        tier: 'season_best',
        title: 'SEASON BEST: 5K PACE',
        statLabel: `${avgPaceMinKm} /km`,
        icon: '⚡',
        color: 'amber'
      });
    } else if (act.activityType === 'football') {
      badges.push({
        id: `badge_${Date.now()}_fb`,
        category: 'hardest',
        tier: 'milestone',
        title: 'TACTICAL MATCHDAY WARRIOR',
        statLabel: `${Math.round(durationSec / 60)} mins played`,
        icon: '⚽',
        color: 'emerald'
      });
    }

    const log: GpsActivityLog = {
      id: act.id,
      title: act.suggestedTitle,
      activityType: (act.activityType === 'run' || act.activityType === 'cycle' || act.activityType === 'walk' || act.activityType === 'football' || act.activityType === 'badminton')
        ? act.activityType
        : 'workout',
      date: new Date(act.startTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      startTime: act.startTime,
      endTime: act.endTime,
      durationSeconds: durationSec,
      distanceKm: Math.round(distKm * 100) / 100,
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      topSpeedKmh,
      maxSpeedKmh: topSpeedKmh,
      avgPaceMinKm,
      elevationGainMeters: Math.round(distKm * 8.5),
      caloriesBurned: act.estimatedCalories,
      heartPointsEarned: heartPoints,
      stepsCount: Math.round((act.avgCadenceSpm * (durationSec / 60))),
      splits,
      routePoints,
      milestonesReached: badges.map((b) => b.title),
      userId: userPersona,
      notes: act.notes || `Recovered auto-detected ${act.activityType} (${distKm} km).`,
      recordBadges: badges
    };

    return log;
  }

  /**
   * Check if passive detection listener is enabled in native environment.
   */
  public isAutoDetectionActive(): boolean {
    if (
      typeof window !== 'undefined' &&
      window.AndroidBridge &&
      typeof window.AndroidBridge.isAutoDetectionServiceActive === 'function'
    ) {
      try {
        return window.AndroidBridge.isAutoDetectionServiceActive();
      } catch {
        return true;
      }
    }
    return true; // Web default
  }

  /**
   * Toggles passive auto detection.
   */
  public toggleAutoDetection(enabled: boolean): boolean {
    if (
      typeof window !== 'undefined' &&
      window.AndroidBridge &&
      typeof window.AndroidBridge.toggleAutoDetectionService === 'function'
    ) {
      try {
        return window.AndroidBridge.toggleAutoDetectionService(enabled);
      } catch {
        return enabled;
      }
    }
    return enabled;
  }
}

export const autoActivityDetectionService = new AutoActivityDetectionService();
