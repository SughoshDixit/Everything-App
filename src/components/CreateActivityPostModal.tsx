import React, { useState } from 'react';
import type {
  StravaActivityPost,
  CompiledActivityItem,
  GpsActivityLog,
  WorkoutSessionLog,
  FootballDrill,
  UserProfile,
  MotivationalQuote,
  PostBackgroundTheme,
  SocialShareCardData
} from '../types';
import {
  shareSocialCardNative,
  downloadSocialCardImage
} from '../utils/socialCardGenerator';
import {
  ChevronLeft,
  Share2,
  Download,
  Image as ImageIcon,
  Check,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';

interface CreateActivityPostModalProps {
  initialPost?: StravaActivityPost | null;
  todayGpsActivities: GpsActivityLog[];
  todayWorkoutLogs: WorkoutSessionLog[];
  todayFootballDrills?: FootballDrill[];
  currentProfile: UserProfile;
  quotesList: MotivationalQuote[];
  onSavePost: (post: StravaActivityPost) => void;
  onClose: () => void;
}

export const CreateActivityPostModal: React.FC<CreateActivityPostModalProps> = ({
  initialPost,
  todayGpsActivities,
  todayWorkoutLogs,
  currentProfile,
  quotesList,
  onSavePost,
  onClose
}) => {
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ---------------------------------------------------------------------------
  // 1. COMPILE TODAY'S WORKOUTS (STRICTLY EXCLUDING WARM-UPS)
  // ---------------------------------------------------------------------------
  const buildInitialCompiledItems = (): CompiledActivityItem[] => {
    if (initialPost && initialPost.activities.length > 0) {
      return initialPost.activities;
    }

    const items: CompiledActivityItem[] = [];

    // Add GPS activities
    todayGpsActivities.forEach((gps) => {
      items.push({
        id: `comp_gps_${gps.id}`,
        category: gps.activityType === 'run' ? 'gps_run' : gps.activityType === 'cycle' ? 'gps_cycle' : 'gps_walk',
        title: `${gps.distanceKm} km ${gps.activityType === 'run' ? 'Run' : 'Ride'}`,
        details: `${Math.floor(gps.durationSeconds / 60)}m • ${gps.avgPaceMinKm} • +${gps.elevationGainMeters || 0}m`,
        gpsActivityId: gps.id,
        includedInPost: true
      });
    });

    // Add Calisthenics workouts (sets & reps, NO warm-up)
    todayWorkoutLogs.forEach((w) => {
      const totalReps = w.repsCompleted.reduce((a, b) => a + b, 0);
      items.push({
        id: `comp_w_${w.id}`,
        category: 'calisthenics',
        title: w.exerciseName,
        details: `${w.setsCompleted} Sets (${w.repsCompleted.join(', ')} reps) • ${totalReps} Reps`,
        workoutLogId: w.id,
        includedInPost: true
      });
    });

    return items;
  };

  const [activities, setActivities] = useState<CompiledActivityItem[]>(buildInitialCompiledItems);
  const [postTitle, setPostTitle] = useState<string>(() => {
    if (initialPost) return initialPost.title;
    if (todayGpsActivities.length > 0 && todayWorkoutLogs.length > 0) {
      return 'Outdoor Run & Calisthenics Combo';
    } else if (todayGpsActivities.length > 0) {
      return `${todayGpsActivities[0].distanceKm} km ${todayGpsActivities[0].activityType === 'run' ? 'Tempo Run' : 'Cycling Session'}`;
    } else if (todayWorkoutLogs.length > 0) {
      return 'Explosive Calisthenics Session';
    }
    return 'Daily Performance & Discipline Workout';
  });

  const [description, setDescription] = useState<string>(initialPost?.description || '');
  const [rpe, setRpe] = useState<number>(initialPost?.rpe || 8);
  const [theme, setTheme] = useState<PostBackgroundTheme>(initialPost?.backgroundTheme || 'cyber_neon');
  const [customMediaUrl, setCustomMediaUrl] = useState<string | undefined>(initialPost?.customMediaUrl);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [savedBadge, setSavedBadge] = useState<boolean>(false);

  const activeQuote = quotesList[quoteIndex % Math.max(1, quotesList.length)] || {
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Aristotle'
  };

  const handleToggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, includedInPost: !a.includedInPost } : a))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomMediaUrl(dataUrl);
      setTheme('custom_image');
    };
    reader.readAsDataURL(file);
  };

  // Build card data for generator
  const includedItems = activities.filter((a) => a.includedInPost);
  const totalDistance = todayGpsActivities
    .filter((g) => includedItems.some((i) => i.gpsActivityId === g.id))
    .reduce((acc, g) => acc + g.distanceKm, 0);

  const totalHeartPts =
    todayGpsActivities.reduce((acc, g) => acc + (g.heartPointsEarned || 0), 0) +
    todayWorkoutLogs.length * 15;

  const totalMoveMins =
    todayGpsActivities.reduce((acc, g) => acc + Math.round(g.durationSeconds / 60), 0) +
    todayWorkoutLogs.length * 20;

  const cardData: SocialShareCardData = {
    title: postTitle,
    workoutType: includedItems.length > 1 ? 'Daily Summary' : includedItems[0]?.title || 'Workout',
    stats: [
      { label: 'Workouts', value: `${includedItems.length}`, unit: 'Done' },
      { label: 'Distance', value: `${totalDistance.toFixed(1)}`, unit: 'km' },
      { label: 'Time', value: `${totalMoveMins}`, unit: 'min' },
      { label: 'Points', value: `+${totalHeartPts}`, unit: 'pts' }
    ],
    activityItems: includedItems.map((i) => ({
      title: i.title,
      details: i.details,
      icon: i.category === 'calisthenics' ? '⚡' : i.category.includes('run') ? '🏃' : '🚴'
    })),
    motivationalQuote: activeQuote.text,
    quoteAuthor: activeQuote.author,
    streakDays: 14,
    date: initialPost?.date || todayStr,
    persona: currentProfile,
    backgroundTheme: theme,
    customMediaUrl
  };

  const handleSave = () => {
    const postToSave: StravaActivityPost = {
      id: initialPost?.id || `post_${Date.now()}`,
      date: initialPost?.date || todayStr,
      timestamp: initialPost?.timestamp || Date.now(),
      userId: currentProfile,
      title: postTitle,
      description,
      rpe,
      activities: includedItems,
      gpsActivity: todayGpsActivities[0],
      backgroundTheme: theme,
      customMediaUrl,
      motivationalQuote: activeQuote.text,
      quoteAuthor: activeQuote.author,
      totalHeartPoints: totalHeartPts,
      totalMoveMinutes: totalMoveMins,
      totalCalories: totalMoveMins * 6,
      totalDistanceKm: totalDistance,
      likesCount: initialPost?.likesCount || 1,
      isLiked: initialPost?.isLiked || false
    };

    onSavePost(postToSave);
    setSavedBadge(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareSocialCardNative(cardData, format);
    setIsSharing(false);
  };

  const handleDownload = async () => {
    await downloadSocialCardImage(cardData, format);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      <div className="modal-content google-card animate-scale-up max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 flex flex-col gap-4">
        {/* App Bar Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3">
          <button
            className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block">
              ACTIVITY POST STUDIO
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5">
              {initialPost ? 'Edit Post' : "Compile Today's Post"}
            </h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. WORKOUT COMPILATION CARD */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-card p-4 rounded-2xl border border-glass flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sub uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-cyan-500" />
              <span>Activities Included ({includedItems.length})</span>
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
              {includedItems.length > 0 ? 'Tap to toggle' : 'None selected'}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="py-4 flex flex-col items-center justify-center text-center">
              <Sparkles size={20} className="text-cyan-500 mb-1.5 opacity-80" />
              <p className="text-xs text-sub font-medium">No workouts logged yet today.</p>
              <span className="text-[11px] text-muted mt-0.5">Track a run, ride, or calisthenics session to auto-compile!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleToggleActivity(act.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    act.includedInPost
                      ? 'bg-purple-500/10 border-[#55198B]/50 text-main shadow-sm'
                      : 'bg-card border-glass text-sub opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {act.category === 'calisthenics' ? '⚡' : act.category.includes('run') ? '🏃' : '🚴'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-main">{act.title}</h4>
                      <p className="text-[11px] text-[#55198B] dark:text-[#c084fc] font-medium mt-0.5">{act.details}</p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      act.includedInPost ? 'bg-[#55198B] border-[#7b29be] text-white shadow-sm' : 'border-slate-600'
                    }`}
                  >
                    {act.includedInPost && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 2. POST TITLE & EXERTION (RPE) */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-card p-4 rounded-2xl border border-glass flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold text-sub uppercase tracking-wider block mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-glass rounded-2xl px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-cyan-500 transition-all"
              placeholder="e.g. Explosive Push & 5K Tempo Run..."
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-sub uppercase">Exertion (RPE)</span>
                <span className="text-xs font-black font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <Zap size={12} className="text-amber-500" />
                  <span>{rpe} / 10</span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-sub uppercase tracking-wider block mb-1.5">
              Athlete Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-glass rounded-2xl p-3 text-xs text-main outline-none focus:border-cyan-500 transition-all resize-none"
              placeholder="Felt strong on the final sprint. Clean form throughout sets..."
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. POSTER THEME & CUSTOM PHOTO */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-card p-4 rounded-2xl border border-glass flex flex-col gap-2.5">
          <label className="text-[11px] font-bold text-sub uppercase tracking-wider block">
            Poster Visual Theme & Media
          </label>
          <div className="grid grid-cols-5 gap-2">
            <button
              className={`py-2.5 px-2 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'cyber_neon' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('cyber_neon')}
            >
              <span className="text-base">🌌</span>
              <span className="mt-1">Neon</span>
            </button>

            <button
              className={`py-2.5 px-2 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'strava_sunset' ? 'bg-amber-500/20 border-amber-400 text-amber-500 shadow-sm' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('strava_sunset')}
            >
              <span className="text-base">🌅</span>
              <span className="mt-1">Sunset</span>
            </button>

            <button
              className={`py-2.5 px-2 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'electric_aurora' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-500 shadow-sm' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('electric_aurora')}
            >
              <span className="text-base">🌊</span>
              <span className="mt-1">Aurora</span>
            </button>

            <button
              className={`py-2.5 px-2 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'monochrome_titanium' ? 'bg-slate-500/20 border-slate-400 text-slate-300 shadow-sm' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('monochrome_titanium')}
            >
              <span className="text-base">🛡️</span>
              <span className="mt-1">Titanium</span>
            </button>

            {/* Custom Photo Upload */}
            <label className="py-2.5 px-2 rounded-2xl border border-glass bg-card hover:bg-card-hover text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
              <ImageIcon size={18} />
              <span className="mt-1">{customMediaUrl ? 'Photo ✓' : 'Custom'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. MOTIVATIONAL QUOTE */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-main italic truncate flex-1">
            "{activeQuote.text}"
          </p>

          <button
            className="btn-google-tonal text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
            onClick={() => setQuoteIndex((prev) => prev + 1)}
            title="Cycle Quote"
          >
            <RefreshCw size={12} />
            <span>Shuffle</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 5. FORMAT & PRIMARY ACTIONS */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex flex-col gap-3 pt-2 border-t border-glass">
          {/* Format Selector Pills */}
          <div className="flex items-center justify-center gap-2">
            <button
              className={format === 'story' ? 'btn-google-primary text-xs py-1.5 px-4' : 'btn-google-outlined text-xs py-1.5 px-4'}
              onClick={() => setFormat('story')}
            >
              Story (9:16)
            </button>
            <button
              className={format === 'square' ? 'btn-google-primary text-xs py-1.5 px-4' : 'btn-google-outlined text-xs py-1.5 px-4'}
              onClick={() => setFormat('square')}
            >
              Feed Post (1:1)
            </button>
          </div>

          {/* Main Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              className="btn-google-primary text-xs py-3 flex items-center justify-center gap-1.5 shadow-md"
              onClick={handleSave}
            >
              {savedBadge ? <CheckCircle2 size={16} className="text-white" /> : <Sparkles size={16} />}
              <span>{savedBadge ? 'Saved!' : 'Save Post'}</span>
            </button>

            <button
              className="btn-google-tonal text-xs py-3 flex items-center justify-center gap-1.5"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 size={16} />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>

            <button
              className="btn-google-outlined text-xs py-3 flex items-center justify-center gap-1.5"
              onClick={handleDownload}
            >
              <Download size={16} />
              <span>PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
