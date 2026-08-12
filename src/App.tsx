import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import type { TabType } from './components/Navigation';
import { DisciplineTab } from './components/DisciplineTab';
import { CalisthenicsTab } from './components/CalisthenicsTab';
import { FootballTab } from './components/FootballTab';
import { NutritionTab } from './components/NutritionTab';
import { MusicVedasTab } from './components/MusicVedasTab';
import { SettingsVaultTab } from './components/SettingsVaultTab';

import type {
  UserProfile,
  RoutineItem,
  MotivationalQuote,
  CalisthenicsExercise,
  WorkoutSessionLog,
  FootballDrill,
  CarnaticYouTubeItem,
  InstrumentSong,
  VedaSukta,
  UserStats
} from './types';

import {
  loadFromStorage,
  saveToStorage,
  KEYS,
  initialRoutines,
  initialQuotes,
  initialCalisthenics,
  initialFootballDrills,
  initialCarnaticItems,
  initialInstrumentSongs,
  initialVedaSuktas,
  initialStats
} from './utils/storage';

export function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile>('men');
  const [activeTab, setActiveTab] = useState<TabType>('routine');

  // App Data State
  const [routines, setRoutines] = useState<RoutineItem[]>(() =>
    loadFromStorage(KEYS.ROUTINES, initialRoutines)
  );
  const [quotes, setQuotes] = useState<MotivationalQuote[]>(() =>
    loadFromStorage(KEYS.QUOTES, initialQuotes)
  );
  const [calisthenics] = useState<CalisthenicsExercise[]>(() =>
    loadFromStorage(KEYS.CALISTHENICS, initialCalisthenics)
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>(() =>
    loadFromStorage(KEYS.WORKOUT_LOGS, [])
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
    saveToStorage(KEYS.STATS, stats);
  }, [stats]);

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

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        currentProfile={currentProfile}
        onSelectProfile={setCurrentProfile}
        stats={stats}
      />

      {/* Main Tab Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* View Content */}
      <main className="app-main">
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

        {activeTab === 'calisthenics' && (
          <CalisthenicsTab
            exercises={calisthenics}
            logs={workoutLogs}
            currentProfile={currentProfile}
            onLogWorkout={handleLogWorkout}
          />
        )}

        {activeTab === 'football' && (
          <FootballTab drills={footballDrills} />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab currentProfile={currentProfile} />
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

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Everything App &bull; Performance & Discipline Suite</p>
      </footer>
    </div>
  );
}

export default App;
