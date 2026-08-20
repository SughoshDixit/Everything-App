import React, { useState } from 'react';
import type { WorkoutSessionLog, UserProfile, UserFitnessProfile } from '../types';
import { month1Calendar } from '../utils/calisthenicsCalendar';
import {
  yellowDudeExercises,
  yellowDudeComboRoutines
} from '../utils/yellowDudePlaybook';
import type { ComboWorkoutRoutine } from '../utils/yellowDudePlaybook';
import { ComboWorkoutPlayer } from './ComboWorkoutPlayer';
import { OnboardingModal } from './OnboardingModal';
import { speakExerciseIntro } from '../utils/audioCoach';
import {
  Play,
  Layers,
  Flame,
  Volume2,
  Calendar,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen
} from 'lucide-react';

interface CalisthenicsTabProps {
  logs: WorkoutSessionLog[];
  currentProfile: UserProfile;
  onLogWorkout: (log: Omit<WorkoutSessionLog, 'id' | 'date'>) => void;
}

export const CalisthenicsTab: React.FC<CalisthenicsTabProps> = ({
  logs,
  currentProfile,
  onLogWorkout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'combos' | 'calendar' | 'library' | 'history'>('combos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1); // Day 1
  const [expandedExId, setExpandedExId] = useState<string | null>(null);

  // Active Combo Workout Session State
  const [activeComboRoutine, setActiveComboRoutine] = useState<ComboWorkoutRoutine | null>(null);

  // User Fitness Profile
  const [fitnessProfile, setFitnessProfile] = useState<UserFitnessProfile>({
    gender: 'male',
    heightCm: 175,
    weightKg: 70,
    pushupBaseline: 5,
    pullupBaseline: 0,
    primaryGoal: 'football_winger',
    caloricTarget: 2600,
    proteinTargetGrams: 130
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  const categories = [
    { id: 'all', name: 'All Progressions' },
    { id: 'push', name: 'Push (Chest & Triceps)' },
    { id: 'pull', name: 'Pull (Lats & Biceps)' },
    { id: 'squat', name: 'Squats & Legs' }
  ];

  const filteredExercises = selectedCategory === 'all'
    ? yellowDudeExercises
    : yellowDudeExercises.filter((ex) => ex.category === selectedCategory);

  const selectedDayPlan = month1Calendar.find((d) => d.dayNumber === selectedDayNum) || month1Calendar[0];

  // 1-Click Launch Combo from Calendar Day
  const handleLaunchCalendarDayCombo = (dayPlan: typeof selectedDayPlan) => {
    let matchedRoutine = yellowDudeComboRoutines[0];
    if (dayPlan.focusCategory.includes('Pull')) {
      matchedRoutine = yellowDudeComboRoutines[1];
    } else if (dayPlan.focusCategory.includes('Football') || dayPlan.focusCategory.includes('Core')) {
      matchedRoutine = yellowDudeComboRoutines[2];
    } else if (dayPlan.focusCategory.includes('Match')) {
      matchedRoutine = yellowDudeComboRoutines[3];
    }
    setActiveComboRoutine(matchedRoutine);
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero Header */}
      <div className="calisthenics-hero glass-card flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="badge-pill bg-cyan flex items-center gap-1 inline-flex">
            <Zap className="icon-xs text-cyan fill-current" />
            <span>YELLOW DUDE CALISTHENICS PLAYBOOK</span>
          </div>
          <h2 className="mt-1">Calisthenics Mastery & Combo Workouts</h2>
          <p className="text-sub text-sm">
            Push · Pull · Squat progressions with 3-minute dynamic warmups, authentic illustrations & voice coaching.
          </p>
        </div>

        <button
          className="btn-secondary text-xs flex items-center gap-1"
          onClick={() => setShowOnboardingModal(true)}
        >
          <SlidersHorizontal className="icon-xs" />
          <span>Baseline: {fitnessProfile.pushupBaseline} Push-Ups</span>
        </button>
      </div>

      {/* Subtab Navigation */}
      <div className="subtab-bar">
        <button
          className={`subtab-btn ${activeSubTab === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('combos')}
        >
          <Flame className="icon-xs" />
          <span>⚡ Guided Combos</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('calendar')}
        >
          <Calendar className="icon-xs" />
          <span>📅 30-Day Plan</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('library')}
        >
          <BookOpen className="icon-xs" />
          <span>📖 Playbook Library</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <Layers className="icon-xs" />
          <span>📜 Workout History</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. GUIDED COMBOS SUBTAB */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'combos' && (
        <div className="subtab-content grid grid-cols-1 md:grid-cols-2 gap-4">
          {yellowDudeComboRoutines.map((routine, idx) => (
            <div
              key={routine.id}
              className="glass-card card-stagger card-hover-lift flex flex-col justify-between"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="badge-pill bg-cyan">{routine.badge}</span>
                  <span className="text-xs font-bold text-amber-400">
                    3m Warmup + 60s Rest + {routine.exercises.length} Exercises
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{routine.title}</h3>
                <p className="text-xs text-sub mb-3 leading-relaxed">{routine.description}</p>

                {/* Exercises Preview Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {routine.exercises.map((ex, i) => (
                    <span key={i} className="text-[10px] bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {ex.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary w-full btn-large flex items-center justify-center gap-1 pulse-glow bg-lime-400 text-black hover:bg-lime-300 font-black uppercase tracking-wider text-xs"
                onClick={() => setActiveComboRoutine(routine)}
              >
                <Play size={16} fill="#000" />
                <span>Launch Combo Workout Session</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. 30-DAY CALENDAR PLAN */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'calendar' && (
        <div className="subtab-content flex flex-col gap-4">
          {/* Day Selector Pills */}
          <div className="category-bar">
            {month1Calendar.map((d) => (
              <button
                key={d.dayNumber}
                className={`cat-pill ${selectedDayNum === d.dayNumber ? 'active' : ''}`}
                onClick={() => setSelectedDayNum(d.dayNumber)}
              >
                Day {d.dayNumber} {d.dayNumber === 1 ? '(TODAY)' : ''}
              </button>
            ))}
          </div>

          {/* Selected Day Details Card */}
          <div className="glass-card card-stagger">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <div>
                <span className="badge-pill bg-cyan">{selectedDayPlan.focusCategory}</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedDayPlan.dayTitle}</h3>
                <div className="text-xs text-sub mt-0.5">
                  <Calendar className="icon-xs inline mr-1" />
                  {selectedDayPlan.dateString}
                </div>
              </div>

              <button
                className="btn-primary btn-large bg-lime-400 text-black hover:bg-lime-300 font-black uppercase tracking-wider text-xs flex items-center gap-1"
                onClick={() => handleLaunchCalendarDayCombo(selectedDayPlan)}
              >
                <Play size={16} fill="#000" />
                <span>Start Day {selectedDayNum} Combo Workout</span>
              </button>
            </div>

            {/* Exercise List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {selectedDayPlan.exercises.map((ex, i) => (
                <div key={i} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">{ex.name}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                      {ex.sets} &times; {ex.reps}
                    </span>
                  </div>
                  <div className="text-[11px] text-sub">{ex.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. YELLOW DUDE PLAYBOOK LIBRARY */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'library' && (
        <div className="subtab-content flex flex-col gap-4">
          {/* Category Filter */}
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Exercise Grid with Authentic Yellow Dude Illustrations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((ex, idx) => {
              const isExpanded = expandedExId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="glass-card card-stagger card-hover-lift flex flex-col justify-between overflow-hidden"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div>
                    {/* Authentic Playbook Illustration Image */}
                    <div className="bg-zinc-950 rounded-lg p-2 border border-zinc-900 mb-3 flex items-center justify-center overflow-hidden h-44">
                      <img
                        src={ex.image}
                        alt={ex.name}
                        className="h-full object-contain rounded"
                      />
                    </div>

                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-[10px] font-extrabold text-cyan tracking-wider uppercase">
                          {ex.levelName}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{ex.name}</h4>
                      </div>
                      <span className="badge-pill bg-emerald text-[10px]">
                        {ex.recommendedSets} &times; {ex.recommendedReps}
                      </span>
                    </div>

                    <p className="text-xs text-sub line-clamp-2 mt-1 mb-2 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  {/* Actions & Expandable Details */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <button
                        className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"
                        onClick={() => speakExerciseIntro(ex)}
                        title="Listen to Voice Instructions & Benefits"
                      >
                        <Volume2 size={13} className="text-lime-400" />
                        <span>Hear Audio</span>
                      </button>

                      <button
                        className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"
                        onClick={() => setExpandedExId(isExpanded ? null : ex.id)}
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        <span>{isExpanded ? 'Hide' : 'Form Cues'}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="collapsible-content text-xs mt-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                        <div className="font-bold text-lime-400 mb-1 flex items-center gap-1">
                          <Zap size={12} />
                          <span>Key Form Cues:</span>
                        </div>
                        <ul className="list-disc list-inside text-zinc-300 mb-2 space-y-0.5">
                          {ex.keyCues.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>

                        <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                          <Award size={12} />
                          <span>Key Benefits:</span>
                        </div>
                        <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
                          {ex.keyBenefits.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. WORKOUT HISTORY */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'history' && (
        <div className="subtab-content glass-card card-stagger">
          <h3 className="text-lg font-bold text-white mb-3">Workout Session Logs</h3>

          {logs.length === 0 ? (
            <p className="text-xs text-sub py-6 text-center">
              No workout sessions logged yet. Launch a Combo Workout above to start your training record!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-pill bg-cyan text-[10px]">{log.date}</span>
                      <h4 className="font-bold text-white">{log.exerciseName}</h4>
                    </div>
                    <div className="text-xs text-sub mt-1">
                      Sets Completed: <strong>{log.setsCompleted} sets</strong> ({log.repsCompleted.join(', ')} reps)
                    </div>
                  </div>
                  <span className="badge-pill bg-amber text-xs">RPE {log.perceivedExertion}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ONBOARDING QUESTIONNAIRE MODAL */}
      {showOnboardingModal && (
        <OnboardingModal
          initialProfile={fitnessProfile}
          onSaveProfile={(updated) => setFitnessProfile(updated)}
          onClose={() => setShowOnboardingModal(false)}
        />
      )}

      {/* ACTIVE COMBO WORKOUT PLAYER */}
      {activeComboRoutine && (
        <ComboWorkoutPlayer
          routine={activeComboRoutine}
          onFinishWorkout={(log) => {
            onLogWorkout({
              userId: currentProfile === 'women' ? 'women' : 'men',
              exerciseId: activeComboRoutine.id,
              exerciseName: log.exerciseName,
              setsCompleted: log.setsCompleted,
              repsCompleted: log.repsCompleted,
              perceivedExertion: 8,
              notes: log.notes
            });
            setActiveComboRoutine(null);
          }}
          onClose={() => setActiveComboRoutine(null)}
        />
      )}
    </div>
  );
};
