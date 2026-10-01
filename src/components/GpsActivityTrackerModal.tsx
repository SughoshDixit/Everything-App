import React, { useState, useEffect, useRef } from 'react';
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
      setRoutePoints([...filterStateRef.current.points]);

      setCurrentSpeedKmh(result.calculatedSpeedKmh);
      if (result.calculatedSpeedKmh > 0) {
        setTopSpeedKmh((top) => Math.max(top, result.calculatedSpeedKmh));
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
    }

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

    // 2. Web Geolocation watchPosition (Fallback for browser / desktop)
    if ('geolocation' in navigator) {
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

  // SVG route path for live mini-map visualization
  const routeSvgPath = generateRouteSvgPath(routePoints, 320, 160);
  const avgSpeedDisplay = durationSeconds > 0 ? (distanceKm / (durationSeconds / 3600)).toFixed(1) : '0.0';
  const liveElevationGain = calculateElevationGain(routePoints);
  const liveSteps = estimateSteps(activityType, distanceKm);

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-content google-card animate-scale-up max-w-md w-full max-h-[94vh] overflow-y-auto p-5 md:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-2">
          <button
            className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={() => {
              stopGpsTracking();
              onClose();
            }}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              GPS LIVE TRACKER
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5 uppercase tracking-wide">
              {activityType === 'run' ? '🏃 Outdoor Run' : activityType === 'cycle' ? '🚴 Outdoor Cycling' : activityType === 'drive' ? '🚗 Car Road Trip' : '🚶 Fitness Walk'}
            </h3>
            {isTracking && (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    signalQuality === 'excellent'
                      ? 'bg-emerald-500 animate-pulse'
                      : signalQuality === 'good'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[10px] font-bold text-sub">
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
            className="btn-google-icon"
            onClick={() => {
              stopGpsTracking();
              onClose();
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Activity Selector & Sample Loader (when not yet started) */}
        {!isTracking && durationSeconds === 0 && (
          <div className="my-2">
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <button
                className={activityType === 'run' ? 'btn-google-primary text-xs py-2' : 'btn-google-outlined text-xs py-2'}
                onClick={() => setActivityType('run')}
              >
                🏃 Run
              </button>
              <button
                className={activityType === 'cycle' ? 'btn-google-primary text-xs py-2' : 'btn-google-outlined text-xs py-2'}
                onClick={() => setActivityType('cycle')}
              >
                🚴 Cycle
              </button>
              <button
                className={activityType === 'drive' ? 'btn-google-primary text-xs py-2' : 'btn-google-outlined text-xs py-2'}
                onClick={() => setActivityType('drive')}
              >
                🚗 Drive
              </button>
              <button
                className={activityType === 'walk' ? 'btn-google-primary text-xs py-2' : 'btn-google-outlined text-xs py-2'}
                onClick={() => setActivityType('walk')}
              >
                🚶 Walk
              </button>
            </div>

            {/* Quick Sample Route Simulator for instant testing */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-glass text-xs flex-wrap gap-1">
              <span className="text-sub text-[11px] font-semibold">Instant Sample Demo:</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => {
                    const sample = generateSampleGpsActivity('marine_run');
                    onSaveActivity(sample, currentMilestones);
                    if (onOpenFlyby) onOpenFlyby(sample);
                    else if (onOpenSocialShare) onOpenSocialShare(sample);
                  }}
                  className="text-[10px] font-bold py-1 px-2 rounded-full bg-[#55198B]/20 text-[#c084fc] hover:bg-[#55198B] hover:text-white transition-all cursor-pointer"
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
                  className="text-[10px] font-bold py-1 px-2 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
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
                  className="text-[10px] font-bold py-1 px-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
                >
                  🚗 48k Drive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GPS Error Alert */}
        {gpsError && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-[11px] text-amber-600 dark:text-amber-300 my-2 leading-relaxed">
            {gpsError}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MAIN LIVE METRICS DISPLAY (GOOGLE FIT INDUSTRIAL STYLE) */}
        {/* ------------------------------------------------------------------- */}
        <div className="text-center my-3">
          {/* Big Distance Display */}
          <div className="text-xs font-bold tracking-widest text-sub uppercase mb-0.5">DISTANCE COVERED</div>
          <div className="text-5xl md:text-6xl font-black text-main font-mono leading-none tracking-tight">
            {distanceKm.toFixed(2)}
            <span className="text-2xl text-[#55198B] dark:text-[#c084fc] font-normal ml-1">km</span>
          </div>

          {/* Time & Pace Sub-Grid */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 bg-card p-2.5 rounded-2xl border border-glass">
            <div>
              <div className="text-[8px] text-sub font-bold uppercase">TIME</div>
              <div className="text-xs md:text-sm font-black text-main font-mono mt-0.5">
                {formatDuration(durationSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-sub font-bold uppercase">PACE</div>
              <div className="text-xs md:text-sm font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">
                {formatPace(distanceKm, durationSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-sub font-bold uppercase">SPEED</div>
              <div className="text-xs md:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {currentSpeedKmh > 0 ? `${currentSpeedKmh}k` : `${avgSpeedDisplay}k`}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-sub font-bold uppercase">ASCENT</div>
              <div className="text-xs md:text-sm font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                <Mountain size={10} className="text-amber-500" />
                <span>+{liveElevationGain}m</span>
              </div>
            </div>

            <div>
              <div className="text-[8px] text-sub font-bold uppercase">STEPS</div>
              <div className="text-xs md:text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                <Footprints size={10} className="text-indigo-500" />
                <span>{liveSteps.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* LIVE ROUTE MINI-MAP (SVG VECTOR PATH) */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-black/95 rounded-2xl border border-glass p-3 my-2 flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden shadow-inner">
          {routePoints.length >= 2 ? (
            <svg width="300" height="130" className="overflow-visible">
              <path
                d={routeSvgPath}
                fill="none"
                stroke="rgba(85, 25, 139, 0.4)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#c084fc"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="text-center py-4">
              <Compass className="icon-md text-[#55198B] dark:text-[#c084fc] mx-auto animate-spin-slow mb-1" />
              <p className="text-xs text-slate-400 font-semibold">
                {isTracking ? 'Acquiring GPS Route coordinates...' : 'Press Start to begin tracking your live route.'}
              </p>
            </div>
          )}

          {isTracking && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-700 text-[10px] text-emerald-400 font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE GPS</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* ACTION CONTROLS */}
        {/* ------------------------------------------------------------------- */}
        <div className="my-2">
          {!isTracking && durationSeconds === 0 ? (
            <button
              className="btn-google-primary w-full py-3.5 text-sm uppercase tracking-wider"
              onClick={startGpsTracking}
            >
              <Play size={18} fill="currentColor" />
              <span>Start Recording {activityType.toUpperCase()}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <button
                className={`btn-google-tonal flex-1 py-3 text-xs uppercase tracking-wider ${
                  isPaused ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : ''
                }`}
                onClick={handlePauseResume}
              >
                {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                className="btn-google-primary flex-1 py-3 text-xs uppercase tracking-wider !bg-rose-600 text-white hover:!bg-rose-500 shadow-md"
                onClick={handleFinishAndSave}
              >
                <StopCircle size={16} />
                <span>Finish & Flyby</span>
              </button>
            </div>
          )}
        </div>

        {/* Milestone Celebration Banner */}
        {showCelebration && (
          <div className="bg-amber-500/15 border border-amber-400/40 p-3 rounded-2xl text-center my-2 animate-scale-up">
            <Trophy className="icon-md text-amber-500 mx-auto mb-1" />
            <h4 className="text-xs font-black text-amber-600 dark:text-amber-300 uppercase">Personal Record Unlocked!</h4>
            <div className="text-[11px] text-main mt-1">
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
