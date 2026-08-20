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
  Sparkles,
  Check,
  RefreshCw,
  CheckCircle2,
  X
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
  // 1. COMPILE TODAY'S WORKOUTS (EXCLUDING WARM-UPS)
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
        title: `${gps.distanceKm} km ${gps.activityType === 'run' ? 'Outdoor Run' : 'Outdoor Ride'}`,
        details: `${Math.floor(gps.durationSeconds / 60)} mins • Pace ${gps.avgPaceMinKm} • Ascent +${gps.elevationGainMeters || 0}m`,
        gpsActivityId: gps.id,
        includedInPost: true
      });
    });

    // Add Calisthenics workouts (strictly sets & reps, NO warm-up)
    todayWorkoutLogs.forEach((w) => {
      const totalReps = w.repsCompleted.reduce((a, b) => a + b, 0);
      items.push({
        id: `comp_w_${w.id}`,
        category: 'calisthenics',
        title: w.exerciseName,
        details: `${w.setsCompleted} Sets (${w.repsCompleted.join(', ')} reps) • Total ${totalReps} Reps`,
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
      return 'Outdoor Run & Calisthenics Mastery';
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
    workoutType: includedItems.length > 1 ? 'Consolidated Daily Session' : includedItems[0]?.title || 'Workout',
    stats: [
      { label: 'Workouts', value: `${includedItems.length}`, unit: 'Done' },
      { label: 'Distance', value: `${totalDistance.toFixed(1)}`, unit: 'km' },
      { label: 'Move Time', value: `${totalMoveMins}`, unit: 'min' },
      { label: 'Heart Points', value: `+${totalHeartPts}`, unit: 'pts' }
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
    }, 1200);
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
      <div className="modal-content google-card animate-scale-up max-w-xl w-full max-h-[94vh] overflow-y-auto p-5 md:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-3">
          <button
            className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              STRAVA-STYLE POST STUDIO
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5">
              {initialPost ? 'Edit Activity Post' : "Compile Today's Activity Post"}
            </h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. WORKOUT COMPILATION SELECTION */}
        {/* ------------------------------------------------------------------- */}
        <div className="my-2">
          <label className="text-xs font-bold text-sub uppercase tracking-wider block mb-1.5">
            1. Select Activities to Include in Post ({includedItems.length} selected)
          </label>

          {activities.length === 0 ? (
            <div className="p-3 rounded-2xl bg-card border border-glass text-xs text-sub text-center">
              No activities tracked yet today. Complete a run, cycling session, or calisthenics set to compile them!
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleToggleActivity(act.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    act.includedInPost
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-main'
                      : 'bg-card border-glass text-sub opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {act.category === 'calisthenics' ? '⚡' : act.category.includes('run') ? '🏃' : '🚴'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-main">{act.title}</h4>
                      <p className="text-[11px] text-sub">{act.details}</p>
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
        {/* 2. POST DETAILS (TITLE, NOTES, RPE) */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
          <div>
            <label className="text-xs font-bold text-sub uppercase tracking-wider block mb-1">
              Post Title
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-card border border-glass rounded-2xl px-3 py-2 text-xs font-bold text-main outline-none focus:border-cyan-500"
              placeholder="e.g. Morning 5K Tempo & Push-Up Flow"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-sub uppercase tracking-wider block mb-1">
              Perceived Exertion (RPE: {rpe}/10)
            </label>
            <div className="flex items-center gap-2 bg-card border border-glass rounded-2xl px-3 py-2">
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="flex-1 accent-cyan-500 cursor-pointer"
              />
              <span className="text-xs font-black font-mono text-cyan-600 dark:text-cyan-400">{rpe}/10</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-sub uppercase tracking-wider block mb-1">
              Athlete Notes & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-card border border-glass rounded-2xl p-3 text-xs text-main outline-none focus:border-cyan-500"
              placeholder="Felt explosive today on the 3rd set. Consistent pacing throughout..."
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. MESMERIZING BACKGROUND THEME & CUSTOM MEDIA UPLOADER */}
        {/* ------------------------------------------------------------------- */}
        <div className="my-2">
          <label className="text-xs font-bold text-sub uppercase tracking-wider block mb-1.5">
            3. Choose Mesmerizing Poster Background or Upload Custom Photo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              className={`p-2 rounded-2xl border text-[11px] font-bold transition-all ${
                theme === 'cyber_neon' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('cyber_neon')}
            >
              🌌 Cyber Neon
            </button>

            <button
              className={`p-2 rounded-2xl border text-[11px] font-bold transition-all ${
                theme === 'strava_sunset' ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('strava_sunset')}
            >
              🌅 Strava Sunset
            </button>

            <button
              className={`p-2 rounded-2xl border text-[11px] font-bold transition-all ${
                theme === 'electric_aurora' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('electric_aurora')}
            >
              🌊 Aurora Wave
            </button>

            <button
              className={`p-2 rounded-2xl border text-[11px] font-bold transition-all ${
                theme === 'monochrome_titanium' ? 'bg-slate-500/20 border-slate-400 text-slate-300' : 'bg-card border-glass text-sub'
              }`}
              onClick={() => setTheme('monochrome_titanium')}
            >
              🛡️ Titanium
            </button>

            {/* Custom Photo Uploader */}
            <label className="p-2 rounded-2xl border border-glass bg-card hover:bg-card-hover text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1 cursor-pointer transition-all">
              <ImageIcon size={14} />
              <span>{customMediaUrl ? 'Photo Added' : 'Custom Photo'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. MOTIVATIONAL QUOTE CYCLER */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl my-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold text-amber-500 uppercase">INCLUDED QUOTE</div>
            <p className="text-xs font-semibold text-main italic">"{activeQuote.text}"</p>
            <span className="text-[10px] text-amber-500 font-bold">— {activeQuote.author}</span>
          </div>

          <button
            className="btn-google-tonal text-xs py-1 px-2.5 flex items-center gap-1 shrink-0"
            onClick={() => setQuoteIndex((prev) => prev + 1)}
          >
            <RefreshCw size={12} />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center justify-center gap-2 my-2">
          <button
            className={format === 'story' ? 'btn-google-primary text-xs py-1 px-3' : 'btn-google-outlined text-xs py-1 px-3'}
            onClick={() => setFormat('story')}
          >
            Story (9:16)
          </button>
          <button
            className={format === 'square' ? 'btn-google-primary text-xs py-1 px-3' : 'btn-google-outlined text-xs py-1 px-3'}
            onClick={() => setFormat('square')}
          >
            Square (1:1)
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 5. ACTION BUTTONS: SAVE & SHARE */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-glass">
          <button
            className="btn-google-primary text-xs py-3"
            onClick={handleSave}
          >
            {savedBadge ? <CheckCircle2 size={16} className="text-white" /> : <Sparkles size={16} />}
            <span>{savedBadge ? 'Saved to Timeline!' : 'Save Activity Post'}</span>
          </button>

          <button
            className="btn-google-tonal text-xs py-3"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 size={16} />
            <span>{isSharing ? 'Sharing...' : 'Share (WhatsApp / Insta)'}</span>
          </button>

          <button
            className="btn-google-outlined text-xs py-3"
            onClick={handleDownload}
          >
            <Download size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
