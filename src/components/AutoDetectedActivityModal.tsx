import React, { useState, useEffect } from 'react';
import {
  Activity,
  Check,
  Trash2,
  Clock,
  Flame,
  Sparkles,
  MapPin,
  X,
  Compass,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import type { AutoDetectedActivity, GpsActivityLog } from '../types';
import { autoActivityDetectionService } from '../services/autoActivityDetectionService';

const triggerHaptic = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics not supported or permitted
    }
  }
};

interface AutoDetectedActivityModalProps {
  initialActivities?: AutoDetectedActivity[];
  userPersona?: 'men' | 'women';
  onConfirmActivity: (log: GpsActivityLog) => void;
  onClose: () => void;
}

export const AutoDetectedActivityModal: React.FC<AutoDetectedActivityModalProps> = ({
  initialActivities,
  userPersona = 'men',
  onConfirmActivity,
  onClose
}) => {
  const [activities, setActivities] = useState<AutoDetectedActivity[]>(initialActivities || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Editable overrides for active card
  const [selectedType, setSelectedType] = useState<'run' | 'walk' | 'cycle' | 'football' | 'badminton' | 'workout'>('run');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState<string>('');

  useEffect(() => {
    if (!initialActivities || initialActivities.length === 0) {
      loadActivities();
    }
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const list = await autoActivityDetectionService.getPendingActivities();
      setActivities(list);
      if (list.length > 0) {
        initCurrentCard(list[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentActivity: AutoDetectedActivity | undefined = activities[currentIndex];

  const initCurrentCard = (act: AutoDetectedActivity) => {
    setSelectedType(act.activityType as any);
    setCustomDistanceKm(act.distanceKm);
    setCustomTitle(act.suggestedTitle);
  };

  useEffect(() => {
    if (currentActivity) {
      initCurrentCard(currentActivity);
    }
  }, [currentIndex, activities]);

  const handleConfirm = async () => {
    if (!currentActivity) return;
    triggerHaptic([40, 80, 40]);

    // Build finalized activity with user overrides
    const updated: AutoDetectedActivity = {
      ...currentActivity,
      activityType: selectedType,
      distanceKm: customDistanceKm > 0 ? customDistanceKm : currentActivity.distanceKm,
      suggestedTitle: customTitle.trim() || currentActivity.suggestedTitle
    };

    const gpsLog = autoActivityDetectionService.convertAutoDetectedToGpsLog(updated, userPersona);
    await autoActivityDetectionService.confirmActivity(currentActivity.id);

    // Speak announcement if native TTS exists
    if (typeof window !== 'undefined' && window.AndroidBridge?.speakText) {
      window.AndroidBridge.speakText(
        `Missed workout recovered! ${gpsLog.distanceKm} kilometers logged to your discipline streak.`
      );
    }

    onConfirmActivity(gpsLog);

    // Move to next or close if empty
    const remaining = activities.filter((a) => a.id !== currentActivity.id);
    setActivities(remaining);
    if (remaining.length === 0) {
      onClose();
    } else {
      setCurrentIndex((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  const handleDiscard = async () => {
    if (!currentActivity) return;
    triggerHaptic([30]);
    await autoActivityDetectionService.discardActivity(currentActivity.id);

    const remaining = activities.filter((a) => a.id !== currentActivity.id);
    setActivities(remaining);
    if (remaining.length === 0) {
      onClose();
    } else {
      setCurrentIndex((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  const handleSimulate = async (type: 'run' | 'football' | 'cycle' | 'walk') => {
    setSimulating(true);
    triggerHaptic([50]);
    try {
      const dist = type === 'run' ? 4.35 : type === 'cycle' ? 14.2 : type === 'walk' ? 2.8 : 5.1;
      const duration = type === 'run' ? 27 : type === 'cycle' ? 38 : type === 'walk' ? 32 : 45;
      const simulated = await autoActivityDetectionService.simulateMissedWorkout(type, duration, dist);
      setActivities((prev) => [simulated, ...prev]);
      setCurrentIndex(0);
      initCurrentCard(simulated);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#12161f] shadow-2xl">
        {/* TOP ACCENT GLOW */}
        <div className="absolute -top-24 left-1/2 h-44 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary">
              <Compass className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  Passive Activity Recovered
                </h3>
                {activities.length > 1 && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {currentIndex + 1} of {activities.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Continuous movement detected while app was closed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Scanning background sensor buffer...</p>
            </div>
          ) : !currentActivity ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-muted-foreground">
                <Activity className="h-8 w-8 opacity-40" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">No Missed Workouts Pending</h4>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  The background cadence detector continuously listens for runs, rides, walks, and matches.
                </p>
              </div>

              {/* SIMULATION TEST PANEL */}
              <div className="w-full mt-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    ⚡ Test Auto-Detection Now
                  </span>
                  <span className="text-[10px] text-muted-foreground">1-Tap Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={simulating}
                    onClick={() => handleSimulate('run')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 px-3 text-xs font-semibold text-white hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <span>🏃</span> Simulate 4.3km Run
                  </button>
                  <button
                    disabled={simulating}
                    onClick={() => handleSimulate('football')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 px-3 text-xs font-semibold text-white hover:bg-[#ccff00]/20 hover:text-[#ccff00] transition-colors"
                  >
                    <span>⚽</span> Football Match
                  </button>
                  <button
                    disabled={simulating}
                    onClick={() => handleSimulate('cycle')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 px-3 text-xs font-semibold text-white hover:bg-sky-500/20 hover:text-sky-400 transition-colors"
                  >
                    <span>🚴</span> 14km Bike Ride
                  </button>
                  <button
                    disabled={simulating}
                    onClick={() => handleSimulate('walk')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 px-3 text-xs font-semibold text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                  >
                    <span>🚶</span> Power Walk
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* STATUS & CONFIDENCE PILL */}
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-primary">
                    {currentActivity.confidenceScore}% Algorithm Confidence
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {new Date(currentActivity.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* ACTIVITY TYPE SELECTOR TABS */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Workout Classification
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { id: 'run', label: 'Run', icon: '🏃' },
                    { id: 'walk', label: 'Walk', icon: '🚶' },
                    { id: 'football', label: 'Match', icon: '⚽' },
                    { id: 'cycle', label: 'Cycle', icon: '🚴' },
                    { id: 'badminton', label: 'Badminton', icon: '🏸' },
                    { id: 'workout', label: 'Drills', icon: '💪' }
                  ].map((tab) => {
                    const active = selectedType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedType(tab.id as any)}
                        className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-center transition-all ${
                          active
                            ? 'bg-primary text-black font-extrabold shadow-lg shadow-primary/25'
                            : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{tab.icon}</span>
                        <span className="text-[10px] tracking-tight">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STATS HIGHLIGHT GRID */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-black text-white font-mono">
                    {Math.round(currentActivity.durationSeconds / 60)}m
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Duration</div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-black text-white font-mono">
                    {customDistanceKm > 0 ? customDistanceKm.toFixed(2) : currentActivity.distanceKm.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Kilometers</div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-sky-400" />
                  <div className="text-lg font-black text-white font-mono">
                    {currentActivity.avgCadenceSpm}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Avg SPM</div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <Flame className="h-4 w-4 mx-auto mb-1 text-rose-400" />
                  <div className="text-lg font-black text-white font-mono">
                    {currentActivity.estimatedCalories}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Calories</div>
                </div>
              </div>

              {/* DISTANCE & TITLE FINE-TUNING */}
              <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Workout Title
                    </label>
                  </div>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Morning 5K Pace Recovery"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Fine-Tune Distance (km)
                    </label>
                    <span className="text-[11px] font-mono text-primary font-bold">
                      {customDistanceKm} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomDistanceKm((prev) => Math.max(0.2, Math.round((prev - 0.2) * 10) / 10))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={0.5}
                      max={25.0}
                      step={0.1}
                      value={customDistanceKm}
                      onChange={(e) => setCustomDistanceKm(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomDistanceKm((prev) => Math.round((prev + 0.2) * 10) / 10)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* ALGORITHM NOTE */}
              <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Adding this session will automatically update your daily discipline streak, calculate heart points, and compile into your end-of-day shareable recap post.
                </p>
              </div>
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {currentActivity && (
          <div className="flex items-center justify-between border-t border-white/10 p-5 bg-[#0e1218]">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Discard
            </button>

            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              Confirm & Add to Activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
