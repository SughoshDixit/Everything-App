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
          <span>📅 Month 1 Plan</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'progressions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('progressions')}
        >
          <Layers className="icon-xs" />
          <span>💪 Progressions</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('video')}
        >
          <Video className="icon-xs" />
          <span>📜 History</span>
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

      {/* Interactive Workout Session Modal (OLED Electric Lime Design) */}
      {activeExercise && (
        <div className="modal-backdrop">
          <div className="modal-content oled-workout-player animate-scale-up max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 text-zinc-300 border-zinc-800"
                onClick={() => setActiveExercise(null)}
              >
                <ChevronDown className="icon-xs rotate-90" />
                <span>Back</span>
              </button>

              <div className="text-center">
                <span className="oled-badge-lime">{activeExercise.category.toUpperCase()}</span>
                <h2 className="text-xl font-black text-white mt-1 uppercase tracking-wider">{activeExercise.name}</h2>
              </div>

              <button
                className="btn-close text-zinc-400 hover:text-white"
                onClick={() => setActiveExercise(null)}
                title="Cancel Workout"
              >
                &times;
              </button>
            </div>

            {/* Minimalist Linear Progress Pipeline */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                <span>PROGRESS PIPELINE</span>
                <span className="text-lime-400 font-mono">
                  {Math.round(((activeSetIndex + (isResting ? 0.5 : 0)) / activeExercise.recommendedSets) * 100)}%
                </span>
              </div>
              <div className="oled-pipeline-bar">
                <div
                  className="oled-pipeline-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      ((activeSetIndex + (isResting ? 0.5 : 0)) / activeExercise.recommendedSets) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Main Stage: Massive 72pt Digital Countdown Clock */}
            <div className="workout-player text-center">
              {isResting ? (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="text-xs font-extrabold tracking-widest text-zinc-500 uppercase mb-2">REST & RECOVER</div>
                  <div className="oled-countdown-clock font-mono my-2">{restSecondsLeft}s</div>
                  <div className="text-xs text-lime-400 font-bold uppercase tracking-wider mt-2">BREATHE DEEP & PREPARE NEXT SET</div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="text-xs font-extrabold tracking-widest text-lime-400 uppercase mb-1">
                    SET {activeSetIndex + 1} OF {activeExercise.recommendedSets}
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight my-2 font-mono">
                    TARGET: {activeExercise.recommendedReps}
                  </div>

                  {/* Rep Stepper Input */}
                  <div className="my-6 bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Reps Done:</span>
                    <div className="stepper flex items-center gap-3">
                      <button
                        className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-lg hover:bg-zinc-800 border border-zinc-800"
                        onClick={() => setCurrentRepsInput((r) => Math.max(1, r - 1))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="w-16 text-center text-2xl font-black text-lime-400 bg-transparent border-none focus:outline-none font-mono"
                        value={currentRepsInput}
                        onChange={(e) => setCurrentRepsInput(Number(e.target.value))}
                      />
                      <button
                        className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-lg hover:bg-zinc-800 border border-zinc-800"
                        onClick={() => setCurrentRepsInput((r) => r + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Controls: Oversized 80dp Touch Hit Target Center Button */}
              <div className="flex items-center justify-center my-4">
                <button
                  className="oled-center-play-btn"
                  onClick={handleCompleteSet}
                  title="Complete Active Set"
                >
                  <Check size={42} strokeWidth={3.5} />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions mt-6 flex gap-2 pt-4 border-t border-zinc-900">
                <button
                  className="btn-secondary flex-1 bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 text-xs font-bold"
                  onClick={() => setActiveExercise(null)}
                >
                  ← Exit
                </button>
                <button
                  className="btn-primary flex-1 bg-lime-400 text-black hover:bg-lime-300 text-xs font-black uppercase tracking-wider"
                  onClick={handleFinishAndSave}
                  disabled={repsDone.length === 0}
                  style={{ backgroundColor: repsDone.length > 0 ? '#CCFF00' : '#333333', color: repsDone.length > 0 ? '#000000' : '#888888' }}
                >
                  <Sparkles className="icon-sm inline mr-1" />
                  <span>Save Workout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
