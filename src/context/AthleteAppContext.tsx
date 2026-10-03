import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  RoutineItem,
  MotivationalQuote,
  WorkoutSessionLog,
  FootballDrill,
  CarnaticYouTubeItem,
  InstrumentSong,
  VedaSukta,
  UserStats,
  CycleLogsMap,
  CycleSettings,
  GpsActivityLog,
  PersonalMilestones,
  SocialShareCardData,
  StravaActivityPost,
  StravaComment
} from '../types';

import {
  loadFromStorage,
  saveToStorage,
  KEYS,
  initialRoutines,
  initialQuotes,
  initialFootballDrills,
  initialCarnaticItems,
  initialInstrumentSongs,
  initialVedaSuktas,
  initialStravaPosts,
  initialStats
} from '../utils/storage';

import { initialCycleLogs, initialCycleSettings } from '../utils/cycleTracker';
import { defaultMilestones, evaluateActivityRecords } from '../utils/milestonesTracker';

import {
  fetchMilestonesFromFirestore,
  subscribeFeedPosts,
  subscribeGpsActivities,
  saveGpsActivityToFirestore,
  saveMilestonesToFirestore,
  saveActivityPostToFirestore,
  deleteActivityPostFromFirestore,
  saveWorkoutLogToFirestore,
  saveRoutinesToFirestore,
  togglePostLikeInFirestore,
  addCommentToPostInFirestore
} from '../services/firestoreService';

export interface AthleteAppContextType {
  currentProfile: UserProfile;
  setCurrentProfile: (p: UserProfile) => void;
  routines: RoutineItem[];
  quotes: MotivationalQuote[];
  workoutLogs: WorkoutSessionLog[];
  gpsActivities: GpsActivityLog[];
  stravaPosts: StravaActivityPost[];
  milestones: PersonalMilestones;
  footballDrills: FootballDrill[];
  carnaticItems: CarnaticYouTubeItem[];
  instrumentSongs: InstrumentSong[];
  vedaSuktas: VedaSukta[];
  stats: UserStats;
  periodLogs: CycleLogsMap;
  periodSettings: CycleSettings;
  setPeriodLogs: React.Dispatch<React.SetStateAction<CycleLogsMap>>;
  setPeriodSettings: React.Dispatch<React.SetStateAction<CycleSettings>>;
  // Handlers
  handleToggleRoutine: (id: string) => void;
  handleAddRoutine: (newRoutine: Omit<RoutineItem, 'id' | 'completed'>) => void;
  handleAddQuote: (newQuote: Omit<MotivationalQuote, 'id'>) => void;
  handleLogWorkout: (log: Omit<WorkoutSessionLog, 'id' | 'date'>) => void;
  handleSaveGpsActivity: (log: GpsActivityLog, updatedMilestones: PersonalMilestones) => void;
  handleSaveStravaPost: (post: StravaActivityPost) => void;
  handleDeletePost: (id: string) => void;
  handleLikePost: (id: string) => void;
  handleAddComment: (activityId: string, text: string) => void;
  // Modal Triggers
  gpsModalActivityType: 'run' | 'cycle' | 'walk' | null;
  setGpsModalActivityType: (type: 'run' | 'cycle' | 'walk' | null) => void;
  activeShareCardData: SocialShareCardData | null;
  setActiveShareCardData: (data: SocialShareCardData | null) => void;
  flybyActivity: GpsActivityLog | null;
  setFlybyActivity: (act: GpsActivityLog | null) => void;
  editingPost: StravaActivityPost | null | undefined;
  setEditingPost: (post: StravaActivityPost | null | undefined) => void;
  selectedStravaActivityDetail: StravaActivityPost | null;
  setSelectedStravaActivityDetail: (post: StravaActivityPost | null) => void;
  showAthleteProfileModal: boolean;
  setShowAthleteProfileModal: (show: boolean) => void;
  openShareFromGps: (act: GpsActivityLog) => void;
  openShareFromPost: (post: StravaActivityPost) => void;
}

const AthleteAppContext = createContext<AthleteAppContextType | null>(null);

export const useAthleteApp = () => {
  const context = useContext(AthleteAppContext);
  if (!context) {
    throw new Error('useAthleteApp must be used within an AthleteAppProvider');
  }
  return context;
};

export const AthleteAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile>('men');

  const [routines, setRoutines] = useState<RoutineItem[]>(() =>
    loadFromStorage(KEYS.ROUTINES, initialRoutines)
  );
  const [quotes, setQuotes] = useState<MotivationalQuote[]>(() =>
    loadFromStorage(KEYS.QUOTES, initialQuotes)
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>(() =>
    loadFromStorage(KEYS.WORKOUT_LOGS, [])
  );
  const [gpsActivities, setGpsActivities] = useState<GpsActivityLog[]>(() =>
    loadFromStorage(KEYS.GPS_ACTIVITIES, [])
  );
  const [stravaPosts, setStravaPosts] = useState<StravaActivityPost[]>(() =>
    loadFromStorage(KEYS.STRAVA_POSTS, initialStravaPosts)
  );
  const [milestones, setMilestones] = useState<PersonalMilestones>(() =>
    loadFromStorage(KEYS.PERSONAL_MILESTONES, defaultMilestones)
  );
  const [footballDrills] = useState<FootballDrill[]>(() =>
    loadFromStorage(KEYS.FOOTBALL_DRILLS, initialFootballDrills)
  );
  const [carnaticItems] = useState<CarnaticYouTubeItem[]>(() =>
    loadFromStorage(KEYS.CARNATIC, initialCarnaticItems)
  );
  const [instrumentSongs] = useState<InstrumentSong[]>(() =>
    loadFromStorage(KEYS.INSTRUMENTS, initialInstrumentSongs)
  );
  const [vedaSuktas] = useState<VedaSukta[]>(() =>
    loadFromStorage(KEYS.VEDAS, initialVedaSuktas)
  );
  const [stats] = useState<UserStats>(() =>
    loadFromStorage(KEYS.STATS, initialStats)
  );

  const [periodLogs, setPeriodLogs] = useState<CycleLogsMap>(() =>
    loadFromStorage(KEYS.PERIOD_LOGS, initialCycleLogs)
  );
  const [periodSettings, setPeriodSettings] = useState<CycleSettings>(() =>
    loadFromStorage(KEYS.PERIOD_SETTINGS, initialCycleSettings)
  );

  // Modals
  const [gpsModalActivityType, setGpsModalActivityType] = useState<'run' | 'cycle' | 'walk' | null>(null);
  const [activeShareCardData, setActiveShareCardData] = useState<SocialShareCardData | null>(null);
  const [flybyActivity, setFlybyActivity] = useState<GpsActivityLog | null>(null);
  const [editingPost, setEditingPost] = useState<StravaActivityPost | null | undefined>(undefined);
  const [selectedStravaActivityDetail, setSelectedStravaActivityDetail] = useState<StravaActivityPost | null>(null);
  const [showAthleteProfileModal, setShowAthleteProfileModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    saveToStorage(KEYS.ROUTINES, routines);
  }, [routines]);

  useEffect(() => {
    saveToStorage(KEYS.QUOTES, quotes);
  }, [quotes]);

  useEffect(() => {
    saveToStorage(KEYS.WORKOUT_LOGS, workoutLogs);
  }, [workoutLogs]);

  useEffect(() => {
    saveToStorage(KEYS.GPS_ACTIVITIES, gpsActivities, 1500);
  }, [gpsActivities]);

  useEffect(() => {
    saveToStorage(KEYS.STRAVA_POSTS, stravaPosts, 1500);
  }, [stravaPosts]);

  useEffect(() => {
    saveToStorage(KEYS.PERSONAL_MILESTONES, milestones);
  }, [milestones]);

  useEffect(() => {
    saveToStorage(KEYS.STATS, stats);
  }, [stats]);

  useEffect(() => {
    saveToStorage(KEYS.PERIOD_LOGS, periodLogs);
  }, [periodLogs]);

  useEffect(() => {
    saveToStorage(KEYS.PERIOD_SETTINGS, periodSettings);
  }, [periodSettings]);

  // Firestore synchronization
  useEffect(() => {
    const unsubFeed = subscribeFeedPosts((remotePosts) => {
      if (remotePosts && remotePosts.length > 0) {
        setStravaPosts(remotePosts);
      }
    });

    const unsubGps = subscribeGpsActivities('sughosh', (remoteActs) => {
      if (remoteActs && remoteActs.length > 0) {
        setGpsActivities(remoteActs);
      }
    });

    fetchMilestonesFromFirestore().then((remoteMilestones) => {
      if (remoteMilestones) {
        setMilestones(remoteMilestones);
      }
    }).catch(console.error);

    return () => {
      unsubFeed();
      unsubGps();
    };
  }, []);

  const handleToggleRoutine = (id: string) => {
    setRoutines((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
      saveRoutinesToFirestore(updated).catch(console.error);
      return updated;
    });
  };

  const handleAddRoutine = (newRoutine: Omit<RoutineItem, 'id' | 'completed'>) => {
    const created: RoutineItem = {
      ...newRoutine,
      id: 'r_' + Date.now(),
      completed: false
    };
    setRoutines((prev) => {
      const updated = [created, ...prev];
      saveRoutinesToFirestore(updated).catch(console.error);
      return updated;
    });
  };

  const handleAddQuote = (newQuote: Omit<MotivationalQuote, 'id'>) => {
    const created: MotivationalQuote = {
      ...newQuote,
      id: 'q_' + Date.now()
    };
    setQuotes((prev) => [created, ...prev]);
  };

  const handleLogWorkout = (log: Omit<WorkoutSessionLog, 'id' | 'date'>) => {
    const newLog: WorkoutSessionLog = {
      ...log,
      id: 'log_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setWorkoutLogs((prev) => [newLog, ...prev]);
    saveWorkoutLogToFirestore(newLog).catch(console.error);
  };

  const handleSaveGpsActivity = (log: GpsActivityLog, updatedMilestones: PersonalMilestones) => {
    setGpsActivities((prev) => [log, ...prev]);
    saveGpsActivityToFirestore(log).catch(console.error);

    const postDate = new Date(log.startTime || Date.now());
    const dateStr = postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const movingTimeMin = Math.max(1, Math.round(log.durationSeconds / 60));

    const sportLabel = log.activityType === 'run' ? 'Morning Run 🏃'
      : log.activityType === 'cycle' ? 'Outdoor Ride 🚴'
      : log.activityType === 'walk' ? 'Fitness Walk 🚶'
      : 'Road Trip 🚗';

    const newPost: StravaActivityPost = {
      id: log.id,
      date: dateStr,
      timestamp: log.startTime || Date.now(),
      userId: currentProfile === 'women' ? 'women' : 'men',
      title: log.title || sportLabel,
      description: log.notes || `Completed ${log.distanceKm} km in ${Math.floor(log.durationSeconds / 60)}m ${log.durationSeconds % 60}s with average pace ${log.avgPaceMinKm}.`,
      sportType: log.activityType,
      rpe: 7,
      activities: [
        {
          id: 'item_' + log.id,
          category: log.activityType === 'run' ? 'gps_run' : log.activityType === 'cycle' ? 'gps_cycle' : 'gps_walk',
          title: log.title || sportLabel,
          details: `${log.distanceKm} km • ${movingTimeMin} mins • Pace ${log.avgPaceMinKm}`,
          gpsActivityId: log.id,
          includedInPost: true
        }
      ],
      gpsActivity: log,
      backgroundTheme: 'strava_sunset',
      motivationalQuote: quotes[0]?.text || 'Consistency is what transforms average into excellence.',
      quoteAuthor: currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit',
      totalHeartPoints: log.heartPointsEarned || Math.round(movingTimeMin * (log.activityType === 'run' ? 2 : 1)),
      totalMoveMinutes: movingTimeMin,
      totalCalories: log.caloriesBurned || Math.round(log.distanceKm * 65),
      totalDistanceKm: log.distanceKm,
      avgPaceMinKm: log.avgPaceMinKm,
      avgSpeedKmh: log.durationSeconds > 0 ? Number((log.distanceKm / (log.durationSeconds / 3600)).toFixed(1)) : 0,
      maxSpeedKmh: log.maxSpeedKmh || 0,
      elevationGainMeters: log.elevationGainMeters || 0,
      likesCount: 1,
      isLiked: true,
      kudosUsers: [{ userId: currentProfile === 'women' ? 'women' : 'men', userName: currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit' }],
      gearName: log.activityType === 'cycle' ? 'Road Bike' : 'Nike Running',
      splits: log.splits || [],
      recordBadges: log.recordBadges,
      photos: log.mediaUrls,
      customMediaUrl: log.mediaUrls?.[0],
      videoUrls: log.videoUrls
    };

    setStravaPosts((prev) => [newPost, ...prev]);
    saveActivityPostToFirestore(newPost).catch((err) => console.error('Error saving post to firestore:', err));

    const workoutLog: WorkoutSessionLog = {
      id: 'session_' + log.id,
      date: new Date().toISOString().split('T')[0],
      userId: currentProfile === 'women' ? 'women' : 'men',
      exerciseId: log.activityType,
      exerciseName: sportLabel,
      setsCompleted: 1,
      repsCompleted: [Math.round(log.distanceKm * 1000)],
      perceivedExertion: 7,
      personalRecordBroken: !!(log.milestonesReached && log.milestonesReached.length > 0)
    };
    setWorkoutLogs((prev) => [workoutLog, ...prev]);
    saveWorkoutLogToFirestore(workoutLog).catch(console.error);

    setMilestones(updatedMilestones);
    saveMilestonesToFirestore(updatedMilestones).catch(console.error);
  };

  const handleSaveStravaPost = (post: StravaActivityPost) => {
    let postToSave = post;
    const { updatedMilestones, recordBadges } = evaluateActivityRecords(post, milestones);
    if (recordBadges && recordBadges.length > 0) {
      postToSave = {
        ...post,
        recordBadges: [...(post.recordBadges || []), ...recordBadges]
      };
      setMilestones(updatedMilestones);
      saveMilestonesToFirestore(updatedMilestones).catch(console.error);
    }

    setStravaPosts((prev) => {
      const exists = prev.some((p) => p.id === postToSave.id);
      if (exists) {
        return prev.map((p) => (p.id === postToSave.id ? postToSave : p));
      }
      return [postToSave, ...prev];
    });
    saveActivityPostToFirestore(postToSave).catch(console.error);
  };

  const handleDeletePost = (id: string) => {
    setStravaPosts((prev) => prev.filter((p) => p.id !== id));
    deleteActivityPostFromFirestore(id).catch(console.error);
  };

  const handleLikePost = (id: string) => {
    const post = stravaPosts.find((p) => p.id === id);
    const willBeLiked = post ? !post.isLiked : true;

    setStravaPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: willBeLiked, likesCount: (p.likesCount || 0) + (willBeLiked ? 1 : -1) }
          : p
      )
    );
    togglePostLikeInFirestore(
      id,
      {
        userId: currentProfile === 'women' ? 'women' : 'men',
        userName: currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit'
      },
      willBeLiked
    ).catch(console.error);

    if (selectedStravaActivityDetail && selectedStravaActivityDetail.id === id) {
      setSelectedStravaActivityDetail((prev) =>
        prev
          ? {
              ...prev,
              isLiked: willBeLiked,
              likesCount: (prev.likesCount || 0) + (willBeLiked ? 1 : -1)
            }
          : null
      );
    }
  };

  const handleAddComment = (activityId: string, text: string) => {
    const newComment: StravaComment = {
      id: 'c_' + Date.now(),
      userId: currentProfile,
      userName: currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit',
      avatar: currentProfile === 'women' ? '👩' : '👨',
      text,
      timestamp: Date.now()
    };
    addCommentToPostInFirestore(activityId, newComment).catch(console.error);

    setStravaPosts((prev) =>
      prev.map((p) =>
        p.id === activityId
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      )
    );
    if (selectedStravaActivityDetail && selectedStravaActivityDetail.id === activityId) {
      setSelectedStravaActivityDetail((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null
      );
    }
  };

  const openShareFromGps = (act: GpsActivityLog) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)] || {
      text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      author: 'Aristotle'
    };
    setActiveShareCardData({
      title: `${act.distanceKm} km ${act.activityType === 'run' ? 'Run' : 'Ride'}`,
      workoutType: act.activityType === 'run' ? 'Outdoor Running' : 'Outdoor Cycling',
      stats: [
        { label: 'Distance', value: `${act.distanceKm}`, unit: 'km' },
        { label: 'Avg Pace', value: act.avgPaceMinKm },
        { label: 'Ascent', value: `+${act.elevationGainMeters || 0}`, unit: 'm' },
        { label: 'Heart Points', value: `+${act.heartPointsEarned}`, unit: 'pts' }
      ],
      motivationalQuote: quote.text,
      quoteAuthor: quote.author,
      streakDays: 14,
      date: act.date,
      persona: currentProfile,
      routePoints: act.routePoints,
      showRouteOverlay: !!act.routePoints && act.routePoints.length > 1,
      photos: act.mediaUrls,
      customMediaUrl: act.mediaUrls?.[0],
      videoUrls: act.videoUrls,
      recordBadges: act.recordBadges,
      templateStyle: 'strava_classic'
    });
  };

  const openShareFromPost = (post: StravaActivityPost) => {
    setActiveShareCardData({
      title: post.title,
      workoutType: post.activities.length > 1 ? 'Consolidated Daily Session' : post.activities[0]?.title || 'Workout',
      stats: [
        { label: 'Workouts', value: `${post.activities.length}`, unit: 'Done' },
        { label: 'Distance', value: `${post.totalDistanceKm.toFixed(1)}`, unit: 'km' },
        { label: 'Move Time', value: `${post.totalMoveMinutes}`, unit: 'min' },
        { label: 'Heart Points', value: `+${post.totalHeartPoints}`, unit: 'pts' }
      ],
      activityItems: post.activities.map((i) => ({
        title: i.title,
        details: i.details,
        icon: i.category === 'calisthenics' ? '⚡' : i.category.includes('run') ? '🏃' : '🚴'
      })),
      motivationalQuote: post.motivationalQuote,
      quoteAuthor: post.quoteAuthor,
      streakDays: 14,
      date: post.date,
      persona: currentProfile,
      backgroundTheme: post.backgroundTheme,
      customMediaUrl: post.customMediaUrl,
      photos: post.photos,
      videoUrls: post.videoUrls,
      recordBadges: post.recordBadges,
      routePoints: post.gpsActivity?.routePoints,
      showRouteOverlay: !!post.gpsActivity?.routePoints && post.gpsActivity.routePoints.length > 1,
      templateStyle: 'strava_classic'
    });
  };

  return (
    <AthleteAppContext.Provider
      value={{
        currentProfile,
        setCurrentProfile,
        routines,
        quotes,
        workoutLogs,
        gpsActivities,
        stravaPosts,
        milestones,
        footballDrills,
        carnaticItems,
        instrumentSongs,
        vedaSuktas,
        stats,
        periodLogs,
        periodSettings,
        setPeriodLogs,
        setPeriodSettings,
        handleToggleRoutine,
        handleAddRoutine,
        handleAddQuote,
        handleLogWorkout,
        handleSaveGpsActivity,
        handleSaveStravaPost,
        handleDeletePost,
        handleLikePost,
        handleAddComment,
        gpsModalActivityType,
        setGpsModalActivityType,
        activeShareCardData,
        setActiveShareCardData,
        flybyActivity,
        setFlybyActivity,
        editingPost,
        setEditingPost,
        selectedStravaActivityDetail,
        setSelectedStravaActivityDetail,
        showAthleteProfileModal,
        setShowAthleteProfileModal,
        openShareFromGps,
        openShareFromPost
      }}
    >
      {children}
    </AthleteAppContext.Provider>
  );
};
