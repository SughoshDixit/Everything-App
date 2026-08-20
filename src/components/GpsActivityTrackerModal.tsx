import React, { useState, useEffect, useRef } from 'react';
import type { GpsActivityLog, GpsLocationPoint, PersonalMilestones, UserProfile } from '../types';
import {
  calculateDistanceKm,
  formatDuration,
  formatPace,
  calculateFitMetrics,
  evaluateMilestones,
  defaultMilestones,
  generateRouteSvgPath,
  calculateElevationGain,
  calculateSplits,
  estimateSteps
} from '../utils/milestonesTracker';
import { playBeepTone } from '../utils/audioCoach';
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
  initialActivityType?: 'run' | 'cycle' | 'walk';
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
  const [activityType, setActivityType] = useState<'run' | 'cycle' | 'walk'>(initialActivityType);
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

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // ---------------------------------------------------------------------------
  // 1. DURATION TIMER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused]);

  // ---------------------------------------------------------------------------
  // 2. REAL-TIME GPS WATCH POSITION
  // ---------------------------------------------------------------------------
  const startGpsTracking = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint: GpsLocationPoint = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude ?? undefined,
          timestamp: pos.timestamp,
          speed: pos.coords.speed ?? undefined,
          accuracy: pos.coords.accuracy
        };

        setRoutePoints((prev) => {
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const segmentDist = calculateDistanceKm(
              lastPoint.latitude,
              lastPoint.longitude,
              newPoint.latitude,
              newPoint.longitude
            );

            // Filter GPS jitter (< 2 meters)
            if (segmentDist > 0.002) {
              setDistanceKm((d) => Number((d + segmentDist).toFixed(3)));

              // Calculate speed (km/h)
              const timeDiffHours = (newPoint.timestamp - lastPoint.timestamp) / (1000 * 3600);
              if (timeDiffHours > 0) {
                const speed = segmentDist / timeDiffHours;
                if (speed < 70) {
                  setCurrentSpeedKmh(Number(speed.toFixed(1)));
                  setTopSpeedKmh((top) => Math.max(top, Number(speed.toFixed(1))));
                }
              }
            }
          }
          return [...prev, newPoint];
        });
      },
      (err) => {
        setGpsError(`GPS Signal Notice: ${err.message}. Ensure location permissions are enabled.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
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

    // Evaluate Personal Bests
    const { updatedMilestones, unlocked } = evaluateMilestones(activityLog, currentMilestones);
    activityLog.milestonesReached = unlocked;

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
      <div className="modal-content oled-workout-player animate-scale-up max-w-md w-full max-h-[94vh] overflow-y-auto p-4 md:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-2">
          <button
            className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1.5 px-3"
            onClick={() => {
              stopGpsTracking();
              onClose();
            }}
          >
            <ChevronLeft size={16} />
            <span>Exit</span>
          </button>

          <div className="text-center">
            <span className="oled-badge-lime text-[10px]">GPS LIVE TRACKER</span>
            <h3 className="text-sm md:text-base font-black text-white mt-0.5 uppercase tracking-wide">
              {activityType === 'run' ? '🏃 Outdoor Run' : activityType === 'cycle' ? '🚴 Outdoor Cycling' : '🚶 Fitness Walk'}
            </h3>
          </div>

          <button
            className="btn-close"
            onClick={() => {
              stopGpsTracking();
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Activity Selector (when not yet started) */}
        {!isTracking && durationSeconds === 0 && (
          <div className="flex items-center justify-center gap-2 my-3">
            <button
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                activityType === 'run' ? 'bg-cyan-500 text-black border-cyan-400 font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
              onClick={() => setActivityType('run')}
            >
              🏃 Run
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                activityType === 'cycle' ? 'bg-cyan-500 text-black border-cyan-400 font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
              onClick={() => setActivityType('cycle')}
            >
              🚴 Cycle
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                activityType === 'walk' ? 'bg-cyan-500 text-black border-cyan-400 font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
              onClick={() => setActivityType('walk')}
            >
              🚶 Walk
            </button>
          </div>
        )}

        {/* GPS Error Alert */}
        {gpsError && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-[11px] text-amber-300 my-2 leading-relaxed">
            {gpsError}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MAIN LIVE METRICS DISPLAY (GOOGLE FIT INDUSTRIAL STYLE) */}
        {/* ------------------------------------------------------------------- */}
        <div className="text-center my-3">
          {/* Big Distance Display */}
          <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-0.5">DISTANCE COVERED</div>
          <div className="text-5xl md:text-6xl font-black text-white font-mono leading-none tracking-tight">
            {distanceKm.toFixed(2)}
            <span className="text-2xl text-lime-400 font-normal ml-1">km</span>
          </div>

          {/* Time & Pace Sub-Grid */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-900">
            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase">TIME</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">
                {formatDuration(durationSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase">PACE</div>
              <div className="text-xs md:text-sm font-black text-cyan-400 font-mono mt-0.5">
                {formatPace(distanceKm, durationSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase">SPEED</div>
              <div className="text-xs md:text-sm font-black text-lime-400 font-mono mt-0.5">
                {currentSpeedKmh > 0 ? `${currentSpeedKmh}k` : `${avgSpeedDisplay}k`}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase">ASCENT</div>
              <div className="text-xs md:text-sm font-black text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                <Mountain size={10} className="text-amber-400" />
                <span>+{liveElevationGain}m</span>
              </div>
            </div>

            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase">STEPS</div>
              <div className="text-xs md:text-sm font-black text-emerald-400 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                <Footprints size={10} className="text-emerald-400" />
                <span>{liveSteps.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* LIVE ROUTE MINI-MAP (SVG VECTOR PATH) */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-black/90 rounded-2xl border border-zinc-900 p-3 my-2 flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden">
          {routePoints.length >= 2 ? (
            <svg width="300" height="130" className="overflow-visible">
              <path
                d={routeSvgPath}
                fill="none"
                stroke="rgba(6, 182, 212, 0.3)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#CCFF00"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="text-center py-4">
              <Compass className="icon-md text-cyan-400 mx-auto animate-spin-slow mb-1" />
              <p className="text-xs text-zinc-400 font-semibold">
                {isTracking ? 'Acquiring GPS Route coordinates...' : 'Press Start to begin tracking your live route.'}
              </p>
            </div>
          )}

          {isTracking && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800 text-[10px] text-emerald-400 font-bold">
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
              className="btn-primary w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wider text-sm py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 pulse-glow"
              onClick={startGpsTracking}
            >
              <Play size={20} fill="#000" />
              <span>Start Recording {activityType.toUpperCase()}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <button
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isPaused
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800'
                }`}
                onClick={handlePauseResume}
              >
                {isPaused ? <Play size={16} fill="#000" /> : <Pause size={16} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 flex items-center justify-center gap-2 shadow-lg"
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
          <div className="bg-amber-500/20 border border-amber-400 p-3 rounded-xl text-center my-2 animate-scale-up">
            <Trophy className="icon-md text-amber-400 mx-auto mb-1" />
            <h4 className="text-xs font-black text-amber-300 uppercase">Personal Record Unlocked!</h4>
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
