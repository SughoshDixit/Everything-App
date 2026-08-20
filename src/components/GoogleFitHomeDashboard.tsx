import React from 'react';
import type {
  UserProfile,
  WorkoutSessionLog,
  GpsActivityLog,
  PersonalMilestones,
  MotivationalQuote,
  SocialShareCardData
} from '../types';
import { formatDuration } from '../utils/milestonesTracker';
import {
  Flame,
  Heart,
  Zap,
  Trophy,
  Share2,
  Navigation
} from 'lucide-react';

interface GoogleFitHomeDashboardProps {
  currentProfile: UserProfile;
  workoutLogs: WorkoutSessionLog[];
  gpsActivities: GpsActivityLog[];
  milestones: PersonalMilestones;
  quotes: MotivationalQuote[];
  onOpenGpsTracker: (type: 'run' | 'cycle' | 'walk') => void;
  onOpenCalisthenics: () => void;
  onOpenFootball: () => void;
  onOpenSocialShare: (data: SocialShareCardData) => void;
}

export const GoogleFitHomeDashboard: React.FC<GoogleFitHomeDashboardProps> = ({
  currentProfile,
  workoutLogs,
  gpsActivities,
  milestones,
  quotes,
  onOpenGpsTracker,
  onOpenCalisthenics,
  onOpenFootball,
  onOpenSocialShare
}) => {
  // Calculate Daily Google Fit Ring Stats
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const todayGps = gpsActivities.filter((a) => a.date === todayStr);
  const todayWorkouts = workoutLogs.filter((w) => w.date === todayStr);

  const totalHeartPoints = todayGps.reduce((acc, a) => acc + (a.heartPointsEarned || 0), 0) + todayWorkouts.length * 15;
  const totalMoveMinutes = todayGps.reduce((acc, a) => acc + Math.round(a.durationSeconds / 60), 0) + todayWorkouts.length * 20;
  const totalCalories = todayGps.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0) + todayWorkouts.length * 120;
  const totalDistanceKm = todayGps.reduce((acc, a) => acc + a.distanceKm, 0);

  const heartPointsTarget = 30;
  const moveMinutesTarget = 60;

  const heartProgress = Math.min(100, Math.round((totalHeartPoints / heartPointsTarget) * 100));
  const moveProgress = Math.min(100, Math.round((totalMoveMinutes / moveMinutesTarget) * 100));

  // Quick Share for Calisthenics Workout
  const handleShareWorkout = (log: WorkoutSessionLog) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)] || {
      text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      author: 'Aristotle'
    };

    onOpenSocialShare({
      title: log.exerciseName,
      workoutType: 'Calisthenics Mastery',
      stats: [
        { label: 'Sets Done', value: `${log.setsCompleted}`, unit: 'Sets' },
        { label: 'Total Reps', value: `${log.repsCompleted.reduce((a, b) => a + b, 0)}`, unit: 'Reps' },
        { label: 'Perceived RPE', value: `${log.perceivedExertion}/10` },
        { label: 'Session Type', value: 'Combo Flow' }
      ],
      motivationalQuote: quote.text,
      quoteAuthor: quote.author,
      streakDays: 14,
      date: log.date,
      persona: currentProfile
    });
  };

  // Quick Share for GPS Run/Ride
  const handleShareGps = (act: GpsActivityLog) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)] || {
      text: 'Do not pray for an easy life, pray for the strength to endure a difficult one.',
      author: 'Bruce Lee'
    };

    onOpenSocialShare({
      title: `${act.distanceKm} km ${act.activityType === 'run' ? 'Run' : 'Ride'}`,
      workoutType: act.activityType === 'run' ? 'Outdoor Running' : 'Outdoor Cycling',
      stats: [
        { label: 'Distance', value: `${act.distanceKm}`, unit: 'km' },
        { label: 'Avg Pace', value: act.avgPaceMinKm },
        { label: 'Duration', value: formatDuration(act.durationSeconds) },
        { label: 'Heart Points', value: `+${act.heartPointsEarned}`, unit: 'pts' }
      ],
      motivationalQuote: quote.text,
      quoteAuthor: quote.author,
      streakDays: 14,
      date: act.date,
      persona: currentProfile
    });
  };

  return (
    <div className="tab-container animate-fade-in flex flex-col gap-4">
      {/* ------------------------------------------------------------------- */}
      {/* 1. GOOGLE FIT SIGNATURE ACTIVITY RINGS HERO */}
      {/* ------------------------------------------------------------------- */}
      <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-6 p-6">
        {/* Dual Concentric SVG Ring Visual */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Outer Ring: Move Minutes (Emerald Green) */}
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke="rgba(16, 185, 129, 0.15)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - moveProgress / 100)}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />

            {/* Inner Ring: Heart Points (Electric Cyan) */}
            <circle
              cx="60"
              cy="60"
              r="34"
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="34"
              stroke="#06b6d4"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - heartProgress / 100)}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>

          {/* Center Heart Points Number */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-white font-mono leading-none tracking-tight">
              {totalHeartPoints}
            </span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-1">
              Heart Pts
            </span>
          </div>
        </div>

        {/* Ring Metrics Breakdown */}
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase mb-1">
              <Heart size={14} />
              <span>Heart Points</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {totalHeartPoints} <span className="text-xs text-sub font-normal">/ {heartPointsTarget} pts</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase mb-1">
              <Zap size={14} />
              <span>Move Minutes</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {totalMoveMinutes} <span className="text-xs text-sub font-normal">/ {moveMinutesTarget} min</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase mb-1">
              <Flame size={14} />
              <span>Energy Burned</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {totalCalories} <span className="text-xs text-sub font-normal">kcal</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-lime-400 text-xs font-bold uppercase mb-1">
              <Navigation size={14} />
              <span>Distance</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {totalDistanceKm.toFixed(1)} <span className="text-xs text-sub font-normal">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. 1-TAP QUICK ACTION ACTIVITY LAUNCHER */}
      {/* ------------------------------------------------------------------- */}
      <div>
        <h3 className="text-xs font-black text-sub uppercase tracking-wider mb-2 px-1">
          Quick Track & Workout Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            className="glass-card hover:border-cyan-400/50 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all card-hover-lift cursor-pointer"
            onClick={() => onOpenGpsTracker('run')}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-lg">
              🏃
            </div>
            <span className="text-xs font-bold text-white">Track Run (GPS)</span>
          </button>

          <button
            className="glass-card hover:border-emerald-400/50 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all card-hover-lift cursor-pointer"
            onClick={() => onOpenGpsTracker('cycle')}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-lg">
              🚴
            </div>
            <span className="text-xs font-bold text-white">Track Ride (GPS)</span>
          </button>

          <button
            className="glass-card hover:border-lime-400/50 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all card-hover-lift cursor-pointer"
            onClick={onOpenCalisthenics}
          >
            <div className="w-10 h-10 rounded-full bg-lime-500/15 text-lime-400 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <span className="text-xs font-bold text-white">Calisthenics Combo</span>
          </button>

          <button
            className="glass-card hover:border-amber-400/50 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all card-hover-lift cursor-pointer"
            onClick={onOpenFootball}
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-lg">
              ⚽
            </div>
            <span className="text-xs font-bold text-white">Football Drills</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. PERSONAL MILESTONES & RECORDS SHOWCASE */}
      {/* ------------------------------------------------------------------- */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="icon-xs text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Personal Bests & Milestones
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold">ALL-TIME RECORDS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">FASTEST 1 KM RUN</div>
            <div className="text-base font-black text-white font-mono mt-0.5">
              {milestones.fastest1kRunSeconds ? formatDuration(milestones.fastest1kRunSeconds) : '4:30'}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Record Pace</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">FASTEST 1 KM CYCLING</div>
            <div className="text-base font-black text-white font-mono mt-0.5">
              {milestones.fastest1kCycleSeconds ? formatDuration(milestones.fastest1kCycleSeconds) : '1:45'}
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Sprint Record</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">LONGEST RUN</div>
            <div className="text-base font-black text-white font-mono mt-0.5">
              {milestones.longestRunKm || 5.0} <span className="text-xs text-sub font-normal">km</span>
            </div>
            <div className="text-[10px] text-amber-400 font-semibold mt-0.5">Endurance Peak</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">TOP SPRINT SPEED</div>
            <div className="text-base font-black text-white font-mono mt-0.5">
              {milestones.topSpeedRunKmh || 16.5} <span className="text-xs text-sub font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-lime-400 font-semibold mt-0.5">Max Velocity</div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. RECENT ACTIVITY TIMELINE WITH 1-TAP SOCIAL SHARING */}
      {/* ------------------------------------------------------------------- */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">
          Recent Activities & Workouts
        </h3>

        {workoutLogs.length === 0 && gpsActivities.length === 0 ? (
          <p className="text-xs text-sub py-4 text-center">
            No activities tracked yet today. Launch a run, cycling session, or calisthenics combo above!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* GPS Activities */}
            {gpsActivities.slice().reverse().slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-base">
                    {act.activityType === 'run' ? '🏃' : '🚴'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {act.distanceKm} km {act.activityType === 'run' ? 'Outdoor Run' : 'Ride'}
                    </h4>
                    <div className="text-[11px] text-sub">
                      {act.date} · {formatDuration(act.durationSeconds)} · {act.avgPaceMinKm}
                    </div>
                  </div>
                </div>

                <button
                  className="btn-secondary text-xs flex items-center gap-1.5 py-1 px-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-full"
                  onClick={() => handleShareGps(act)}
                  title="Generate Social Share Card"
                >
                  <Share2 size={13} />
                  <span>Share Card</span>
                </button>
              </div>
            ))}

            {/* Calisthenics Logs */}
            {workoutLogs.slice().reverse().slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-lime-500/15 text-lime-400 flex items-center justify-center text-base">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{w.exerciseName}</h4>
                    <div className="text-[11px] text-sub">
                      {w.date} · {w.setsCompleted} Sets ({w.repsCompleted.join(', ')} Reps)
                    </div>
                  </div>
                </div>

                <button
                  className="btn-secondary text-xs flex items-center gap-1.5 py-1 px-3 bg-slate-900 hover:bg-slate-800 text-lime-400 border border-slate-700 rounded-full"
                  onClick={() => handleShareWorkout(w)}
                  title="Generate Social Share Card"
                >
                  <Share2 size={13} />
                  <span>Share Card</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
