import React, { useState, useEffect } from 'react';
import type { CalisthenicsExercise, WorkoutSessionLog, UserProfile, UserFitnessProfile } from '../types';
import { month1Calendar } from '../utils/calisthenicsCalendar';
import { playBeep, playRestCompleteChime } from '../utils/audio';
import { AnimatedExerciseGuideModal } from './AnimatedExerciseGuideModal';
import { WarmupGuideModal } from './WarmupGuideModal';
import { OnboardingModal } from './OnboardingModal';
import {
  Play,
  Check,
  Video,
  Layers,
  Sparkles,
  RotateCcw,
  Flame,
  Award,
  Info,
  Calendar,
  Film,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CalisthenicsTabProps {
  exercises: CalisthenicsExercise[];
  logs: WorkoutSessionLog[];
  currentProfile: UserProfile;
  onLogWorkout: (log: Omit<WorkoutSessionLog, 'id' | 'date'>) => void;
}

export const CalisthenicsTab: React.FC<CalisthenicsTabProps> = ({
  exercises,
  logs,
  currentProfile,
  onLogWorkout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'progressions' | 'video'>('calendar');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1); // Day 1 (TODAY)

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeExercise, setActiveExercise] = useState<CalisthenicsExercise | null>(null);

  // User Fitness Profile (Gender, Height, Weight, Pushup Baseline)
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

  // Expanded Accordion State for Minimalist UI (Action-driven text visibility)
  const [expandedExId, setExpandedExId] = useState<string | null>(null);

  // Warm-up completion & modal state
  const [warmupDone, setWarmupDone] = useState<boolean>(false);
  const [showWarmupModal, setShowWarmupModal] = useState<boolean>(false);

  // Animated Guide Modal state
  const [selectedAnimExercise, setSelectedAnimExercise] = useState<{
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
    notes: string;
  } | null>(null);

  // Timer & Workout session state
  const [activeSetIndex, setActiveSetIndex] = useState<number>(0);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [repsDone, setRepsDone] = useState<number[]>([]);
  const [currentRepsInput, setCurrentRepsInput] = useState<number>(10);

  // Category filtering
  const categories = [
    { id: 'all', name: 'All Progressions' },
    { id: 'push', name: 'Push (Chest & Triceps)' },
    { id: 'pull', name: 'Pull (Back & Biceps)' },
    { id: 'dip', name: 'Dips & Shoulders' },
    { id: 'legs', name: 'Legs & Agility' },
    { id: 'core', name: 'Core & Hollow Hold' }
  ];

  const filteredExercises = selectedCategory === 'all'
    ? exercises
    : exercises.filter((ex) => ex.category === selectedCategory);

  const selectedDayPlan = month1Calendar.find((d) => d.dayNumber === selectedDayNum) || month1Calendar[0];

  // Rest timer interval effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isResting && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            playRestCompleteChime();
            return 0;
          }
          if (prev <= 4) {
            playBeep(600, 100);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restSecondsLeft]);

  const handleStartWorkout = (ex: CalisthenicsExercise) => {
    setActiveExercise(ex);
    setActiveSetIndex(0);
    setRepsDone([]);
    setIsResting(false);
    setRestSecondsLeft(0);
    setCurrentRepsInput(10);
  };

  const handleCompleteSet = () => {
    if (!activeExercise) return;
    const updatedReps = [...repsDone, currentRepsInput];
    setRepsDone(updatedReps);

    if (activeSetIndex + 1 < activeExercise.recommendedSets) {
      setActiveSetIndex((prev) => prev + 1);
      setRestSecondsLeft(activeExercise.restSeconds || 60);
      setIsResting(true);
      playBeep(880, 200);
    } else {
      playRestCompleteChime();
      setIsResting(false);
    }
  };

  const handleFinishAndSave = () => {
    if (!activeExercise) return;
    onLogWorkout({
      userId: currentProfile === 'women' ? 'women' : 'men',
      exerciseId: activeExercise.id,
      exerciseName: activeExercise.name,
      setsCompleted: repsDone.length,
      repsCompleted: repsDone,
      perceivedExertion: 8,
      notes: 'Completed session'
    });

    setActiveExercise(null);
    alert('Workout Session Logged! Outstanding consistency!');
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero Banner */}
      <div className="calisthenics-hero glass-card">
        <div className="hero-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-pill bg-cyan">
              {fitnessProfile.gender === 'male' ? '👨 MALE TAILORED PLAN' : '👩 FEMALE TAILORED PLAN'}
            </span>
            <button className="btn-secondary text-xs" onClick={() => setShowOnboardingModal(true)}>
              <SlidersHorizontal className="icon-xs mr-1" />
              <span>Questionnaire & Baseline ({fitnessProfile.pushupBaseline} Rep Max)</span>
            </button>
          </div>
          <h2>Calisthenics Master Module</h2>
          <p>
            Action-driven, visual-first workout planner tailored for {fitnessProfile.gender === 'male' ? 'Male Strength & Speed' : 'Female Core & Athletic Toning'}.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-box">
            <Flame className="icon-sm text-amber" />
            <span className="num">{fitnessProfile.pushupBaseline} Rep Max</span>
            <span className="lbl">Baseline Push-up</span>
          </div>
          <div className="stat-box">
            <Award className="icon-sm text-emerald" />
            <span className="num">{fitnessProfile.weightKg} kg</span>
            <span className="lbl">Height: {fitnessProfile.heightCm}cm</span>
          </div>
        </div>
      </div>

      {/* Subtab navigation */}
      <div className="subtab-bar">
        <button
          className={`subtab-btn ${activeSubTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('calendar')}
        >
          <Calendar className="icon-xs" />
          <span>Month 1 Calendar (Starts Aug 12)</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'progressions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('progressions')}
        >
          <Layers className="icon-xs" />
          <span>Exercise Progressions</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('video')}
        >
          <Video className="icon-xs" />
          <span>Video Log</span>
        </button>
      </div>

      {/* 1. MONTH 1 CALENDAR PLANNER */}
      {activeSubTab === 'calendar' && (
        <div className="subtab-content">
          {/* Day Selector Pills */}
          <div className="category-bar mb-3">
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

          {/* DYNAMIC WARM-UP PROTOCOL CARD */}
          <div className="warmup-card glass-card mb-3">
            <div className="card-top">
              <div>
                <span className="badge-pill bg-amber">MANDATORY PRE-WORKOUT STEP</span>
                <h3 className="mt-1 flex items-center gap-1">
                  <Activity className="icon-sm text-amber" />
                  <span>3-Minute Dynamic Warm-Up Routine</span>
                </h3>
              </div>
              <button
                className={`btn-secondary ${warmupDone ? 'bg-emerald text-white' : ''}`}
                onClick={() => setShowWarmupModal(true)}
              >
                {warmupDone ? <CheckCircle2 className="icon-xs text-emerald" /> : <Play className="icon-xs" />}
                <span>{warmupDone ? 'Warm-Up Complete!' : '🎬 Launch Animated Warm-Up'}</span>
              </button>
            </div>
          </div>

          {/* Selected Day Plan Details Card */}
          <div className="selected-day-card glass-card">
            <div className="card-top mb-2">
              <div>
                <span className="badge-pill bg-cyan">{selectedDayPlan.focusCategory}</span>
                <h3 className="mt-1">{selectedDayPlan.dayTitle}</h3>
                <div className="text-sub text-xs"><Calendar className="icon-xs inline" /> {selectedDayPlan.dateString}</div>
              </div>
              {selectedDayPlan.dayNumber === 1 && (
                <span className="badge-pill bg-amber">START TODAY!</span>
              )}
            </div>

            <h4 className="mt-3 text-cyan">Spoon-Fed Today's Exercises:</h4>
            <div className="exercises-day-list mt-2">
              {selectedDayPlan.exercises.map((ex, idx) => (
                <div key={idx} className="ex-day-item glass-card mb-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-white">{ex.name}</h5>
                    <span className="badge-pill bg-emerald">{ex.sets} Sets &times; {ex.reps}</span>
                  </div>

                  {/* Minimalist UI: Action-driven button triggers animated video modal */}
                  <button
                    className="btn-secondary w-full mt-2"
                    onClick={() => setSelectedAnimExercise(ex)}
                  >
                    <Film className="icon-xs text-cyan mr-1 inline" />
                    <span>🎬 View 3-Rep Animation, Do's & Don'ts</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              className="btn-primary btn-large w-full mt-4"
              onClick={() => {
                const targetEx = exercises.find((e) => e.category === 'push') || exercises[0];
                handleStartWorkout(targetEx);
              }}
            >
              <Play className="icon-sm" />
              <span>Launch Interactive Set & Rest Timer</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. EXERCISE PROGRESSIONS LIBRARY (MINIMALIST ACTION-DRIVEN TEXT) */}
      {activeSubTab === 'progressions' && (
        <div className="subtab-content">
          <div className="category-bar mb-3">
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

          <div className="exercises-grid">
            {filteredExercises.map((ex) => {
              const isExpanded = expandedExId === ex.id;
              return (
                <div key={ex.id} className="exercise-card glass-card">
                  {ex.imageUrl && (
                    <div className="card-img-wrap">
                      <img src={ex.imageUrl} alt={ex.name} className="card-img" />
                      <span className="prog-tag">{ex.progressionLevel.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="card-body">
                    <div className="card-header">
                      <h3>{ex.name}</h3>
                      <span className="category-tag">{ex.category.toUpperCase()}</span>
                    </div>

                    <div className="ex-meta">
                      <div className="meta-item">
                        <Layers className="icon-xs text-cyan" />
                        <span>{ex.recommendedSets} Sets &times; {ex.recommendedReps}</span>
                      </div>
                      <div className="meta-item">
                        <RotateCcw className="icon-xs text-amber" />
                        <span>{ex.restSeconds}s Rest</span>
                      </div>
                    </div>

                    {/* Action-Driven Minimalist Expandable Details */}
                    <button
                      className="btn-text flex items-center gap-1 text-xs mt-1"
                      onClick={() => setExpandedExId(isExpanded ? null : ex.id)}
                    >
                      {isExpanded ? <ChevronUp className="icon-xs" /> : <ChevronDown className="icon-xs" />}
                      <span>{isExpanded ? 'Hide Details' : '📋 View Form Cues & Description'}</span>
                    </button>

                    {isExpanded && (
                      <div className="expanded-details animate-fade-in mt-2">
                        <p className="ex-desc">{ex.description}</p>
                        <div className="cues-box mt-2">
                          <div className="cues-title"><Info className="icon-xs" /> Key Form Cues:</div>
                          <ul className="cues-list">
                            {ex.keyCues.map((cue, idx) => (
                              <li key={idx}>&bull; {cue}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <button className="btn-primary w-full mt-3" onClick={() => handleStartWorkout(ex)}>
                      <Play className="icon-sm" />
                      <span>Start Workout Session</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VIDEO LOG & OVERLOAD HISTORY */}
      {activeSubTab === 'video' && (
        <div className="subtab-content">
          <div className="section-header">
            <h3>Exercise Video Log</h3>
          </div>

          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className="log-card glass-card mb-3">
                <div className="card-top">
                  <div>
                    <span className="badge-pill bg-cyan">{log.date}</span>
                    <h4 className="mt-1">{log.exerciseName}</h4>
                  </div>
                  <span className="badge-pill bg-amber">RPE {log.perceivedExertion}/10</span>
                </div>
                <div className="mt-2 text-sm">
                  <strong>Sets Completed:</strong> {log.setsCompleted} sets ({log.repsCompleted.join(', ')} reps)
                </div>
              </div>
            ))}
          </div>
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

      {/* ANIMATED WARMUP MODAL */}
      {showWarmupModal && (
        <WarmupGuideModal
          onComplete={() => {
            setWarmupDone(true);
            setShowWarmupModal(false);
          }}
          onClose={() => setShowWarmupModal(false)}
        />
      )}

      {/* ANIMATED EXERCISE FORM & DO'S/DON'TS MODAL */}
      {selectedAnimExercise && (
        <AnimatedExerciseGuideModal
          exerciseName={selectedAnimExercise.name}
          targetReps={selectedAnimExercise.reps}
          targetSets={selectedAnimExercise.sets}
          restSeconds={selectedAnimExercise.restSeconds}
          notes={selectedAnimExercise.notes}
          onCompleteWorkout={() => {
            onLogWorkout({
              userId: currentProfile === 'women' ? 'women' : 'men',
              exerciseId: 'cal_' + selectedDayNum,
              exerciseName: selectedAnimExercise.name,
              setsCompleted: selectedAnimExercise.sets,
              repsCompleted: [parseInt(selectedAnimExercise.reps) || 3],
              perceivedExertion: 8,
              notes: `Completed Day ${selectedDayNum} Plan!`
            });
          }}
          onClose={() => setSelectedAnimExercise(null)}
        />
      )}

      {/* Interactive Workout Session Modal */}
      {activeExercise && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card workout-modal animate-scale-up">
            <div className="modal-header">
              <div>
                <span className="badge-pill bg-cyan">{activeExercise.category.toUpperCase()}</span>
                <h2>{activeExercise.name}</h2>
              </div>
              <button className="btn-close" onClick={() => setActiveExercise(null)}>&times;</button>
            </div>

            <div className="workout-player">
              {isResting ? (
                <div className="rest-timer-box animate-pulse">
                  <div className="rest-label">REST & RECOVER</div>
                  <div className="rest-seconds">{restSecondsLeft}s</div>
                </div>
              ) : (
                <div className="active-set-box">
                  <div className="set-indicator">
                    SET {activeSetIndex + 1} OF {activeExercise.recommendedSets}
                  </div>
                  <div className="set-target">Target: {activeExercise.recommendedReps}</div>

                  <div className="rep-input-group">
                    <label>Reps Completed This Set:</label>
                    <div className="stepper">
                      <button onClick={() => setCurrentRepsInput((r) => Math.max(1, r - 1))}>-</button>
                      <input
                        type="number"
                        value={currentRepsInput}
                        onChange={(e) => setCurrentRepsInput(Number(e.target.value))}
                      />
                      <button onClick={() => setCurrentRepsInput((r) => r + 1)}>+</button>
                    </div>
                  </div>

                  <button className="btn-primary btn-large mt-3" onClick={handleCompleteSet}>
                    <Check className="icon-sm" />
                    <span>
                      {activeSetIndex + 1 < activeExercise.recommendedSets
                        ? 'Complete Set & Start Rest'
                        : 'Finish All Sets'}
                    </span>
                  </button>
                </div>
              )}

              <div className="modal-actions mt-4">
                <button className="btn-secondary" onClick={() => setActiveExercise(null)}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleFinishAndSave}
                  disabled={repsDone.length === 0}
                >
                  <Sparkles className="icon-sm" />
                  <span>Save Session to History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
