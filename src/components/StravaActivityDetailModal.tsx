import React, { useState } from 'react';
import type { StravaActivityPost, UserProfile } from '../types';
import {
  X,
  Share2,
  MessageSquare,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  Clock,
  Send,
  ShieldCheck,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';
import { ZoomableImageModal } from './ZoomableImageModal';

interface StravaActivityDetailModalProps {
  activity: StravaActivityPost;
  currentProfile?: UserProfile;
  onClose: () => void;
  onKudos: (id: string) => void;
  onAddComment: (activityId: string, text: string) => void;
  onOpenSocialShare: (activity: StravaActivityPost) => void;
  onOpenFlyby?: (activity: StravaActivityPost) => void;
}

export const StravaActivityDetailModal: React.FC<StravaActivityDetailModalProps> = ({
  activity,
  onClose,
  onKudos,
  onAddComment,
  onOpenSocialShare,
  onOpenFlyby
}) => {
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'splits' | 'analysis' | 'media'>('overview');
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const sportIcon =
    activity.sportType === 'run'
      ? '🏃'
      : activity.sportType === 'cycle'
      ? '🚴'
      : activity.sportType === 'calisthenics'
      ? '💪'
      : activity.sportType === 'football'
      ? '⚽'
      : '⚡';

  const sportName =
    activity.sportType === 'run'
      ? 'Run'
      : activity.sportType === 'cycle'
      ? 'Ride'
      : activity.sportType === 'calisthenics'
      ? 'Calisthenics Workout'
      : activity.sportType === 'football'
      ? 'Football Session'
      : 'Workout';

  const athleteName = activity.userId === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit';
  const athleteAvatar = activity.userId === 'women' ? '👩' : '👨';

  // Format moving time
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(activity.id, commentText.trim());
    setCommentText('');
  };

  // Collect all historical & uploaded photos and videos
  const allPhotos = [
    ...(activity.photos || []),
    ...(activity.customMediaUrl && !(activity.photos || []).includes(activity.customMediaUrl) ? [activity.customMediaUrl] : []),
    ...(activity.gpsActivity?.mediaUrls || [])
  ].filter((url, idx, self) => url && self.indexOf(url) === idx);

  const allVideos = [
    ...(activity.videoUrls || []),
    ...(activity.gpsActivity?.videoUrls || [])
  ].filter((url, idx, self) => url && self.indexOf(url) === idx);

  // Mock splits if not provided
  const splits = activity.splits || (activity.totalDistanceKm > 0 ? [
    { splitNumber: 1, distanceLabel: '1.0 km', distanceMeters: 1000, durationSeconds: 295, paceMinKm: '4:55 /km', elevationDeltaMeters: +12, speedKmh: 12.2 },
    { splitNumber: 2, distanceLabel: '2.0 km', distanceMeters: 1000, durationSeconds: 302, paceMinKm: '5:02 /km', elevationDeltaMeters: -5, speedKmh: 11.9 },
    { splitNumber: 3, distanceLabel: '3.0 km', distanceMeters: 1000, durationSeconds: 288, paceMinKm: '4:48 /km', elevationDeltaMeters: +8, speedKmh: 12.5 },
    { splitNumber: 4, distanceLabel: '4.0 km', distanceMeters: 1000, durationSeconds: 310, paceMinKm: '5:10 /km', elevationDeltaMeters: +15, speedKmh: 11.6 },
    { splitNumber: 5, distanceLabel: '5.0 km', distanceMeters: 1000, durationSeconds: 280, paceMinKm: '4:40 /km', elevationDeltaMeters: -10, speedKmh: 12.9 }
  ].slice(0, Math.max(1, Math.ceil(activity.totalDistanceKm))) : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-2xl bg-[#0e131b] border border-white/10 shadow-2xl rounded-3xl overflow-hidden my-auto animate-scale-up text-foreground">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#10151d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-lg font-black shadow-sm">
              {athleteAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-display">{athleteName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                  {sportIcon} {sportName}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                <Clock size={11} /> {activity.date} &bull; Everything App Performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenSocialShare(activity)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/25 transition"
              title="Share Strava Card"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/25 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#080b11] px-4 pt-1 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Overview
          </button>
          {(allPhotos.length > 0 || allVideos.length > 0) && (
            <button
              onClick={() => setActiveTab('media')}
              className={`py-2.5 px-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'media'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              <ImageIcon size={13} />
              <span>Media ({allPhotos.length + allVideos.length})</span>
            </button>
          )}
          {splits.length > 0 && (
            <button
              onClick={() => setActiveTab('splits')}
              className={`py-2.5 px-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'splits'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              Splits ({splits.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-2.5 px-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Analysis &amp; Power
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Record & Milestone Badges (Fastest, Longest, Hardest) */}
          {activity.recordBadges && activity.recordBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activity.recordBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-500 text-xs font-black shadow-sm"
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span>{badge.title}</span>
                  <span className="font-mono text-xs opacity-90 font-bold">&bull; {badge.statLabel}</span>
                </div>
              ))}
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-main leading-tight">
              {activity.title}
            </h2>
            {activity.description && (
              <p className="text-xs sm:text-sm text-sub leading-relaxed font-medium">
                {activity.description}
              </p>
            )}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Big 3 Hero Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#121824] border border-white/5 text-center">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-display">
                    {activity.sportType === 'calisthenics' ? 'TOTAL SETS' : 'DISTANCE'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                    {activity.sportType === 'calisthenics'
                      ? `${activity.totalSets || 12}`
                      : `${activity.totalDistanceKm.toFixed(2)}`}
                    <span className="text-xs font-bold text-muted-foreground ml-0.5">
                      {activity.sportType === 'calisthenics' ? 'sets' : 'km'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-display">
                    {activity.sportType === 'calisthenics' ? 'TOTAL REPS' : 'AVG PACE'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                    {activity.sportType === 'calisthenics'
                      ? `${activity.totalReps || 160}`
                      : (activity.avgPaceMinKm || '5:04')}
                    <span className="text-xs font-bold text-muted-foreground ml-0.5">
                      {activity.sportType === 'calisthenics' ? 'reps' : '/km'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-display">
                    MOVING TIME
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                    {formatDuration(activity.totalMoveMinutes * 60 || 2400)}
                  </div>
                </div>
              </div>

              {/* Extended Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                    <TrendingUp size={12} className="text-emerald-400" /> Elevation Gain
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    +{activity.elevationGainMeters || 68} <span className="text-xs font-normal text-muted-foreground">m</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                    <Flame size={12} className="text-dude" /> Calories
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {activity.totalCalories || 520} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                    <Zap size={12} className="text-primary" /> Heart Points
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {activity.totalHeartPoints || 38} <span className="text-xs font-normal text-muted-foreground">pts</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-rose-400" /> Suffer Score
                  </div>
                  <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                    {activity.sufferScore || (activity.rpe ? activity.rpe * 10 : 75)} <span className="text-xs font-normal text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>

              {/* Achievements Earned in this activity */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Trophy size={16} />
                  <span>Achievements Earned on this Effort</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#1a1e28]/70 border border-amber-500/30 flex items-center gap-2.5">
                    <span className="text-xl">🥇</span>
                    <div>
                      <h4 className="text-xs font-bold text-main">PR: Fastest 1km Split</h4>
                      <p className="text-[10px] text-sub font-mono font-medium">4:40 /km (Split 5)</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#1a1e28]/70 border border-amber-500/30 flex items-center gap-2.5">
                    <span className="text-xl">🏅</span>
                    <div>
                      <h4 className="text-xs font-bold text-main">Consistent Pace Milestone</h4>
                      <p className="text-[10px] text-sub font-mono font-medium">&plusmn;12s variance across 5.0km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Showcase Preview in Overview */}
              {(allPhotos.length > 0 || allVideos.length > 0) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sub flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#ccff00]" />
                      <span>Photos &amp; Videos ({allPhotos.length + allVideos.length})</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('media')}
                      className="text-[11px] font-bold text-[#ccff00] hover:underline cursor-pointer"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {/* Video Player */}
                  {allVideos.length > 0 && (
                    <div className="rounded-2xl overflow-hidden bg-black max-h-72 flex items-center justify-center border border-glass">
                      <video
                        src={allVideos[0]}
                        controls
                        playsInline
                        className="w-full max-h-72 object-contain rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Photos Grid */}
                  {allPhotos.length > 0 && (
                    <div className={`grid gap-2 ${allPhotos.length === 1 ? 'grid-cols-1' : allPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {allPhotos.slice(0, 3).map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setZoomImage({ src: photoUrl, title: activity.title })}
                          className={`relative rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group border border-glass ${
                            allPhotos.length === 1 ? 'h-64 sm:h-72' : 'h-36 sm:h-44'
                          }`}
                        >
                          <img
                            src={photoUrl}
                            alt={`Activity photo ${pIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {pIdx === 2 && allPhotos.length > 3 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm">
                              +{allPhotos.length - 3} More
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Activities / Exercises List */}
              {activity.activities && activity.activities.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sub">
                    Logged Exercises &amp; Segments
                  </h4>
                  <div className="space-y-2">
                    {activity.activities.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-card border border-glass flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">
                            {item.category === 'calisthenics' ? '💪' : '🏃'}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-main">{item.title}</h5>
                            <p className="text-[11px] text-sub">{item.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sub uppercase">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: KILOMETER SPLITS BREAKDOWN */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'splits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-sub font-bold px-2">
                <span>KM</span>
                <span>PACE</span>
                <span>ELEVATION</span>
                <span>TIME</span>
              </div>

              <div className="space-y-2">
                {splits.map((s) => {
                  const paceSeconds = parseInt(s.paceMinKm.split(':')[0]) * 60 + parseInt(s.paceMinKm.split(':')[1]);
                  const isFastest = paceSeconds <= 285;

                  return (
                    <div
                      key={s.splitNumber}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                        isFastest
                          ? 'bg-[#ccff00]/10 border-[#ccff00]/40 shadow-sm'
                          : 'bg-[#141923] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-12 font-bold text-main">
                        {isFastest && <span>🥇</span>}
                        <span>{s.splitNumber}</span>
                      </div>

                      <div className="font-bold text-[#ccff00] flex-1 text-center">
                        {s.paceMinKm}
                      </div>

                      <div className={`w-20 text-center font-medium ${s.elevationDeltaMeters >= 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {s.elevationDeltaMeters >= 0 ? `+${s.elevationDeltaMeters}m` : `${s.elevationDeltaMeters}m`}
                      </div>

                      <div className="w-16 text-right font-bold text-main">
                        {formatDuration(s.durationSeconds)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: SUFFER SCORE & POWER */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'analysis' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-card border border-glass space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                    <Flame size={14} className="text-rose-500" /> Relative Suffer Score
                  </h4>
                  <span className="text-sm font-black text-rose-500 font-mono">
                    {activity.sufferScore || (activity.rpe ? activity.rpe * 10 : 75)} / 100
                  </span>
                </div>
                <p className="text-xs text-sub leading-relaxed">
                  Based on your heart rate and perceived exertion (RPE {activity.rpe || 8}/10), this workout provided a high stimulus for cardiovascular endurance and mental grit.
                </p>
              </div>

              {/* Heart Rate Intensity Zones */}
              <div className="p-4 rounded-2xl bg-card border border-glass space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-main">
                  Training Intensity Zones
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-sub mb-1">
                      <span>Zone 5: Anaerobic Max (&gt;175 bpm)</span>
                      <span className="font-mono font-bold">12 mins (28%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sub mb-1">
                      <span>Zone 4: Threshold (160 - 175 bpm)</span>
                      <span className="font-mono font-bold">18 mins (42%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sub mb-1">
                      <span>Zone 3: Aerobic Tempo (140 - 160 bpm)</span>
                      <span className="font-mono font-bold">10 mins (24%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#38bdf8] h-full rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sub mb-1">
                      <span>Zone 2: Easy Recovery (&lt;140 bpm)</span>
                      <span className="font-mono font-bold">2 mins (6%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '6%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 4: FULL RESOLUTION MEDIA GALLERY (PHOTOS & VIDEOS) */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              {allVideos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                    <VideoIcon size={14} className="text-[#ccff00]" />
                    <span>Workout Videos ({allVideos.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {allVideos.map((videoUrl, vIdx) => (
                      <div
                        key={vIdx}
                        className="rounded-2xl overflow-hidden bg-black border border-glass shadow-lg"
                      >
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-96 object-contain rounded-2xl"
                        />
                        <div className="p-2.5 bg-slate-900/80 flex items-center justify-between text-xs text-slate-300">
                          <span className="font-mono text-[11px]">Video #{vIdx + 1}</span>
                          <span className="text-[10px] text-slate-400">Recorded Effort Clip</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allPhotos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#ccff00]" />
                    <span>Activity Photos ({allPhotos.length})</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allPhotos.map((photoUrl, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setZoomImage({ src: photoUrl, title: `${activity.title} (Photo ${pIdx + 1})` })}
                        className="group relative rounded-2xl overflow-hidden bg-slate-900 aspect-square cursor-pointer border border-glass hover:border-[#ccff00] transition-all shadow-md"
                      >
                        <img
                          src={photoUrl}
                          alt={`Activity photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          <span>🔍 Tap to Zoom</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allVideos.length === 0 && allPhotos.length === 0 && (
                <div className="p-8 text-center text-sub italic text-xs">
                  No media attached to this activity.
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* SOCIAL & COMMENTS SECTION (AUTHENTIC STRAVA COMMENTS) */}
          {/* ----------------------------------------------------------------- */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onKudos(activity.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activity.isLiked
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20'
                }`}
              >
                <span>👏</span>
                <span>{activity.isLiked ? 'Kudos Given' : 'Give Kudos'}</span>
                <span className="ml-1 font-mono">({activity.likesCount || 0})</span>
              </button>

              {onOpenFlyby && activity.gpsActivity && (
                <button
                  onClick={() => onOpenFlyby(activity)}
                  className="rounded-xl border border-white/10 bg-white/5 text-xs py-2 px-3 text-muted-foreground hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>🛰️ 3D Flyby Replay</span>
                </button>
              )}
            </div>

            {/* Comments Thread */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-display">
                <MessageSquare size={13} />
                <span>Comments &amp; Athlete Banter ({activity.comments?.length || 0})</span>
              </h4>

              {activity.comments && activity.comments.length > 0 ? (
                <div className="space-y-2">
                  {activity.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#121824] border border-white/5 flex items-start gap-2.5"
                    >
                      <span className="text-base">{c.avatar}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white font-display">{c.userName}</h5>
                          <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No comments yet. Be the first to cheer!</p>
              )}

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Leave athlete encouragement..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#121824] border border-white/10 text-xs text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50 transition shadow-sm flex items-center gap-1"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for Activity Photos */}
      {zoomImage && (
        <ZoomableImageModal
          imageSrc={zoomImage.src}
          title={zoomImage.title}
          onClose={() => setZoomImage(null)}
        />
      )}
    </div>
  );
};
