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
  SocialShareCardData,
  GpsLocationPoint
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
  Layers,
  Video
} from 'lucide-react';

interface CreateActivityPostModalProps {
  initialPost?: StravaActivityPost | null;
  todayGpsActivities: GpsActivityLog[];
  todayWorkoutLogs: WorkoutSessionLog[];
  todayFootballDrills?: FootballDrill[];
  currentProfile: UserProfile;
  quotesList: MotivationalQuote[];
  onSavePost: (post: StravaActivityPost) => void;
  onOpenShareStudio?: (data: SocialShareCardData) => void;
  onClose: () => void;
}

export const CreateActivityPostModal: React.FC<CreateActivityPostModalProps> = ({
  initialPost,
  todayGpsActivities,
  todayWorkoutLogs,
  todayFootballDrills = [],
  currentProfile,
  quotesList,
  onSavePost,
  onOpenShareStudio,
  onClose
}) => {
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ---------------------------------------------------------------------------
  // 1. COMPILE TODAY'S WORKOUTS (DESELECTED BY DEFAULT AS REQUESTED)
  // ---------------------------------------------------------------------------
  const buildInitialCompiledItems = (): CompiledActivityItem[] => {
    if (initialPost && initialPost.activities.length > 0) {
      return initialPost.activities;
    }

    const items: CompiledActivityItem[] = [];

    // Add GPS activities (Walk, Run, Cycle, Drive) - DESELECTED BY DEFAULT
    todayGpsActivities.forEach((gps) => {
      const typeLabel = gps.activityType === 'run' ? '🏃 Run' : gps.activityType === 'cycle' ? '🚴 Ride' : gps.activityType === 'walk' ? '🚶 Walk' : '🚗 Drive';
      items.push({
        id: `comp_gps_${gps.id}`,
        category: gps.activityType === 'run' ? 'gps_run' : gps.activityType === 'cycle' ? 'gps_cycle' : 'gps_walk',
        title: `${gps.distanceKm} km ${typeLabel}`,
        details: `${Math.floor(gps.durationSeconds / 60)}m • ${gps.avgPaceMinKm} • +${gps.elevationGainMeters || 0}m`,
        gpsActivityId: gps.id,
        includedInPost: false // Deselected by default!
      });
    });

    // Add Calisthenics workouts (sets & reps) - DESELECTED BY DEFAULT
    todayWorkoutLogs.forEach((w) => {
      const totalReps = w.repsCompleted.reduce((a, b) => a + b, 0);
      items.push({
        id: `comp_w_${w.id}`,
        category: 'calisthenics',
        title: `💪 ${w.exerciseName}`,
        details: `${w.setsCompleted} Sets (${w.repsCompleted.join(', ')} reps) • ${totalReps} Reps`,
        workoutLogId: w.id,
        includedInPost: false // Deselected by default!
      });
    });

    // Add Football Drills if logged today - DESELECTED BY DEFAULT
    todayFootballDrills.forEach((drill) => {
      items.push({
        id: `comp_fb_${drill.id}`,
        category: 'football',
        title: `⚽ ${drill.title}`,
        details: `${drill.intensity.toUpperCase()} • ${drill.durationMinutes}m drill`,
        includedInPost: false // Deselected by default!
      });
    });

    return items;
  };

  const [activities, setActivities] = useState<CompiledActivityItem[]>(buildInitialCompiledItems);
  const [postTitle, setPostTitle] = useState<string>(() => {
    if (initialPost) return initialPost.title;
    const hasWalk = todayGpsActivities.some(g => g.activityType === 'walk');
    const hasRun = todayGpsActivities.some(g => g.activityType === 'run');
    const hasCycle = todayGpsActivities.some(g => g.activityType === 'cycle');

    if (hasCycle && hasRun) {
      const cycleDist = todayGpsActivities.find(g => g.activityType === 'cycle')?.distanceKm || 0;
      const runDist = todayGpsActivities.find(g => g.activityType === 'run')?.distanceKm || 0;
      return `${cycleDist}k Ride ➔ ${runDist}k Run (Brick Session) 🚴🏃`;
    } else if (hasWalk && hasRun) {
      return 'Park Run & Commute Walk Triathlon 🏃🚶';
    } else if (todayGpsActivities.length > 0 && todayWorkoutLogs.length > 0) {
      return 'Outdoor Cardio & Calisthenics Combo 💪';
    } else if (todayGpsActivities.length > 0) {
      const first = todayGpsActivities[0];
      return `${first.distanceKm} km ${first.activityType === 'run' ? 'Tempo Run' : first.activityType === 'walk' ? 'Mindful Walk' : 'Cycling Session'}`;
    } else if (todayWorkoutLogs.length > 0) {
      return 'Explosive Calisthenics Session';
    }
    return 'Daily Performance & Discipline Workout';
  });

  const [description, setDescription] = useState<string>(initialPost?.description || '');
  const [rpe, setRpe] = useState<number>(initialPost?.rpe || 8);
  const [theme, setTheme] = useState<PostBackgroundTheme>(initialPost?.backgroundTheme || 'cyber_neon');
  const [photos, setPhotos] = useState<string[]>(() => {
    if (initialPost?.photos && initialPost.photos.length > 0) return initialPost.photos;
    if (initialPost?.customMediaUrl) return [initialPost.customMediaUrl];
    return [];
  });
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [customMediaUrl, setCustomMediaUrl] = useState<string | undefined>(initialPost?.customMediaUrl);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [customQuoteText, setCustomQuoteText] = useState<string>(initialPost?.motivationalQuote || '');
  const [customQuoteAuthor, setCustomQuoteAuthor] = useState<string>(initialPost?.quoteAuthor || (currentProfile === 'men' ? 'Sughosh' : 'Shreya'));
  const [useCustomQuote, setUseCustomQuote] = useState<boolean>(!!initialPost?.motivationalQuote);
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [savedBadge, setSavedBadge] = useState<boolean>(false);

  const defaultActiveQuote = quotesList[quoteIndex % Math.max(1, quotesList.length)] || {
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Aristotle'
  };

  const activeQuote = useCustomQuote && customQuoteText.trim()
    ? { text: customQuoteText.trim(), author: customQuoteAuthor.trim() || (currentProfile === 'men' ? 'Sughosh' : 'Shreya') }
    : defaultActiveQuote;

  const handleToggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, includedInPost: !a.includedInPost } : a))
    );
  };

  const handleSelectAll = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, includedInPost: true })));
  };

  const handleDeselectAll = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, includedInPost: false })));
  };

  const handleSelectLatestOnly = () => {
    setActivities((prev) =>
      prev.map((a, idx) => ({
        ...a,
        includedInPost: idx === 0 || (prev.length > 1 && idx === 1 && a.category !== prev[0].category)
      }))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) resolve(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newPhotos) => {
      setPhotos((prev) => {
        const updated = [...prev, ...newPhotos];
        setSelectedPhotoIdx(updated.length - 1);
        setCustomMediaUrl(updated[updated.length - 1]);
        setTheme('custom_image');
        return updated;
      });
    });
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

  // Construct multi-stage sequential route segments
  const activeGpsLogs = todayGpsActivities.filter((g) => includedItems.some((i) => i.gpsActivityId === g.id));
  const multiStageRoutes = activeGpsLogs.map((gps, idx) => ({
    stageIndex: idx + 1,
    title: `${gps.distanceKm} km ${gps.activityType.toUpperCase()}`,
    activityType: gps.activityType,
    distanceKm: gps.distanceKm,
    points: gps.routePoints && gps.routePoints.length > 0 ? gps.routePoints : []
  }));

  // Concatenate all points across stages for unified video track
  const allSequentialPoints: GpsLocationPoint[] = [];
  multiStageRoutes.forEach((stage) => {
    if (stage.points.length > 0) {
      allSequentialPoints.push(...stage.points);
    }
  });

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
    customMediaUrl: photos[selectedPhotoIdx] || customMediaUrl,
    photos,
    selectedPhotoIndex: selectedPhotoIdx,
    routePoints: allSequentialPoints.length > 0 ? allSequentialPoints : (todayGpsActivities[0]?.routePoints || []),
    multiStageRoutes,
    recordBadges: initialPost?.recordBadges
  };

  const handleSave = () => {
    let sportType: 'run' | 'cycle' | 'calisthenics' | 'football' | 'walk' | 'workout' = 'workout';
    if (includedItems.some((i) => i.category === 'gps_run')) sportType = 'run';
    else if (includedItems.some((i) => i.category === 'gps_cycle')) sportType = 'cycle';
    else if (includedItems.some((i) => i.category === 'calisthenics')) sportType = 'calisthenics';
    else if (includedItems.some((i) => i.category === 'football')) sportType = 'football';

    const postToSave: StravaActivityPost = {
      id: initialPost?.id || `post_${Date.now()}`,
      date: initialPost?.date || todayStr,
      timestamp: initialPost?.timestamp || Date.now(),
      userId: currentProfile,
      title: postTitle,
      description,
      sportType: initialPost?.sportType || sportType,
      rpe,
      activities: includedItems,
      gpsActivity: todayGpsActivities[0],
      backgroundTheme: theme,
      customMediaUrl: photos[selectedPhotoIdx] || customMediaUrl,
      photos,
      motivationalQuote: activeQuote.text,
      quoteAuthor: activeQuote.author,
      totalHeartPoints: totalHeartPts,
      totalMoveMinutes: totalMoveMins,
      totalCalories: totalMoveMins * 6,
      totalDistanceKm: totalDistance,
      totalSets: todayWorkoutLogs.reduce((acc, w) => acc + w.setsCompleted, 0) || 12,
      totalReps: todayWorkoutLogs.reduce((acc, w) => acc + w.repsCompleted.reduce((a, b) => a + b, 0), 0) || 160,
      elevationGainMeters: todayGpsActivities.reduce((acc, g) => acc + (g.elevationGainMeters || 0), 0),
      avgPaceMinKm: todayGpsActivities[0]?.avgPaceMinKm || '5:04 /km',
      likesCount: initialPost?.likesCount || 1,
      isLiked: initialPost?.isLiked || false,
      comments: initialPost?.comments || [],
      recordBadges: initialPost?.recordBadges,
      videoUrls: initialPost?.videoUrls
    };

    onSavePost(postToSave);
    setSavedBadge(true);
    setTimeout(() => {
      onClose();
    }, 900);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e131b] p-5 sm:p-6 shadow-2xl text-foreground font-sans flex flex-col gap-4">
        {/* App Bar Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-white/20 hover:text-white transition"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary flex items-center justify-center gap-1">
              <Sparkles size={11} /> POST STUDIO
            </span>
            <h3 className="text-sm md:text-base font-extrabold text-white mt-0.5 font-display">
              {initialPost ? 'Edit Post' : "Compile Today's Post"}
            </h3>
          </div>

          <button
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. WORKOUT COMPILATION CARD (DESELECTED BY DEFAULT + QUICK BUTTONS) */}
        {/* ------------------------------------------------------------------- */}
        <div className="rounded-2xl border border-border bg-[#10151d] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-display">
              <Layers size={14} className="text-primary" />
              <span>Activities Included ({includedItems.length} of {activities.length})</span>
            </span>

            {/* Quick Action Selection Buttons */}
            {activities.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectLatestOnly}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition"
                  title="Select only today's most recent activities"
                >
                  Latest Only
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-white transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-white transition"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {activities.length === 0 ? (
            <div className="py-5 flex flex-col items-center justify-center text-center">
              <Sparkles size={22} className="text-primary mb-2 opacity-80" />
              <p className="text-xs text-white font-semibold">No workouts logged yet today.</p>
              <span className="text-[11px] text-muted-foreground mt-0.5">Track a run, ride, calisthenics or football drill to compile!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleToggleActivity(act.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    act.includedInPost
                      ? 'border-primary/50 bg-primary/10 text-white shadow-sm'
                      : 'border-white/5 bg-[#141a24]/50 text-muted-foreground hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {act.category === 'calisthenics' ? '⚡' : act.category === 'football' ? '⚽' : act.category.includes('run') ? '🏃' : '🚴'}
                    </span>
                    <div>
                      <h4 className={`text-xs font-bold ${act.includedInPost ? 'text-white' : 'text-slate-300'}`}>
                        {act.title}
                      </h4>
                      <p className={`text-[11px] font-medium mt-0.5 ${act.includedInPost ? 'text-primary' : 'text-muted-foreground'}`}>
                        {act.details}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      act.includedInPost
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                        : 'border-white/20 bg-white/5 text-transparent'
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
        <div className="rounded-2xl border border-border bg-[#10151d] p-4 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 font-display">
              Post Title
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-[#080b11] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
              placeholder="e.g. Explosive Push & 5K Tempo Run..."
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Exertion (RPE)</span>
                <span className="text-xs font-black font-mono text-primary flex items-center gap-1">
                  <Zap size={12} className="text-dude" />
                  <span>{rpe} / 10</span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 font-display">
              Athlete Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#080b11] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 transition-all resize-none placeholder:text-muted-foreground/60"
              placeholder="Felt strong on the final sprint. Clean form throughout sets..."
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. POSTER THEME & CUSTOM PHOTO */}
        {/* ------------------------------------------------------------------- */}
        <div className="rounded-2xl border border-border bg-[#10151d] p-4 flex flex-col gap-2.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-display">
            Poster Visual Theme & Media
          </label>
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'cyber_neon' ? 'bg-primary/15 border-primary text-primary shadow-sm' : 'bg-[#080b11] border-white/10 text-muted-foreground hover:text-white'
              }`}
              onClick={() => setTheme('cyber_neon')}
            >
              <span className="text-base">🌌</span>
              <span className="mt-1">Neon</span>
            </button>

            <button
              type="button"
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'strava_sunset' ? 'bg-[#fc4c02]/15 border-[#fc4c02] text-[#ff9667] shadow-sm' : 'bg-[#080b11] border-white/10 text-muted-foreground hover:text-white'
              }`}
              onClick={() => setTheme('strava_sunset')}
            >
              <span className="text-base">🌅</span>
              <span className="mt-1">Sunset</span>
            </button>

            <button
              type="button"
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'electric_aurora' ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-sm' : 'bg-[#080b11] border-white/10 text-muted-foreground hover:text-white'
              }`}
              onClick={() => setTheme('electric_aurora')}
            >
              <span className="text-base">🌊</span>
              <span className="mt-1">Aurora</span>
            </button>

            <button
              type="button"
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                theme === 'monochrome_titanium' ? 'bg-slate-400/15 border-slate-400 text-slate-300 shadow-sm' : 'bg-[#080b11] border-white/10 text-muted-foreground hover:text-white'
              }`}
              onClick={() => setTheme('monochrome_titanium')}
            >
              <span className="text-base">🛡️</span>
              <span className="mt-1">Titanium</span>
            </button>

            {/* Custom Photo Upload */}
            <label className="py-2 px-1.5 rounded-xl border border-white/10 bg-[#080b11] hover:border-white/20 text-[11px] font-bold text-dude flex flex-col items-center justify-center text-center cursor-pointer transition-all">
              <ImageIcon size={17} />
              <span className="mt-1">{photos.length > 0 ? `${photos.length} Photo${photos.length > 1 ? 's' : ''}` : 'Photos'}</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Photos thumbnail preview row */}
          {photos.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/10">
              {photos.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedPhotoIdx(idx);
                    setCustomMediaUrl(p);
                    setTheme('custom_image');
                  }}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                    selectedPhotoIdx === idx ? 'border-primary scale-105 shadow-md' : 'border-white/10 opacity-70'
                  }`}
                >
                  <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. POST QUOTE & ATHLETE FEELING */}
        {/* ------------------------------------------------------------------- */}
        <div className="rounded-2xl border border-border bg-[#10151d] p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-display">
              <span>✍️ Post Quote & Motivation</span>
            </span>
            <div className="flex items-center gap-1 bg-[#080b11] p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setUseCustomQuote(true)}
                className={`text-[10px] font-bold py-1 px-2.5 rounded-md transition-all ${
                  useCustomQuote ? 'bg-dude text-black shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
              >
                My Own Quote
              </button>
              <button
                type="button"
                onClick={() => setUseCustomQuote(false)}
                className={`text-[10px] font-bold py-1 px-2.5 rounded-md transition-all ${
                  !useCustomQuote ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Preset Quotes
              </button>
            </div>
          </div>

          {useCustomQuote ? (
            <div className="flex flex-col gap-2 animate-fade-in">
              <textarea
                value={customQuoteText}
                onChange={(e) => setCustomQuoteText(e.target.value)}
                placeholder="Type your own quote, workout feeling, or thought (e.g. Legs were on fire, but the mind stayed peaceful!)..."
                rows={2}
                className="w-full bg-[#080b11] border border-white/10 rounded-xl p-2.5 text-xs text-white font-medium placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-all resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Author:</span>
                  <input
                    type="text"
                    value={customQuoteAuthor}
                    onChange={(e) => setCustomQuoteAuthor(e.target.value)}
                    placeholder="Your Name / Sughosh"
                    className="bg-[#080b11] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-primary font-bold outline-none flex-1"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">Will appear on poster & video ✨</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#080b11] border border-white/10 p-2.5 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
              <p className="text-xs font-medium text-white italic truncate flex-1">
                "{defaultActiveQuote.text}"
              </p>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-white hover:border-white/20 shrink-0 transition"
                onClick={() => setQuoteIndex((prev) => prev + 1)}
                title="Cycle Quote"
              >
                <RefreshCw size={11} />
                <span>Shuffle</span>
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 5. FORMAT & PRIMARY ACTIONS */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
          {/* Format Selector Pills */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              className={`text-xs py-1.5 px-4 rounded-xl font-bold transition-all ${
                format === 'story'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-white/10 bg-white/5 text-muted-foreground hover:text-white'
              }`}
              onClick={() => setFormat('story')}
            >
              Story (9:16)
            </button>
            <button
              type="button"
              className={`text-xs py-1.5 px-4 rounded-xl font-bold transition-all ${
                format === 'square'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-white/10 bg-white/5 text-muted-foreground hover:text-white'
              }`}
              onClick={() => setFormat('square')}
            >
              Feed Post (1:1)
            </button>
          </div>

          {/* Video Studio CTA Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-[#fc4c02]/10 to-transparent border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Video size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Create Video Clip with Audio</span>
                <span className="text-[10px] text-muted-foreground">Animated track route + high-res export</span>
              </div>
            </div>
            {onOpenShareStudio && (
              <button
                type="button"
                className="text-xs py-1.5 px-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition shrink-0"
                onClick={() => onOpenShareStudio(cardData)}
              >
                Open Studio &rarr;
              </button>
            )}
          </div>

          {/* Main Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              className="rounded-xl bg-primary text-primary-foreground py-3 text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
              onClick={handleSave}
            >
              {savedBadge ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
              <span>{savedBadge ? 'Saved!' : 'Save Post'}</span>
            </button>

            <button
              type="button"
              className="rounded-xl border border-primary/40 bg-primary/10 text-primary py-3 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 active:scale-95 transition-all"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 size={16} />
              <span>{isSharing ? 'Sharing...' : 'Share Poster'}</span>
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/25 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              onClick={handleDownload}
            >
              <Download size={16} />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
