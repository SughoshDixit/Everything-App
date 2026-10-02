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
  Plus,
  Sparkles
} from 'lucide-react';
import { HistoricalTrendsDashboard } from './HistoricalTrendsDashboard';

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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* 1. ATHLETIC CONCENTRIC ACTIVITY RINGS CARD */}
      {/* ------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary flex items-center gap-1.5">
              <Sparkles size={12} /> GOOGLE FIT TELEMETRY
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
            {todayStr}
          </span>
        </div>

        {/* Dual Concentric SVG Ring Visual */}
        <div className="relative w-56 h-56 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Outer Ring Track: Move Minutes */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="rgba(204, 255, 0, 0.12)"
              strokeWidth="11"
              fill="transparent"
            />
            {/* Outer Ring Progress: Move Minutes */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="#ccff00"
              strokeWidth="11"
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
              r="47"
              stroke="rgba(252, 76, 2, 0.15)"
              strokeWidth="11"
              fill="transparent"
            />
            {/* Inner Ring Progress: Heart Points */}
            <circle
              cx="80"
              cy="80"
              r="47"
              stroke="#fc4c02"
              strokeWidth="11"
              strokeDasharray={2 * Math.PI * 47}
              strokeDashoffset={2 * Math.PI * 47 * (1 - heartProgress / 100)}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>

          {/* Center Heart Points Metric */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-white font-mono leading-none tracking-tight">
              {totalHeartPoints}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
              <Heart size={12} className="text-[#fc4c02] fill-[#fc4c02]" />
              <span>Heart Pts</span>
            </span>
          </div>
        </div>

        {/* 4 Stat Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-6 pt-5 border-t border-border">
          {/* Tile 1: Heart Points */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824] flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-[#ff9667] text-[10px] font-bold uppercase mb-1">
              <Heart size={13} />
              <span>Heart Points</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {totalHeartPoints} <span className="text-xs text-muted-foreground font-normal">/ {heartPointsDailyTarget}</span>
            </div>
          </div>

          {/* Tile 2: Move Minutes */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824] flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-primary text-[10px] font-bold uppercase mb-1">
              <Zap size={13} />
              <span>Move Minutes</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {totalMoveMinutes} <span className="text-xs text-muted-foreground font-normal">/ {moveMinutesDailyTarget}m</span>
            </div>
          </div>

          {/* Tile 3: Daily Steps */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824] flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-dude text-[10px] font-bold uppercase mb-1">
              <Footprints size={13} />
              <span>Daily Steps</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {totalSteps.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ 10k</span>
            </div>
          </div>

          {/* Tile 4: Distance */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824] flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1 text-sky-400 text-[10px] font-bold uppercase mb-1">
              <Navigation size={13} />
              <span>Distance</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {totalDistanceKm.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. GOOGLE FIT 150 WEEKLY HEART POINTS TARGET */}
      {/* ------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fc4c02]/15 text-[#ff9667] flex items-center justify-center text-xl font-black">
              ❤️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Weekly Heart Target (150 Pts)
              </h3>
              <div className="text-[11px] text-muted-foreground font-medium">
                {weeklySummary.weekStartDateStr} – {weeklySummary.weekEndDateStr}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121824] border border-white/10 text-xs font-mono font-bold">
            {weeklySummary.isGoalAchieved ? (
              <span className="text-primary flex items-center gap-1">
                <CheckCircle2 size={15} /> Goal Smashed!
              </span>
            ) : (
              <span className="text-[#ff9667]">{pointsRemaining} pts needed</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5 mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#fc4c02] to-primary transition-all duration-700 rounded-full"
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
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                  d.isToday
                    ? 'bg-primary/10 border-primary text-white shadow-sm'
                    : 'bg-[#121824] border-white/5 text-muted-foreground'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{d.day}</span>
                <div className="w-2.5 bg-white/5 h-12 rounded-full my-2 relative flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${d.isToday ? 'bg-primary' : 'bg-primary/60'}`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold font-mono text-white">
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">
            Quick Launch Tracker
          </h3>
          <span className="text-[10px] text-primary font-medium">1-Tap Live Session</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            className="rounded-2xl border border-border bg-[#0e131b] p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 group"
            onClick={() => onOpenGpsTracker('run')}
          >
            <span className="text-2xl group-hover:scale-110 transition">🏃</span>
            <span className="text-xs font-bold text-white">Run</span>
            <span className="text-[9px] text-muted-foreground">GPS Route</span>
          </button>

          <button
            className="rounded-2xl border border-border bg-[#0e131b] p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 group"
            onClick={() => onOpenGpsTracker('walk')}
          >
            <span className="text-2xl group-hover:scale-110 transition">🚶</span>
            <span className="text-xs font-bold text-white">Walk</span>
            <span className="text-[9px] text-muted-foreground">Commute</span>
          </button>

          <button
            className="rounded-2xl border border-border bg-[#0e131b] p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 group"
            onClick={() => onOpenGpsTracker('cycle')}
          >
            <span className="text-2xl group-hover:scale-110 transition">🚴</span>
            <span className="text-xs font-bold text-white">Ride</span>
            <span className="text-[9px] text-muted-foreground">Cycling</span>
          </button>

          <button
            className="rounded-2xl border border-border bg-[#0e131b] p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-dude/40 group"
            onClick={onOpenCalisthenics}
          >
            <span className="text-2xl group-hover:scale-110 transition">⚡</span>
            <span className="text-xs font-bold text-white">Calisthenics</span>
            <span className="text-[9px] text-dude">Yellow Dude</span>
          </button>

          <button
            className="rounded-2xl border border-border bg-[#0e131b] p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-sky-400/40 group"
            onClick={onOpenFootball}
          >
            <span className="text-2xl group-hover:scale-110 transition">⚽</span>
            <span className="text-xs font-bold text-white">Football</span>
            <span className="text-[9px] text-sky-400">Match Drills</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. PERSONAL MILESTONES & RECORDS */}
      {/* ------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-dude" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Personal Bests & All-Time Records
            </h3>
          </div>
          <span className="text-[10px] text-primary font-bold tracking-wider uppercase font-mono">
            RECORDS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: 1km Run */}
          <div className="bg-[#121824] p-3.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] text-muted-foreground font-bold uppercase flex items-center justify-center gap-1">
              <span>🏃</span>
              <span>1 km Run</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono my-1">
              {milestones.fastest1kRunSeconds ? formatDuration(milestones.fastest1kRunSeconds) : '05:00'}
            </div>
            <div className="text-[10px] text-primary font-bold uppercase tracking-wider">
              Best Pace
            </div>
          </div>

          {/* Tile 2: 1km Cycle */}
          <div className="bg-[#121824] p-3.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] text-muted-foreground font-bold uppercase flex items-center justify-center gap-1">
              <span>🚴</span>
              <span>1 km Cycle</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono my-1">
              {milestones.fastest1kCycleSeconds ? formatDuration(milestones.fastest1kCycleSeconds) : '02:00'}
            </div>
            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
              Best Sprint
            </div>
          </div>

          {/* Tile 3: Longest Run */}
          <div className="bg-[#121824] p-3.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] text-muted-foreground font-bold uppercase flex items-center justify-center gap-1">
              <span>📍</span>
              <span>Longest</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono my-1">
              {milestones.longestRunKm || 5.0} <span className="text-xs text-muted-foreground font-normal">km</span>
            </div>
            <div className="text-[10px] text-dude font-bold uppercase tracking-wider">
              Endurance
            </div>
          </div>

          {/* Tile 4: Top Speed */}
          <div className="bg-[#121824] p-3.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] text-muted-foreground font-bold uppercase flex items-center justify-center gap-1">
              <span>⚡</span>
              <span>Top Speed</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono my-1">
              {milestones.topSpeedRunKmh || 14.5} <span className="text-xs text-muted-foreground font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-[#ff9667] font-bold uppercase tracking-wider">
              Velocity
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4b. MULTI-YEAR HISTORICAL TRENDS & ANALYTICS (2019 - 2026) */}
      {/* ------------------------------------------------------------------- */}
      <HistoricalTrendsDashboard gpsActivities={gpsActivities} milestones={milestones} />

      {/* ------------------------------------------------------------------- */}
      {/* 5. RECENT ACTIVITIES WITH QUICK POST & FLYBY */}
      {/* ------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Recent Logged Activities
          </h3>
          <div className="flex items-center gap-2">
            {onOpenCreatePost && (
              <button
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow-sm"
                onClick={onOpenCreatePost}
              >
                <Plus size={14} />
                <span>Compile Post</span>
              </button>
            )}
            {onOpenFeed && (
              <button
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white hover:border-white/20 transition"
                onClick={onOpenFeed}
              >
                <span>Feed &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {workoutLogs.length === 0 && gpsActivities.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center font-medium">
            No activities tracked yet today.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* GPS Activities */}
            {gpsActivities.slice().reverse().slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="bg-[#121824] p-3.5 rounded-xl border border-white/5 flex items-center justify-between flex-wrap gap-3 hover:border-white/15 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                    {act.activityType === 'run' ? '🏃' : '🚴'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {act.distanceKm} km {act.activityType === 'run' ? 'Run' : 'Ride'}
                    </h4>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      {act.date} &bull; {formatDuration(act.durationSeconds)} &bull; {act.avgPaceMinKm} &bull; +{act.elevationGainMeters || 0}m
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition"
                    onClick={() => onOpenFlyby(act)}
                    title="Play Strava-Style Route Animation"
                  >
                    <Film size={13} />
                    <span>Flyby</span>
                  </button>

                  <button
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-white transition"
                    onClick={() => handleShareGps(act)}
                    title="Generate Social Share Card"
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Calisthenics Logs */}
            {workoutLogs.slice().reverse().slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="bg-[#121824] p-3.5 rounded-xl border border-white/5 flex items-center justify-between flex-wrap gap-3 hover:border-white/15 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dude/10 text-dude flex items-center justify-center text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{w.exerciseName}</h4>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      {w.date} &bull; {w.setsCompleted} Sets ({w.repsCompleted.join(', ')} Reps)
                    </div>
                  </div>
                </div>

                <button
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-white transition"
                  onClick={() => handleShareWorkout(w)}
                  title="Generate Social Share Card"
                >
                  <Share2 size={13} />
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
