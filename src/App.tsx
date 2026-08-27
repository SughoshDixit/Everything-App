import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import type { TabType } from './components/Navigation';
import { SughoshDixitPortfolioTab } from './components/SughoshDixitPortfolioTab';
import { GoogleFitHomeDashboard } from './components/GoogleFitHomeDashboard';
import { StravaActivityFeed } from './components/StravaActivityFeed';
import { CreateActivityPostModal } from './components/CreateActivityPostModal';
import { StravaActivityDetailModal } from './components/StravaActivityDetailModal';
import { StravaAthleteProfileModal } from './components/StravaAthleteProfileModal';
import { DisciplineTab } from './components/DisciplineTab';
import { CalisthenicsTab } from './components/CalisthenicsTab';
import { FootballTab } from './components/FootballTab';
import { NutritionTab } from './components/NutritionTab';
import { PeriodTab } from './components/PeriodTab';
import { MusicVedasTab } from './components/MusicVedasTab';
import { SettingsVaultTab } from './components/SettingsVaultTab';
import { GpsActivityTrackerModal } from './components/GpsActivityTrackerModal';
import { SocialWorkoutShareModal } from './components/SocialWorkoutShareModal';
import { StravaRouteFlybyPlayer } from './components/StravaRouteFlybyPlayer';

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
} from './types';

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
} from './utils/storage';

import { initialCycleLogs, initialCycleSettings } from './utils/cycleTracker';
import { defaultMilestones } from './utils/milestonesTracker';

export function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile>('men');
  const [activeTab, setActiveTab] = useState<TabType>('fithub');

  // App Data State
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

  // Period / Menstruation Tracker State
  const [periodLogs, setPeriodLogs] = useState<CycleLogsMap>(() =>
    loadFromStorage(KEYS.PERIOD_LOGS, initialCycleLogs)
  );
  const [periodSettings, setPeriodSettings] = useState<CycleSettings>(() =>
    loadFromStorage(KEYS.PERIOD_SETTINGS, initialCycleSettings)
  );

  // Modal States
  const [gpsModalActivityType, setGpsModalActivityType] = useState<'run' | 'cycle' | 'walk' | null>(null);
  const [activeShareCardData, setActiveShareCardData] = useState<SocialShareCardData | null>(null);
  const [flybyActivity, setFlybyActivity] = useState<GpsActivityLog | null>(null);
  const [editingPost, setEditingPost] = useState<StravaActivityPost | null | undefined>(undefined);
  const [selectedStravaActivityDetail, setSelectedStravaActivityDetail] = useState<StravaActivityPost | null>(null);
  const [showAthleteProfileModal, setShowAthleteProfileModal] = useState<boolean>(false);

  // Sync state to local storage
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
    saveToStorage(KEYS.GPS_ACTIVITIES, gpsActivities);
  }, [gpsActivities]);

  useEffect(() => {
    saveToStorage(KEYS.STRAVA_POSTS, stravaPosts);
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

  // Handlers
  const handleToggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddRoutine = (newRoutine: Omit<RoutineItem, 'id' | 'completed'>) => {
    const created: RoutineItem = {
      ...newRoutine,
      id: 'r_' + Date.now(),
      completed: false
    };
    setRoutines((prev) => [created, ...prev]);
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
  };

  const handleSaveGpsActivity = (log: GpsActivityLog, updatedMilestones: PersonalMilestones) => {
    setGpsActivities((prev) => [log, ...prev]);
    setMilestones(updatedMilestones);
  };

  const handleSaveStravaPost = (post: StravaActivityPost) => {
    setStravaPosts((prev) => {
      const exists = prev.some((p) => p.id === post.id);
      if (exists) {
        return prev.map((p) => (p.id === post.id ? post : p));
      }
      return [post, ...prev];
    });
  };

  const handleDeletePost = (id: string) => {
    setStravaPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLikePost = (id: string) => {
    setStravaPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1) }
          : p
      )
    );
    if (selectedStravaActivityDetail && selectedStravaActivityDetail.id === id) {
      setSelectedStravaActivityDetail((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: (prev.likesCount || 0) + (prev.isLiked ? -1 : 1)
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
      routePoints: post.gpsActivity?.routePoints,
      showRouteOverlay: !!post.gpsActivity?.routePoints && post.gpsActivity.routePoints.length > 1,
      templateStyle: 'strava_classic'
    });
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        currentProfile={currentProfile}
        onSelectProfile={setCurrentProfile}
        stats={stats}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Tab Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* View Content */}
      <main className="app-main">
        {activeTab === 'fithub' && (
          <GoogleFitHomeDashboard
            currentProfile={currentProfile}
            workoutLogs={workoutLogs}
            gpsActivities={gpsActivities}
            milestones={milestones}
            quotes={quotes}
            onOpenGpsTracker={(type) => setGpsModalActivityType(type)}
            onOpenCalisthenics={() => setActiveTab('calisthenics')}
            onOpenFootball={() => setActiveTab('football')}
            onOpenSocialShare={(data) => setActiveShareCardData(data)}
            onOpenFlyby={(act) => setFlybyActivity(act)}
            onOpenCreatePost={() => setEditingPost(null)}
            onOpenFeed={() => setActiveTab('feed')}
          />
        )}

        {activeTab === 'feed' && (
          <StravaActivityFeed
            currentProfile={currentProfile}
            posts={stravaPosts}
            quotes={quotes}
            onOpenCreatePost={() => setEditingPost(null)}
            onEditPost={(post) => setEditingPost(post)}
            onDeletePost={handleDeletePost}
            onLikePost={handleLikePost}
            onOpenFlyby={(act) => setFlybyActivity(act)}
            onOpenSocialShare={(post) => openShareFromPost(post)}
            onSelectActivityDetail={(post) => setSelectedStravaActivityDetail(post)}
            onOpenAthleteProfile={() => setShowAthleteProfileModal(true)}
            onStartTracking={() => setGpsModalActivityType('run')}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'calisthenics' && (
          <CalisthenicsTab
            logs={workoutLogs}
            currentProfile={currentProfile}
            onLogWorkout={handleLogWorkout}
            onOpenCreatePost={() => setEditingPost(null)}
          />
        )}

        {activeTab === 'routine' && (
          <DisciplineTab
            currentProfile={currentProfile}
            routines={routines}
            quotes={quotes}
            stats={stats}
            onToggleRoutine={handleToggleRoutine}
            onAddRoutine={handleAddRoutine}
          />
        )}

        {activeTab === 'football' && (
          <FootballTab
            drills={footballDrills}
            onOpenCreatePost={() => setEditingPost(null)}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab currentProfile={currentProfile} />
        )}

        {activeTab === 'sughoshdixit' && (
          <SughoshDixitPortfolioTab onOpenCreatePost={() => setEditingPost(null)} />
        )}

        {activeTab === 'period' && (
          <PeriodTab
            currentProfile={currentProfile}
            logs={periodLogs}
            settings={periodSettings}
            onUpdateLogs={setPeriodLogs}
            onUpdateSettings={setPeriodSettings}
          />
        )}

        {activeTab === 'music_veda' && (
          <MusicVedasTab
            carnaticItems={carnaticItems}
            instrumentSongs={instrumentSongs}
            vedaSuktas={vedaSuktas}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsVaultTab quotes={quotes} onAddQuote={handleAddQuote} />
        )}
      </main>

      {/* STRAVA ACTIVITY DETAIL & SPLITS ANALYSIS MODAL */}
      {selectedStravaActivityDetail && (
        <StravaActivityDetailModal
          activity={selectedStravaActivityDetail}
          currentProfile={currentProfile}
          onClose={() => setSelectedStravaActivityDetail(null)}
          onKudos={handleLikePost}
          onAddComment={handleAddComment}
          onOpenSocialShare={(act) => openShareFromPost(act)}
          onOpenFlyby={(act) => {
            if (act.gpsActivity) {
              setSelectedStravaActivityDetail(null);
              setFlybyActivity(act.gpsActivity);
            }
          }}
        />
      )}

      {/* STRAVA ATHLETE PROFILE & TRAINING HEATMAP MODAL */}
      {showAthleteProfileModal && (
        <StravaAthleteProfileModal
          currentProfile={currentProfile}
          milestones={milestones}
          onClose={() => setShowAthleteProfileModal(false)}
        />
      )}

      {/* GPS LIVE TRACKER MODAL */}
      {gpsModalActivityType && (
        <GpsActivityTrackerModal
          initialActivityType={gpsModalActivityType}
          currentProfile={currentProfile}
          currentMilestones={milestones}
          onSaveActivity={handleSaveGpsActivity}
          onOpenFlyby={(log) => {
            setGpsModalActivityType(null);
            setFlybyActivity(log);
          }}
          onOpenSocialShare={(log) => {
            setGpsModalActivityType(null);
            openShareFromGps(log);
          }}
          onClose={() => setGpsModalActivityType(null)}
        />
      )}

      {/* STRAVA-STYLE ROUTE FLYBY MODAL */}
      {flybyActivity && (
        <StravaRouteFlybyPlayer
          activity={flybyActivity}
          onOpenSocialShare={(act) => {
            openShareFromGps(act);
          }}
          onCreatePostFromActivity={() => {
            setFlybyActivity(null);
            setEditingPost(null);
          }}
          onClose={() => setFlybyActivity(null)}
        />
      )}

      {/* STRAVA ACTIVITY POST CREATOR / COMPILER / EDITOR MODAL */}
      {editingPost !== undefined && (
        <CreateActivityPostModal
          initialPost={editingPost}
          todayGpsActivities={gpsActivities}
          todayWorkoutLogs={workoutLogs}
          todayFootballDrills={footballDrills}
          currentProfile={currentProfile}
          quotesList={quotes}
          onSavePost={handleSaveStravaPost}
          onOpenShareStudio={(cardData) => {
            setEditingPost(undefined);
            setActiveShareCardData(cardData);
          }}
          onClose={() => setEditingPost(undefined)}
        />
      )}

      {/* SOCIAL WORKOUT SHARE POSTER MODAL */}
      {activeShareCardData && (
        <SocialWorkoutShareModal
          initialData={activeShareCardData}
          quotesList={quotes}
          onClose={() => setActiveShareCardData(null)}
        />
      )}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Sughosh Dixit &bull; Kuchh Bhii App &bull; Performance & Discipline Suite</p>
      </footer>
    </div>
  );
}

export default App;
