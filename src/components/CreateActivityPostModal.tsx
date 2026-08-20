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
  Zap
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
      <div className="modal-content google-card animate-scale-up max-w-lg w-full max-h-[94vh] overflow-y-auto p-5 md:p-6 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-2">
          <button
            className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              POST STUDIO
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5">
              {initialPost ? 'Edit Activity Post' : "Compile Today's Post"}
            </h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. WORKOUT COMPILATION SELECTION (CENTERED, MINIMAL) */}
        {/* ------------------------------------------------------------------- */}
        <div className="my-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-bold text-sub uppercase flex items-center gap-1">
              <span>📋</span>
              <span>Activities ({includedItems.length})</span>
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="p-4 rounded-2xl bg-card border border-glass flex flex-col items-center justify-center text-center">
              <Sparkles size={18} className="text-cyan-500 mb-1" />
              <p className="text-xs text-sub">No activities logged yet today.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleToggleActivity(act.id)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    act.includedInPost
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-main shadow-sm'
                      : 'bg-card border-glass text-sub opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {act.category === 'calisthenics' ? '⚡' : act.category.includes('run') ? '🏃' : '🚴'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-main leading-tight">{act.title}</h4>
                      <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">{act.details}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      act.includedInPost ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-600'
                    }`}
                  >
                    {act.includedInPost && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 2. TITLE & RPE (CLEAN & CENTERED) */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-1.5">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-card border border-glass rounded-2xl px-3.5 py-2.5 text-xs font-bold text-main outline-none focus:border-cyan-500"
              placeholder="Post Title..."
            />
          </div>

          <div className="bg-card border border-glass rounded-2xl px-3 py-2 flex items-center justify-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <input
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(Number(e.target.value))}
              className="w-16 accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs font-black font-mono text-cyan-600 dark:text-cyan-400">{rpe}/10</span>
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="my-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={1}
            className="w-full bg-card border border-glass rounded-2xl p-2.5 text-xs text-main outline-none focus:border-cyan-500"
            placeholder="Athlete notes (optional)..."
          />
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. THEME CHIPS (CENTERED, MINIMAL ICON-FIRST) */}
        {/* ------------------------------------------------------------------- */}
        <div className="my-1.5">
          <div className="grid grid-cols-5 gap-1.5">
            <button
              className={`p-2 rounded-2xl border text-[10px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'cyber_neon' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-600 dark:text-cyan-400' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('cyber_neon')}
            >
              <span>🌌</span>
              <span className="mt-0.5">Neon</span>
            </button>

            <button
              className={`p-2 rounded-2xl border text-[10px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'strava_sunset' ? 'bg-amber-500/20 border-amber-400 text-amber-500' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('strava_sunset')}
            >
              <span>🌅</span>
              <span className="mt-0.5">Sunset</span>
            </button>

            <button
              className={`p-2 rounded-2xl border text-[10px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'electric_aurora' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-500' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('electric_aurora')}
            >
              <span>🌊</span>
              <span className="mt-0.5">Aurora</span>
            </button>

            <button
              className={`p-2 rounded-2xl border text-[10px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'monochrome_titanium' ? 'bg-slate-500/20 border-slate-400 text-slate-300' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('monochrome_titanium')}
            >
              <span>🛡️</span>
              <span className="mt-0.5">Titanium</span>
            </button>

            {/* Custom Photo Uploader */}
            <label className="p-2 rounded-2xl border border-glass bg-card hover:bg-card-hover text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
              <ImageIcon size={14} />
              <span className="mt-0.5">{customMediaUrl ? 'Photo ✓' : 'Custom'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. MOTIVATIONAL QUOTE BANNER (CENTERED, MINIMAL) */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl my-1.5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-main italic truncate flex-1 text-center">
            "{activeQuote.text}"
          </p>

          <button
            className="btn-google-tonal text-[10px] py-1 px-2 flex items-center gap-1 shrink-0"
            onClick={() => setQuoteIndex((prev) => prev + 1)}
          >
            <RefreshCw size={11} />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center justify-center gap-2 my-1.5">
          <button
            className={format === 'story' ? 'btn-google-primary text-xs py-1 px-3.5' : 'btn-google-outlined text-xs py-1 px-3.5'}
            onClick={() => setFormat('story')}
          >
            Story (9:16)
          </button>
          <button
            className={format === 'square' ? 'btn-google-primary text-xs py-1 px-3.5' : 'btn-google-outlined text-xs py-1 px-3.5'}
            onClick={() => setFormat('square')}
          >
            Square (1:1)
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 5. ACTION BUTTONS: SAVE & SHARE */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2.5 border-t border-glass">
          <button
            className="btn-google-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
            onClick={handleSave}
          >
            {savedBadge ? <CheckCircle2 size={15} className="text-white" /> : <Sparkles size={15} />}
            <span>{savedBadge ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            className="btn-google-tonal text-xs py-2.5 flex items-center justify-center gap-1.5"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 size={15} />
            <span>{isSharing ? 'Sharing...' : 'Share'}</span>
          </button>

          <button
            className="btn-google-outlined text-xs py-2.5 flex items-center justify-center gap-1.5"
            onClick={handleDownload}
          >
            <Download size={15} />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
