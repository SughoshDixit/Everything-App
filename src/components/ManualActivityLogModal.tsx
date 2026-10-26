import React, { useState } from 'react';
import type {
  GpsActivityLog,
  WorkoutSessionLog,
  UserProfile,
  SocialShareCardData
} from '../types';
import { awardDisciplinePoints } from '../services/tacticalRoutineService';
import {
  X,
  Trophy,
  Dumbbell,
  Activity,
  Flame,
  CheckCircle2,
  Share2,
  Plus,
  Minus
} from 'lucide-react';

export type ManualCategory = 'badminton' | 'football' | 'calisthenics' | 'cardio' | 'mobility';

interface ManualActivityLogModalProps {
  initialCategory?: ManualCategory;
  currentProfile: UserProfile;
  onSaveWorkoutLog: (log: Omit<WorkoutSessionLog, 'id' | 'date'>) => void;
  onSaveActivityLog: (act: GpsActivityLog) => void;
  onOpenShareCard?: (data: SocialShareCardData) => void;
  onClose: () => void;
}

const CALISTHENICS_PRESETS = [
  'Standard Push-Ups',
  'Diamond Push-Ups',
  'Strict Pull-Ups',
  'Chest Dips',
  'Bodyweight Squats',
  'Plank Hold',
  'Knee Push-Ups',
  'Hollow Body Hold'
];

export const ManualActivityLogModal: React.FC<ManualActivityLogModalProps> = ({
  initialCategory = 'calisthenics',
  currentProfile,
  onSaveWorkoutLog,
  onSaveActivityLog,
  onOpenShareCard,
  onClose,
}) => {
  const [category, setCategory] = useState<ManualCategory>(initialCategory);
  const [successSaved, setSuccessSaved] = useState<boolean>(false);
  const [savedDataSummary, setSavedDataSummary] = useState<{ title: string; details: string } | null>(null);

  // Common Fields
  const [notes, setNotes] = useState<string>('');
  const [rpe, setRpe] = useState<number>(8); // 1-10

  // 1. Badminton State
  const [badmintonFormat, setBadmintonFormat] = useState<'Singles' | 'Doubles' | 'Rally Drills'>('Singles');
  const [badmintonDuration, setBadmintonDuration] = useState<number>(45);
  const [badmintonScore, setBadmintonScore] = useState<string>('Won 2-1 (21-18, 19-21, 21-16)');
  const [badmintonIntensity, setBadmintonIntensity] = useState<'Casual' | 'Competitive' | 'High Intensity'>('Competitive');

  // 2. Football State
  const [footballFormat, setFootballFormat] = useState<'5-a-side' | '7-a-side' | '11-a-side' | 'Pitch Training'>('7-a-side');
  const [footballDuration, setFootballDuration] = useState<number>(60);
  const [footballPosition, setFootballPosition] = useState<string>('Right Winger');
  const [footballGoals, setFootballGoals] = useState<number>(1);
  const [footballAssists, setFootballAssists] = useState<number>(1);

  // 3. Calisthenics State
  const [selectedExercise, setSelectedExercise] = useState<string>('Standard Push-Ups');
  const [calisthenicsMode, setCalisthenicsMode] = useState<'quick_single' | 'multi_set'>('quick_single');
  const [quickReps, setQuickReps] = useState<number>(15);
  const [setsCount, setSetsCount] = useState<number>(3);
  const [repsArray, setRepsArray] = useState<number[]>([15, 12, 10]);
  const [isPR, setIsPR] = useState<boolean>(false);

  // 4. Cardio / Run / Ride State
  const [cardioType, setCardioType] = useState<'run' | 'walk' | 'cycle'>('run');
  const [cardioDistance, setCardioDistance] = useState<number>(5.0);
  const [cardioDuration, setCardioDuration] = useState<number>(25);

  const calculateBadmintonCalories = (mins: number, intensity: string) => {
    const factor = intensity === 'High Intensity' ? 9.5 : intensity === 'Competitive' ? 8.0 : 6.0;
    return Math.round(mins * factor);
  };

  const calculateFootballCalories = (mins: number) => {
    return Math.round(mins * 9.0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const todayIso = new Date().toISOString().slice(0, 10);
    const nowTime = Date.now();

    if (category === 'calisthenics') {
      const finalSets = calisthenicsMode === 'quick_single' ? 1 : setsCount;
      const finalReps = calisthenicsMode === 'quick_single' ? [quickReps] : repsArray.slice(0, setsCount);
      const totalReps = finalReps.reduce((a, b) => a + b, 0);

      onSaveWorkoutLog({
        userId: currentProfile === 'women' ? 'women' : 'men',
        exerciseId: `manual_${selectedExercise.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        exerciseName: selectedExercise,
        setsCompleted: finalSets,
        repsCompleted: finalReps,
        perceivedExertion: rpe,
        notes: notes.trim() || `Manual Calisthenics Set: ${totalReps} total reps.`,
        personalRecordBroken: isPR
      });

      awardDisciplinePoints(30);
      setSavedDataSummary({
        title: `💪 ${selectedExercise}`,
        details: `${finalSets} Set${finalSets > 1 ? 's' : ''} • ${totalReps} Total Reps • RPE ${rpe}`
      });
      setSuccessSaved(true);
    } else if (category === 'badminton') {
      const cals = calculateBadmintonCalories(badmintonDuration, badmintonIntensity);
      const activityLog: GpsActivityLog = {
        id: `manual_badminton_${nowTime}`,
        title: `🏸 Badminton ${badmintonFormat} Match`,
        activityType: 'badminton',
        date: todayIso,
        startTime: nowTime - badmintonDuration * 60 * 1000,
        endTime: nowTime,
        durationSeconds: badmintonDuration * 60,
        distanceKm: 0,
        avgSpeedKmh: 0,
        topSpeedKmh: 0,
        avgPaceMinKm: '0:00 /km',
        elevationGainMeters: 0,
        caloriesBurned: cals,
        heartPointsEarned: Math.round(badmintonDuration * 1.5),
        stepsCount: badmintonDuration * 95,
        splits: [],
        routePoints: [],
        milestonesReached: [],
        userId: currentProfile === 'women' ? 'women' : 'men',
        notes: `${badmintonScore}. ${notes}`.trim()
      };

      onSaveActivityLog(activityLog);
      awardDisciplinePoints(40);
      setSavedDataSummary({
        title: `🏸 Badminton (${badmintonFormat})`,
        details: `${badmintonDuration} mins • ${badmintonScore} • ~${cals} kcal`
      });
      setSuccessSaved(true);
    } else if (category === 'football') {
      const cals = calculateFootballCalories(footballDuration);
      const activityLog: GpsActivityLog = {
        id: `manual_football_${nowTime}`,
        title: `⚽ Football ${footballFormat} (${footballPosition})`,
        activityType: 'football',
        date: todayIso,
        startTime: nowTime - footballDuration * 60 * 1000,
        endTime: nowTime,
        durationSeconds: footballDuration * 60,
        distanceKm: 0,
        avgSpeedKmh: 0,
        topSpeedKmh: 0,
        avgPaceMinKm: '0:00 /km',
        elevationGainMeters: 0,
        caloriesBurned: cals,
        heartPointsEarned: Math.round(footballDuration * 1.8),
        stepsCount: footballDuration * 110,
        splits: [],
        routePoints: [],
        milestonesReached: [],
        userId: currentProfile === 'women' ? 'women' : 'men',
        notes: `Position: ${footballPosition} | Goals: ${footballGoals}, Assists: ${footballAssists}. ${notes}`.trim()
      };

      onSaveActivityLog(activityLog);
      awardDisciplinePoints(45);
      setSavedDataSummary({
        title: `⚽ Football Match (${footballFormat})`,
        details: `${footballDuration} mins • ${footballGoals}G / ${footballAssists}A • ~${cals} kcal`
      });
      setSuccessSaved(true);
    } else if (category === 'cardio') {
      const paceMinutes = cardioDistance > 0 ? cardioDuration / cardioDistance : 0;
      const paceMin = Math.floor(paceMinutes);
      const paceSec = Math.round((paceMinutes - paceMin) * 60);
      const paceStr = `${paceMin}:${String(paceSec).padStart(2, '0')} /km`;

      const activityLog: GpsActivityLog = {
        id: `manual_${cardioType}_${nowTime}`,
        title: `Manual ${cardioType.toUpperCase()}: ${cardioDistance} km`,
        activityType: cardioType,
        date: todayIso,
        startTime: nowTime - cardioDuration * 60 * 1000,
        endTime: nowTime,
        durationSeconds: cardioDuration * 60,
        distanceKm: cardioDistance,
        avgSpeedKmh: cardioDuration > 0 ? Number(((cardioDistance / cardioDuration) * 60).toFixed(1)) : 0,
        topSpeedKmh: 0,
        avgPaceMinKm: paceStr,
        elevationGainMeters: 15,
        caloriesBurned: Math.round(cardioDistance * 65),
        heartPointsEarned: Math.round(cardioDuration * 1.2),
        stepsCount: Math.round(cardioDistance * 1350),
        splits: [],
        routePoints: [],
        milestonesReached: [],
        userId: currentProfile === 'women' ? 'women' : 'men',
        notes: notes.trim()
      };

      onSaveActivityLog(activityLog);
      awardDisciplinePoints(35);
      setSavedDataSummary({
        title: `🏃 ${cardioDistance}k ${cardioType.toUpperCase()}`,
        details: `${cardioDuration} mins • ${paceStr}`
      });
      setSuccessSaved(true);
    }
  };

  const handleLaunchShareStudio = () => {
    if (!onOpenShareCard || !savedDataSummary) return;
    const cardData: SocialShareCardData = {
      title: savedDataSummary.title,
      workoutType: category.toUpperCase(),
      stats: [
        { label: 'Activity Details', value: savedDataSummary.details },
        { label: 'Exertion (RPE)', value: `${rpe}/10` }
      ],
      motivationalQuote: 'Discipline equals freedom! - Jocko Willink',
      quoteAuthor: 'Commander Iron',
      streakDays: 14,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      persona: currentProfile
    };
    onOpenShareCard(cardData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FC5200] to-[#ff7b39] text-white shadow-md">
              <Activity size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#CCFF00]">
                Quick Entry Ledger
              </span>
              <h3 className="text-base font-black text-white">Log Athletic Activity</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        {!successSaved && (
          <div className="flex overflow-x-auto border-b border-white/10 bg-black/30 p-2 gap-1.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setCategory('calisthenics')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                category === 'calisthenics'
                  ? 'bg-primary text-black shadow-md'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Dumbbell size={14} />
              <span>💪 Push-ups & Reps</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('badminton')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                category === 'badminton'
                  ? 'bg-[#CCFF00] text-black shadow-md'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Trophy size={14} />
              <span>🏸 Badminton</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('football')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                category === 'football'
                  ? 'bg-[#FC5200] text-white shadow-md'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Flame size={14} />
              <span>⚽ Football</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('cardio')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                category === 'cardio'
                  ? 'bg-sky-400 text-black shadow-md'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Activity size={14} />
              <span>🏃 Run / Walk</span>
            </button>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {!successSaved ? (
            <form id="manual-log-form" onSubmit={handleSave} className="space-y-4 text-xs">
              {/* ------------------------------------------------------------------- */}
              {/* 1. CALISTHENICS TAB */}
              {/* ------------------------------------------------------------------- */}
              {category === 'calisthenics' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                      Select Exercise
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {CALISTHENICS_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSelectedExercise(preset)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            selectedExercise === preset
                              ? 'bg-primary/20 border border-primary text-primary font-bold'
                              : 'bg-white/5 border border-white/10 text-zinc-300 hover:border-white/20'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                      placeholder="Or enter custom exercise name"
                      className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-primary/50"
                    />
                  </div>

                  {/* Mode Selector */}
                  <div className="flex rounded-xl border border-white/10 bg-black/40 p-1">
                    <button
                      type="button"
                      onClick={() => setCalisthenicsMode('quick_single')}
                      className={`flex-1 rounded-lg py-1.5 text-center text-xs font-bold transition ${
                        calisthenicsMode === 'quick_single'
                          ? 'bg-primary text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ⚡ Quick Single Set (e.g. 15 Push-ups)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalisthenicsMode('multi_set')}
                      className={`flex-1 rounded-lg py-1.5 text-center text-xs font-bold transition ${
                        calisthenicsMode === 'multi_set'
                          ? 'bg-primary text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      📜 Multi-Set Ladder (3+ Sets)
                    </button>
                  </div>

                  {calisthenicsMode === 'quick_single' ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                        Total Repetitions Completed
                      </span>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setQuickReps((r) => Math.max(1, r - 5))}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickReps((r) => Math.max(1, r - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-mono text-4xl font-black text-primary min-w-[70px]">
                          {quickReps}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickReps((r) => r + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickReps((r) => r + 5)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold"
                        >
                          +5
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        1 clean set logged directly into your strength ledger.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                          Number of Sets: {setsCount}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setSetsCount((c) => Math.max(1, c - 1))}
                            className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-bold"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSetsCount((c) => Math.min(8, c + 1));
                              if (repsArray.length < setsCount + 1) {
                                setRepsArray([...repsArray, 10]);
                              }
                            }}
                            className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: setsCount }).map((_, idx) => (
                          <div key={idx} className="rounded-lg border border-white/5 bg-[#121824] p-2 text-center">
                            <span className="text-[9px] font-mono text-zinc-400 block mb-1">Set {idx + 1}</span>
                            <input
                              type="number"
                              value={repsArray[idx] ?? 10}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...repsArray];
                                updated[idx] = val;
                                setRepsArray(updated);
                              }}
                              className="w-full bg-transparent text-center font-mono text-base font-black text-primary outline-none"
                            />
                            <span className="text-[9px] text-zinc-500">reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PR Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isPR}
                      onChange={(e) => setIsPR(e.target.checked)}
                      className="rounded accent-primary h-4 w-4"
                    />
                    <span className="text-xs font-bold text-zinc-200">
                      🏆 Personal Record (New Rep High!)
                    </span>
                  </label>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* 2. BADMINTON TAB */}
              {/* ------------------------------------------------------------------- */}
              {category === 'badminton' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Match Format
                      </label>
                      <select
                        value={badmintonFormat}
                        onChange={(e) => setBadmintonFormat(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-bold text-white outline-none focus:border-[#CCFF00]"
                      >
                        <option value="Singles">Singles Match</option>
                        <option value="Doubles">Doubles Match</option>
                        <option value="Rally Drills">Smash & Rally Drills</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        value={badmintonDuration}
                        onChange={(e) => setBadmintonDuration(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-bold text-white outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                      Score / Outcome
                    </label>
                    <input
                      type="text"
                      value={badmintonScore}
                      onChange={(e) => setBadmintonScore(e.target.value)}
                      placeholder="e.g. Won 2-1 (21-18, 19-21, 21-16)"
                      className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-semibold text-white outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                      Intensity Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Casual', 'Competitive', 'High Intensity'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setBadmintonIntensity(lvl)}
                          className={`rounded-xl py-2 text-center text-xs font-bold transition ${
                            badmintonIntensity === lvl
                              ? 'bg-[#CCFF00] text-black shadow-md font-black'
                              : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#CCFF00]/20 bg-[#CCFF00]/5 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Estimated Caloric Burn</span>
                      <p className="text-sm font-black text-[#CCFF00]">
                        ~{calculateBadmintonCalories(badmintonDuration, badmintonIntensity)} kcal
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Heart Points</span>
                      <p className="text-sm font-black text-white">+{Math.round(badmintonDuration * 1.5)} pts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* 3. FOOTBALL TAB */}
              {/* ------------------------------------------------------------------- */}
              {category === 'football' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Format
                      </label>
                      <select
                        value={footballFormat}
                        onChange={(e) => setFootballFormat(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-bold text-white outline-none focus:border-[#FC5200]"
                      >
                        <option value="5-a-side">5-a-side Turf</option>
                        <option value="7-a-side">7-a-side Ground</option>
                        <option value="11-a-side">11-a-side Full Pitch</option>
                        <option value="Pitch Training">Winger Shooting Drills</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        value={footballDuration}
                        onChange={(e) => setFootballDuration(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-bold text-white outline-none focus:border-[#FC5200]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        value={footballPosition}
                        onChange={(e) => setFootballPosition(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Goals
                      </label>
                      <input
                        type="number"
                        value={footballGoals}
                        onChange={(e) => setFootballGoals(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Assists
                      </label>
                      <input
                        type="number"
                        value={footballAssists}
                        onChange={(e) => setFootballAssists(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#FC5200]/20 bg-[#FC5200]/5 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Match Burn</span>
                      <p className="text-sm font-black text-[#FC5200]">
                        ~{calculateFootballCalories(footballDuration)} kcal
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Cardio Output</span>
                      <p className="text-sm font-black text-white">Zone 4/5 Explosive</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* 4. CARDIO TAB */}
              {/* ------------------------------------------------------------------- */}
              {category === 'cardio' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2">
                    {(['run', 'walk', 'cycle'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCardioType(type)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase transition ${
                          cardioType === type ? 'bg-sky-400 text-black' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {type === 'run' ? '🏃 Run' : type === 'walk' ? '🚶 Walk' : '🚴 Cycle'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Distance (KM)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={cardioDistance}
                        onChange={(e) => setCardioDistance(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        value={cardioDuration}
                        onChange={(e) => setCardioDuration(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#121824] p-2.5 text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Perceived Exertion (RPE) Slider */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                    Perceived Exertion (RPE)
                  </span>
                  <span className="font-mono text-xs font-bold text-[#CCFF00]">
                    {rpe} / 10 ({rpe <= 4 ? 'Light' : rpe <= 7 ? 'Moderate' : rpe <= 9 ? 'Hard' : 'Max Effort'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-[#CCFF00]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                  Tactical Notes & Observations
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Great shoulder pump, crisp forehand smashes, quick feet"
                  className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-white/30"
                />
              </div>
            </form>
          ) : (
            /* Celebration / Consolidation View */
            <div className="my-6 text-center space-y-4 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#CCFF00] to-emerald-400 text-black shadow-lg shadow-[#CCFF00]/25">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#CCFF00]">
                  ENTRY DOCUMENTED IN ATHLETE LEDGER
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {savedDataSummary?.title}
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  {savedDataSummary?.details}
                </p>
                <p className="text-[11px] text-emerald-400 font-bold mt-2">
                  +Discipline XP Awarded • Ready for Daily Recap Consolidation
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-3">
                {onOpenShareCard && (
                  <button
                    onClick={handleLaunchShareStudio}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FC5200] to-[#ff7b39] py-3 text-xs font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg shadow-[#FC5200]/25 transition"
                  >
                    <Share2 size={16} />
                    <span>Create & Share Social Card Now</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSuccessSaved(false);
                    setNotes('');
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 transition"
                >
                  Log Another Activity
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-1.5 text-xs text-zinc-500 hover:text-white transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        {!successSaved && (
          <div className="flex items-center justify-end gap-2 border-t border-white/10 p-4 bg-black/20">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="manual-log-form"
              className="rounded-xl bg-[#CCFF00] px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition shadow-md"
            >
              Save Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
