import React from 'react';
import type {
  UserProfile,
  WorkoutSessionLog,
  GpsActivityLog,
  PersonalMilestones,
  MotivationalQuote,
  SocialShareCardData
} from '../types';
import { formatDuration, calculateWeeklyHeartPoints } from '../utils/milestonesTracker';
import {
  Heart,
  Zap,
  Trophy,
  Share2,
  Navigation,
  Footprints,
  CheckCircle2,
  Film,
  Plus
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
  onOpenFlyby: (activity: GpsActivityLog) => void;
  onOpenCreatePost?: () => void;
  onOpenFeed?: () => void;
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
  onOpenSocialShare,
  onOpenFlyby,
  onOpenCreatePost,
  onOpenFeed
}) => {
  // Calculate Daily Google Fit Ring Stats
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const todayGps = gpsActivities.filter((a) => a.date === todayStr);
  const todayWorkouts = workoutLogs.filter((w) => w.date === todayStr);

  const totalHeartPoints = todayGps.reduce((acc, a) => acc + (a.heartPointsEarned || 0), 0) + todayWorkouts.length * 15;
  const totalMoveMinutes = todayGps.reduce((acc, a) => acc + Math.round(a.durationSeconds / 60), 0) + todayWorkouts.length * 20;
  const totalDistanceKm = todayGps.reduce((acc, a) => acc + a.distanceKm, 0);
  const totalSteps = todayGps.reduce((acc, a) => acc + (a.stepsCount || 0), 0) + (todayWorkouts.length > 0 ? 3200 : 1500);

  const heartPointsDailyTarget = 30;
  const moveMinutesDailyTarget = 60;

  const heartProgress = Math.min(100, Math.round((totalHeartPoints / heartPointsDailyTarget) * 100));
  const moveProgress = Math.min(100, Math.round((totalMoveMinutes / moveMinutesDailyTarget) * 100));

  // Calculate Google Fit Official 150 Heart Points / Week (Sunday to Saturday)
  const weeklySummary = calculateWeeklyHeartPoints(gpsActivities, workoutLogs);
  const weeklyPoints = weeklySummary.currentPoints;
  const weeklyProgress = Math.min(100, Math.round((weeklyPoints / weeklySummary.targetPoints) * 100));
  const pointsRemaining = Math.max(0, weeklySummary.targetPoints - weeklyPoints);

  // Quick Share for Calisthenics Workout
  const handleShareWorkout = (log: WorkoutSessionLog) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)] || {
      text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      author: 'Aristotle'
    };

    onOpenSocialShare({
      title: log.exerciseName,
      workoutType: 'Calisthenics',
      stats: [
        { label: 'Sets', value: `${log.setsCompleted}` },
        { label: 'Reps', value: `${log.repsCompleted.reduce((a, b) => a + b, 0)}` },
        { label: 'RPE', value: `${log.perceivedExertion}/10` },
        { label: 'Session', value: 'Combo' }
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
      workoutType: act.activityType === 'run' ? 'Running' : 'Cycling',
      stats: [
        { label: 'Distance', value: `${act.distanceKm}`, unit: 'km' },
        { label: 'Pace', value: act.avgPaceMinKm },
        { label: 'Ascent', value: `+${act.elevationGainMeters || 0}`, unit: 'm' },
        { label: 'Points', value: `+${act.heartPointsEarned}`, unit: 'pts' }
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
      {/* 1. GOOGLE FIT SIGNATURE CONCENTRIC ACTIVITY RINGS CARD */}
      {/* ------------------------------------------------------------------- */}
      <div className="google-card p-6 flex flex-col items-center justify-center text-center">
        {/* Dual Concentric SVG Ring Visual */}
        <div className="relative w-56 h-56 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Outer Ring Track: Move Minutes */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="var(--ring-move-track)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Outer Ring Progress: Move Minutes */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="var(--ring-move-fill)"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 64}
              strokeDashoffset={2 * Math.PI * 64 * (1 - moveProgress / 100)}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />

            {/* Inner Ring Track: Heart Points */}
            <circle
              cx="80"
              cy="80"
              r="46"
              stroke="var(--ring-heart-track)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Inner Ring Progress: Heart Points */}
            <circle
              cx="80"
              cy="80"
              r="46"
              stroke="var(--ring-heart-fill)"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - heartProgress / 100)}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>

          {/* Center Heart Points Metric */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black text-main font-mono leading-none tracking-tight">
              {totalHeartPoints}
            </span>
            <span className="text-[11px] font-bold text-sub uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
              <Heart size={12} className="text-cyan-500 fill-cyan-500" />
              <span>Heart Pts</span>
            </span>
          </div>
        </div>

        {/* 4 Google Material 3 Stat Tiles Grid (Centered Horizontally & Vertically) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-4 pt-4 border-t border-glass">
          {/* Tile 1: Heart Points */}
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-[#55198B] dark:text-[#c084fc] text-xs font-bold uppercase mb-0.5">
              <Heart size={14} />
              <span>Heart Points</span>
            </div>
            <div className="text-xl font-black text-main font-mono">
              {totalHeartPoints} <span className="text-xs text-sub font-normal">/ {heartPointsDailyTarget}</span>
            </div>
          </div>

          {/* Tile 2: Move Minutes */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-0.5">
              <Zap size={14} />
              <span>Move Minutes</span>
            </div>
            <div className="text-xl font-black text-main font-mono">
              {totalMoveMinutes} <span className="text-xs text-sub font-normal">/ {moveMinutesDailyTarget}m</span>
            </div>
          </div>

          {/* Tile 3: Daily Steps */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase mb-0.5">
              <Footprints size={14} />
              <span>Daily Steps</span>
            </div>
            <div className="text-xl font-black text-main font-mono">
              {totalSteps.toLocaleString()} <span className="text-xs text-sub font-normal">/ 10k</span>
            </div>
          </div>

          {/* Tile 4: Distance */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-0.5">
              <Navigation size={14} />
              <span>Distance</span>
            </div>
            <div className="text-xl font-black text-main font-mono">
              {totalDistanceKm.toFixed(1)} <span className="text-xs text-sub font-normal">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. GOOGLE FIT MANDATORY 150 WEEKLY HEART POINTS MILESTONE */}
      {/* ------------------------------------------------------------------- */}
      <div className="google-card p-5 border-l-4 border-[#55198B]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-[#55198B] dark:text-[#c084fc] flex items-center justify-center font-black text-base shadow-sm">
              💜
            </div>
            <div>
              <h3 className="text-sm font-black text-main uppercase tracking-wide">
                Weekly Target (150 Pts)
              </h3>
              <div className="text-[11px] text-sub font-medium">
                {weeklySummary.weekStartDateStr} – {weeklySummary.weekEndDateStr}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-glass text-xs font-bold font-mono">
            {weeklySummary.isGoalAchieved ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={15} /> Goal Smashed!
              </span>
            ) : (
              <span className="text-[#55198B] dark:text-[#c084fc]">{pointsRemaining} pts needed</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-glass mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#55198B] to-[#7b29be] transition-all duration-700 rounded-full"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>

        {/* 7-Day Mini Bar Chart (Sunday to Saturday) */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weeklySummary.dailyBreakdown.map((d) => {
            const barHeight = Math.min(100, Math.max(12, Math.round((d.points / 30) * 100)));
            return (
              <div
                key={d.day}
                className={`p-2 rounded-2xl border flex flex-col items-center justify-center text-center ${
                  d.isToday
                    ? 'bg-purple-500/15 border-[#55198B] text-main shadow-sm'
                    : 'bg-card border-glass text-sub'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{d.day}</span>
                <div className="w-3 bg-slate-200 dark:bg-slate-800 h-11 rounded-full my-1.5 relative flex items-end overflow-hidden">
                  <div
                    className="w-full bg-[#55198B] rounded-full transition-all duration-500"
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold font-mono text-main">
                  {d.points}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. 1-TAP QUICK ACTION ACTIVITY LAUNCHER */}
      {/* ------------------------------------------------------------------- */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            className="google-card p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => onOpenGpsTracker('run')}
          >
            <span className="text-2xl">🏃</span>
            <span className="text-xs font-bold text-main">Run (GPS)</span>
          </button>

          <button
            className="google-card p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => onOpenGpsTracker('cycle')}
          >
            <span className="text-2xl">🚴</span>
            <span className="text-xs font-bold text-main">Ride (GPS)</span>
          </button>

          <button
            className="google-card p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={onOpenCalisthenics}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-bold text-main">Calisthenics</span>
          </button>

          <button
            className="google-card p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={onOpenFootball}
          >
            <span className="text-2xl">⚽</span>
            <span className="text-xs font-bold text-main">Football</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. PERSONAL MILESTONES & RECORDS (CLEAN, MINIMAL, CENTER-ALIGNED) */}
      {/* ------------------------------------------------------------------- */}
      <div className="google-card p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Trophy className="icon-xs text-amber-500" />
            <h3 className="text-sm font-black text-main uppercase tracking-wider">
              Personal Bests
            </h3>
          </div>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold tracking-wider uppercase">
            Records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Tile 1: 1km Run */}
          <div className="bg-card p-3 rounded-2xl border border-glass flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-sub font-bold uppercase flex items-center justify-center gap-1">
              <span>🏃</span>
              <span>1 km Run</span>
            </div>
            <div className="text-xl font-black text-main font-mono my-1">
              {milestones.fastest1kRunSeconds ? formatDuration(milestones.fastest1kRunSeconds) : '05:00'}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              Best Pace
            </div>
          </div>

          {/* Tile 2: 1km Cycle */}
          <div className="bg-card p-3 rounded-2xl border border-glass flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-sub font-bold uppercase flex items-center justify-center gap-1">
              <span>🚴</span>
              <span>1 km Cycle</span>
            </div>
            <div className="text-xl font-black text-main font-mono my-1">
              {milestones.fastest1kCycleSeconds ? formatDuration(milestones.fastest1kCycleSeconds) : '02:00'}
            </div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              Best Sprint
            </div>
          </div>

          {/* Tile 3: Longest Run */}
          <div className="bg-card p-3 rounded-2xl border border-glass flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-sub font-bold uppercase flex items-center justify-center gap-1">
              <span>📍</span>
              <span>Longest</span>
            </div>
            <div className="text-xl font-black text-main font-mono my-1">
              {milestones.longestRunKm || 5.0} <span className="text-xs text-sub font-normal">km</span>
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Endurance
            </div>
          </div>

          {/* Tile 4: Top Speed */}
          <div className="bg-card p-3 rounded-2xl border border-glass flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-sub font-bold uppercase flex items-center justify-center gap-1">
              <span>⚡</span>
              <span>Top Speed</span>
            </div>
            <div className="text-xl font-black text-main font-mono my-1">
              {milestones.topSpeedRunKmh || 14.5} <span className="text-xs text-sub font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider">
              Velocity
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 5. RECENT ACTIVITIES WITH QUICK POST & FLYBY */}
      {/* ------------------------------------------------------------------- */}
      <div className="google-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="text-sm font-black text-main uppercase tracking-wider">
            Activities
          </h3>
          <div className="flex items-center gap-2">
            {onOpenCreatePost && (
              <button
                className="btn-google-primary text-xs py-1.5 px-3 flex items-center gap-1"
                onClick={onOpenCreatePost}
              >
                <Plus size={14} />
                <span>Compile Post</span>
              </button>
            )}
            {onOpenFeed && (
              <button
                className="btn-google-outlined text-xs py-1.5 px-3"
                onClick={onOpenFeed}
              >
                <span>Feed &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {workoutLogs.length === 0 && gpsActivities.length === 0 ? (
          <p className="text-xs text-sub py-4 text-center font-medium">
            No activities tracked yet today.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {/* GPS Activities */}
            {gpsActivities.slice().reverse().slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="bg-card p-3.5 rounded-2xl border border-glass flex items-center justify-between flex-wrap gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-[#55198B] dark:text-[#c084fc] flex items-center justify-center text-lg shadow-sm">
                    {act.activityType === 'run' ? '🏃' : '🚴'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-main">
                      {act.distanceKm} km {act.activityType === 'run' ? 'Run' : 'Ride'}
                    </h4>
                    <div className="text-[11px] text-sub font-medium">
                      {act.date} &bull; {formatDuration(act.durationSeconds)} &bull; {act.avgPaceMinKm} &bull; +{act.elevationGainMeters || 0}m
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn-google-tonal"
                    onClick={() => onOpenFlyby(act)}
                    title="Play Strava-Style Route Animation"
                  >
                    <Film size={14} />
                    <span>Flyby</span>
                  </button>

                  <button
                    className="btn-google-outlined"
                    onClick={() => handleShareGps(act)}
                    title="Generate Social Share Card"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Calisthenics Logs */}
            {workoutLogs.slice().reverse().slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="bg-card p-3.5 rounded-2xl border border-glass flex items-center justify-between flex-wrap gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-lime-500/15 text-lime-600 dark:text-lime-400 flex items-center justify-center text-lg shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-main">{w.exerciseName}</h4>
                    <div className="text-[11px] text-sub font-medium">
                      {w.date} &bull; {w.setsCompleted} Sets ({w.repsCompleted.join(', ')} Reps)
                    </div>
                  </div>
                </div>

                <button
                  className="btn-google-outlined"
                  onClick={() => handleShareWorkout(w)}
                  title="Generate Social Share Card"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
