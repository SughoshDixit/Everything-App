import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { GpsActivityLog, GpsLocationPoint, PersonalMilestones, UserProfile } from '../types';
import {
  formatDuration,
  formatPace,
  calculateFitMetrics,
  evaluateActivityRecords,
  defaultMilestones,
  generateRouteSvgPath,
  calculateElevationGain,
  calculateSplits,
  estimateSteps,
  generateSampleGpsActivity
} from '../utils/milestonesTracker';
import { playBeepTone } from '../utils/audioCoach';
import {
  createGpsFilterState,
  processRawGpsPoint,
  evaluateGpsSignalQuality,
  type GpsFilterState,
  type GpsSignalQuality
} from '../utils/gpsFilter';
import {
  Play,
  Pause,
  StopCircle,
  Compass,
  ChevronLeft,
  X,
  Trophy,
  Mountain,
  Footprints
} from 'lucide-react';

interface GpsActivityTrackerModalProps {
  initialActivityType?: 'run' | 'cycle' | 'walk' | 'drive';
  currentProfile: UserProfile;
  currentMilestones?: PersonalMilestones;
  onSaveActivity: (log: GpsActivityLog, updatedMilestones: PersonalMilestones) => void;
  onOpenSocialShare?: (log: GpsActivityLog) => void;
  onOpenFlyby?: (log: GpsActivityLog) => void;
  onClose: () => void;
}

export const GpsActivityTrackerModal: React.FC<GpsActivityTrackerModalProps> = ({
  initialActivityType = 'run',
  currentProfile,
  currentMilestones = defaultMilestones,
  onSaveActivity,
  onOpenSocialShare,
  onOpenFlyby,
  onClose
}) => {
  const [activityType, setActivityType] = useState<'run' | 'cycle' | 'walk' | 'drive'>(initialActivityType);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [topSpeedKmh, setTopSpeedKmh] = useState<number>(0);
  const [routePoints, setRoutePoints] = useState<GpsLocationPoint[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [unlockedMilestones, setUnlockedMilestones] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [signalQuality, setSignalQuality] = useState<GpsSignalQuality>('good');
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const filterStateRef = useRef<GpsFilterState>(createGpsFilterState());
  const lastRoutePointsUpdateRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // ---------------------------------------------------------------------------
  // 1. DURATION TIMER (Physical timestamp based to prevent clock freezing)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
        setDurationSeconds(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused]);

  // Common ingest handler for both native Android background service and browser geolocation
  const handleIngestGpsPoint = (
    lat: number,
    lng: number,
    altitude: number | undefined,
    speedKmh: number | undefined,
    accuracy: number,
    _bearing: number | undefined,
    timestamp: number
  ) => {
    setAccuracyMeters(Math.round(accuracy));
    setSignalQuality(evaluateGpsSignalQuality(accuracy));

    const result = processRawGpsPoint(
      filterStateRef.current,
      {
        latitude: lat,
        longitude: lng,
        altitude,
        timestamp,
        speed: speedKmh !== undefined ? speedKmh / 3.6 : undefined,
        accuracy
      },
      activityType
    );

    if (result.accepted) {
      setDistanceKm(filterStateRef.current.totalDistanceKm);
      setCurrentSpeedKmh(result.calculatedSpeedKmh);
      if (result.calculatedSpeedKmh > 0) {
        setTopSpeedKmh((top) => Math.max(top, result.calculatedSpeedKmh));
      }

      // Throttle array copying and SVG re-render to every 2 seconds
      const now = Date.now();
      if (now - lastRoutePointsUpdateRef.current > 2000) {
        setRoutePoints([...filterStateRef.current.points]);
        lastRoutePointsUpdateRef.current = now;
      }
    } else {
      setCurrentSpeedKmh(0);
    }
  };

  // Catch up on any points recorded by Android Foreground Service when screen is unlocked
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTrackingRef.current) {
        if (!isPausedRef.current) {
          const elapsed = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
          setDurationSeconds(elapsed);
        }

        if (window.AndroidBridge && typeof window.AndroidBridge.getBufferedGpsPoints === 'function') {
          try {
            const rawJson = window.AndroidBridge.getBufferedGpsPoints();
            const points: any[] = JSON.parse(rawJson);
            if (Array.isArray(points) && points.length > 0) {
              points.forEach((p) => {
                handleIngestGpsPoint(
                  p.latitude,
                  p.longitude,
                  p.altitude,
                  p.speed,
                  p.accuracy ?? 5,
                  p.bearing,
                  p.timestamp || Date.now()
                );
              });
            }
          } catch (e) {
            console.warn('Error reading buffered points from Android service:', e);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activityType]);

  // ---------------------------------------------------------------------------
  // 2. REAL-TIME GPS WATCH POSITION WITH BACKGROUND SERVICE & FILTERING
  // ---------------------------------------------------------------------------
  const startGpsTracking = () => {
    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);
    isTrackingRef.current = true;
    isPausedRef.current = false;
    startTimeRef.current = Date.now();
    filterStateRef.current = createGpsFilterState();

    // 1. Android Native Background Location Service (Keeps CPU awake & tracks when locked)
    if (window.AndroidBridge && typeof window.AndroidBridge.startLocationTracking === 'function') {
      window.AndroidBridge.startLocationTracking(activityType);

      // Register global callback for native Android service
      window.onNativeGpsUpdate = (pos: any) => {
        if (!isTrackingRef.current || isPausedRef.current) return;
        handleIngestGpsPoint(
          pos.latitude,
          pos.longitude,
          pos.altitude,
          pos.speed,
          pos.accuracy ?? 5,
          pos.bearing,
          pos.timestamp || Date.now()
        );
      };
    } else if ('geolocation' in navigator) {
      // 2. Web Geolocation watchPosition (Used when running in browser or PWA mode)
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (!isTrackingRef.current || isPausedRef.current) return;
          handleIngestGpsPoint(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.altitude ?? undefined,
            pos.coords.speed !== null && pos.coords.speed !== undefined ? pos.coords.speed * 3.6 : undefined,
            pos.coords.accuracy,
            pos.coords.heading ?? undefined,
            pos.timestamp
          );
        },
        (err) => {
          console.warn('Browser geolocation notice:', err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const stopGpsTracking = () => {
    isTrackingRef.current = false;

    // Stop native Android Foreground Service
    if (window.AndroidBridge && typeof window.AndroidBridge.stopLocationTracking === 'function') {
      window.AndroidBridge.stopLocationTracking();
    }
    window.onNativeGpsUpdate = undefined;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handlePauseResume = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
  };

  const handleFinishAndSave = () => {
    stopGpsTracking();
    setIsTracking(false);

    const avgSpeed = durationSeconds > 0 ? (distanceKm / (durationSeconds / 3600)) : 0;
    const paceStr = formatPace(distanceKm, durationSeconds);
    const { calories, heartPoints } = calculateFitMetrics(activityType, distanceKm, durationSeconds, avgSpeed);
    const elevationGainMeters = calculateElevationGain(routePoints);
    const stepsCount = estimateSteps(activityType, distanceKm);
    const splits = calculateSplits(routePoints, 100);

    const activityLog: GpsActivityLog = {
      id: `gps_${Date.now()}`,
      activityType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: startTimeRef.current,
      endTime: Date.now(),
      durationSeconds,
      distanceKm: Number(distanceKm.toFixed(2)),
      avgSpeedKmh: Number(avgSpeed.toFixed(1)),
      topSpeedKmh: Number(topSpeedKmh.toFixed(1)),
      avgPaceMinKm: paceStr,
      elevationGainMeters,
      caloriesBurned: calories,
      heartPointsEarned: heartPoints,
      stepsCount,
      splits,
      routePoints,
      milestonesReached: [],
      userId: currentProfile === 'women' ? 'women' : 'men'
    };

    // Evaluate Personal Bests & Record Badges
    const { updatedMilestones, unlocked, recordBadges } = evaluateActivityRecords(activityLog, currentMilestones);
    activityLog.milestonesReached = unlocked;
    activityLog.recordBadges = recordBadges;

    if (unlocked.length > 0) {
      setUnlockedMilestones(unlocked);
      setShowCelebration(true);
      playBeepTone(880, 300);
    }

    onSaveActivity(activityLog, updatedMilestones);

    if (onOpenFlyby) {
      onOpenFlyby(activityLog);
    } else if (onOpenSocialShare) {
      onOpenSocialShare(activityLog);
    }
  };

  // SVG route path for live mini-map visualization (memoized on routePoints length)
  const routeSvgPath = useMemo(() => {
    return generateRouteSvgPath(routePoints, 320, 160);
  }, [routePoints]);

  const avgSpeedDisplay = durationSeconds > 0 ? (distanceKm / (durationSeconds / 3600)).toFixed(1) : '0.0';

  const liveElevationGain = useMemo(() => {
    return calculateElevationGain(routePoints);
  }, [routePoints]);

  const liveSteps = estimateSteps(activityType, distanceKm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[94vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e131b] p-5 sm:p-6 shadow-2xl text-foreground font-sans flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
          <button
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white hover:border-white/20 transition"
            onClick={() => {
              stopGpsTracking();
              onClose();
            }}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary block font-display">
              GPS SATELLITE ENGINE
            </span>
            <h3 className="text-sm md:text-base font-bold text-white mt-0.5 uppercase tracking-wide font-display">
              {activityType === 'run' ? '🏃 Outdoor Run' : activityType === 'cycle' ? '🚴 Outdoor Cycling' : activityType === 'drive' ? '🚗 Road Trip' : '🚶 Fitness Walk'}
            </h3>
            {isTracking && (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    signalQuality === 'excellent'
                      ? 'bg-primary animate-pulse'
                      : signalQuality === 'good'
                      ? 'bg-dude'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[10px] font-bold text-muted-foreground font-mono">
                  {signalQuality === 'excellent'
                    ? `GPS Locked (±${accuracyMeters || 5}m)`
                    : signalQuality === 'good'
                    ? `GPS Good (±${accuracyMeters || 12}m)`
                    : 'Weak GPS (Noise Filter Active)'}
                </span>
              </div>
            )}
          </div>

          <button
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-white transition"
            onClick={() => {
              stopGpsTracking();
              onClose();
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Activity Selector & Sample Loader (when not yet started) */}
        {!isTracking && durationSeconds === 0 && (
          <div className="my-2 space-y-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {(['run', 'cycle', 'drive', 'walk'] as const).map((t) => (
                <button
                  key={t}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    activityType === t
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-white/10 bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setActivityType(t)}
                >
                  {t === 'run' ? '🏃 Run' : t === 'cycle' ? '🚴 Ride' : t === 'drive' ? '🚗 Drive' : '🚶 Walk'}
                </button>
              ))}
            </div>

            {/* Quick Sample Route Simulator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080b11] border border-white/10 text-xs flex-wrap gap-1.5">
              <span className="text-muted-foreground text-[10px] font-semibold">Demo Route:</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => {
                    const sample = generateSampleGpsActivity('marine_run');
                    onSaveActivity(sample, currentMilestones);
                    if (onOpenFlyby) onOpenFlyby(sample);
                    else if (onOpenSocialShare) onOpenSocialShare(sample);
                  }}
                  className="text-[10px] font-bold py-1 px-2.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition"
                >
                  🏃 5.2k Run
                </button>
                <button
                  onClick={() => {
                    const sample = generateSampleGpsActivity('coastal_cycle');
                    onSaveActivity(sample, currentMilestones);
                    if (onOpenFlyby) onOpenFlyby(sample);
                    else if (onOpenSocialShare) onOpenSocialShare(sample);
                  }}
                  className="text-[10px] font-bold py-1 px-2.5 rounded-lg border border-[#fc4c02]/30 bg-[#fc4c02]/10 text-[#ff9667] hover:bg-[#fc4c02]/20 transition"
                >
                  🚴 22.5k Ride
                </button>
                <button
                  onClick={() => {
                    const sample = generateSampleGpsActivity('express_drive');
                    onSaveActivity(sample, currentMilestones);
                    if (onOpenFlyby) onOpenFlyby(sample);
                    else if (onOpenSocialShare) onOpenSocialShare(sample);
                  }}
                  className="text-[10px] font-bold py-1 px-2.5 rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-400 hover:bg-sky-400/20 transition"
                >
                  🚗 48k Drive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GPS Error Alert */}
        {gpsError && (
          <div className="bg-dude/10 border border-dude/30 p-3 rounded-xl text-[11px] text-dude my-2 leading-relaxed">
            {gpsError}
          </div>
        )}

        {/* MAIN LIVE METRICS DISPLAY */}
        <div className="text-center my-3">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-0.5 font-display">
            DISTANCE COVERED
          </div>
          <div className="text-5xl md:text-6xl font-extrabold text-white font-mono leading-none tracking-tight">
            {distanceKm.toFixed(2)}
            <span className="text-2xl text-primary font-normal ml-1">km</span>
          </div>

          {/* Time & Pace Sub-Grid */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 bg-[#121824] p-3 rounded-xl border border-white/5">
            <div>
              <div className="text-[8px] text-muted-foreground font-bold uppercase">TIME</div>
              <div className="text-xs md:text-sm font-bold text-white font-mono mt-0.5">
                {formatDuration(durationSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-muted-foreground font-bold uppercase">PACE</div>
              <div className="text-xs md:text-sm font-bold text-primary font-mono mt-0.5">
                {formatPace(distanceKm, durationSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-muted-foreground font-bold uppercase">SPEED</div>
              <div className="text-xs md:text-sm font-bold text-emerald-400 font-mono mt-0.5">
                {currentSpeedKmh > 0 ? `${currentSpeedKmh}k` : `${avgSpeedDisplay}k`}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-muted-foreground font-bold uppercase">ASCENT</div>
              <div className="text-xs md:text-sm font-bold text-dude font-mono mt-0.5 flex items-center justify-center gap-0.5">
                <Mountain size={10} className="text-dude" />
                <span>+{liveElevationGain}m</span>
              </div>
            </div>

            <div>
              <div className="text-[8px] text-muted-foreground font-bold uppercase">STEPS</div>
              <div className="text-xs md:text-sm font-bold text-sky-400 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                <Footprints size={10} className="text-sky-400" />
                <span>{liveSteps.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE ROUTE MINI-MAP */}
        <div className="bg-[#080b11] rounded-2xl border border-white/10 p-3 my-2 flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden shadow-inner">
          {routePoints.length >= 2 ? (
            <svg width="300" height="130" className="overflow-visible">
              <path
                d={routeSvgPath}
                fill="none"
                stroke="rgba(204, 255, 0, 0.25)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#ccff00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="text-center py-4">
              <Compass size={24} className="text-primary mx-auto animate-spin mb-1 opacity-70" />
              <p className="text-xs text-muted-foreground font-semibold">
                {isTracking ? 'Acquiring GPS coordinates…' : 'Press Start to begin tracking your live route.'}
              </p>
            </div>
          )}

          {isTracking && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#121824] px-2 py-0.5 rounded-full border border-primary/30 text-[9px] text-primary font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>LIVE GPS</span>
            </div>
          )}
        </div>

        {/* ACTION CONTROLS */}
        <div className="my-2">
          {!isTracking && durationSeconds === 0 ? (
            <button
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2"
              onClick={startGpsTracking}
            >
              <Play size={16} fill="currentColor" />
              <span>Start Recording {activityType.toUpperCase()}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2.5">
              <button
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  isPaused
                    ? 'border-dude bg-dude/10 text-dude'
                    : 'border-white/10 bg-white/5 text-muted-foreground hover:text-white'
                }`}
                onClick={handlePauseResume}
              >
                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition flex items-center justify-center gap-1.5 shadow-md"
                onClick={handleFinishAndSave}
              >
                <StopCircle size={15} />
                <span>Finish & Flyby</span>
              </button>
            </div>
          )}
        </div>

        {/* Milestone Celebration Banner */}
        {showCelebration && (
          <div className="bg-dude/15 border border-dude/40 p-3 rounded-2xl text-center my-2 animate-scale-up">
            <Trophy size={20} className="text-dude mx-auto mb-1" />
            <h4 className="text-xs font-black text-dude uppercase font-display">Personal Record Unlocked!</h4>
            <div className="text-[11px] text-white mt-1">
              {unlockedMilestones.map((m, i) => (
                <div key={i}>{m}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
