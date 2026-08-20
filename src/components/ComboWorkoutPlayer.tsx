import React, { useState, useEffect, useRef } from 'react';
import type { ComboWorkoutRoutine, PlaybookExercise } from '../utils/yellowDudePlaybook';
import { yellowDudeWarmupSteps } from '../utils/yellowDudePlaybook';
import {
  speakText,
  speakExerciseIntro,
  speakWarmupStep,
  speakTransitionAlert,
  speakCountdown,
  playBeepTone,
  isAudioMuted,
  toggleAudioMute,
  cancelSpeech
} from '../utils/audioCoach';
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Check,
  Sparkles,
  Info,
  Award,
  Zap
} from 'lucide-react';

interface ComboWorkoutPlayerProps {
  routine: ComboWorkoutRoutine;
  onFinishWorkout: (log: {
    exerciseName: string;
    setsCompleted: number;
    repsCompleted: number[];
    notes: string;
  }) => void;
  onClose: () => void;
}

type WorkoutPhase = 'warmup' | 'transition' | 'main' | 'completed';

export const ComboWorkoutPlayer: React.FC<ComboWorkoutPlayerProps> = ({
  routine,
  onFinishWorkout,
  onClose
}) => {
  const [phase, setPhase] = useState<WorkoutPhase>('warmup');
  const [isMuted, setIsMuted] = useState<boolean>(isAudioMuted());
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Warmup Stage State
  const [warmupStepIdx, setWarmupStepIdx] = useState<number>(0);
  const [warmupSecondsLeft, setWarmupSecondsLeft] = useState<number>(30);

  // Transition Stage State
  const [transitionSecondsLeft, setTransitionSecondsLeft] = useState<number>(routine.transitionRestSeconds || 60);

  // Main Calisthenics Workout State
  const [exerciseIdx, setExerciseIdx] = useState<number>(0);
  const [setIdx, setSetIdx] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [currentRepsInput, setCurrentRepsInput] = useState<number>(10);
  const [repsHistory, setRepsHistory] = useState<number[]>([]);
  const [showFormTips, setShowFormTips] = useState<boolean>(false);

  const currentWarmup = yellowDudeWarmupSteps[warmupStepIdx];
  const currentExercise: PlaybookExercise = routine.exercises[exerciseIdx] || routine.exercises[0];

  // Ref to track active timer interval
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio Voice Mute Toggle
  const handleToggleMute = () => {
    const nextMuted = toggleAudioMute();
    setIsMuted(nextMuted);
  };

  // ---------------------------------------------------------------------------
  // 1. WARMUP STAGE TIMER & SPEECH
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase === 'warmup') {
      const step = yellowDudeWarmupSteps[warmupStepIdx];
      setWarmupSecondsLeft(step.durationSeconds);
      speakWarmupStep(step);
    }
  }, [phase, warmupStepIdx]);

  useEffect(() => {
    if (phase === 'warmup' && !isPaused) {
      timerRef.current = setInterval(() => {
        setWarmupSecondsLeft((prev) => {
          if (prev <= 1) {
            playBeepTone(880, 150);
            if (warmupStepIdx + 1 < yellowDudeWarmupSteps.length) {
              setWarmupStepIdx((i) => i + 1);
            } else {
              // Warmup complete -> Transition Phase
              setPhase('transition');
              setTransitionSecondsLeft(routine.transitionRestSeconds || 60);
              speakTransitionAlert(routine.title);
            }
            return 30;
          }
          if (prev <= 4 && prev > 1) {
            speakCountdown(prev - 1);
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, isPaused, warmupStepIdx, routine]);

  // ---------------------------------------------------------------------------
  // 2. TRANSITION STAGE TIMER (60s Rest)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase === 'transition' && !isPaused) {
      timerRef.current = setInterval(() => {
        setTransitionSecondsLeft((prev) => {
          if (prev <= 1) {
            playBeepTone(880, 200);
            setPhase('main');
            setExerciseIdx(0);
            setSetIdx(0);
            setIsResting(false);
            speakExerciseIntro(routine.exercises[0]);
            return 0;
          }
          if (prev === 30) {
            speakText('30 seconds left. Get into position.');
          }
          if (prev <= 4 && prev > 1) {
            speakCountdown(prev - 1);
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, isPaused, routine]);

  // ---------------------------------------------------------------------------
  // 3. MAIN WORKOUT REST TIMER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase === 'main' && isResting && !isPaused) {
      timerRef.current = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            playBeepTone(880, 200);
            setIsResting(false);
            speakText(`Rest complete. Set ${setIdx + 1} begins now!`);
            return 0;
          }
          if (prev <= 4 && prev > 1) {
            speakCountdown(prev - 1);
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, isResting, isPaused, setIdx]);

  // ---------------------------------------------------------------------------
  // 4. ACTION HANDLERS
  // ---------------------------------------------------------------------------
  const handleSkipWarmupStep = () => {
    if (warmupStepIdx + 1 < yellowDudeWarmupSteps.length) {
      setWarmupStepIdx((i) => i + 1);
    } else {
      setPhase('transition');
      setTransitionSecondsLeft(routine.transitionRestSeconds || 60);
      speakTransitionAlert(routine.title);
    }
  };

  const handleSkipTransition = () => {
    setPhase('main');
    setExerciseIdx(0);
    setSetIdx(0);
    setIsResting(false);
    speakExerciseIntro(currentExercise);
  };

  const handleCompleteMainSet = () => {
    playBeepTone(660, 100);
    setRepsHistory((prev) => [...prev, currentRepsInput]);

    if (setIdx + 1 < currentExercise.recommendedSets) {
      // Next set in same exercise
      setSetIdx((s) => s + 1);
      setIsResting(true);
      setRestSecondsLeft(currentExercise.restSeconds || 60);
      speakText(`Set completed! Rest for ${currentExercise.restSeconds} seconds.`);
    } else {
      // Exercise finished -> next exercise or complete routine
      if (exerciseIdx + 1 < routine.exercises.length) {
        const nextEx = routine.exercises[exerciseIdx + 1];
        setExerciseIdx((e) => e + 1);
        setSetIdx(0);
        setIsResting(true);
        setRestSecondsLeft(90); // 90s inter-exercise rest
        speakText(`Great work! ${currentExercise.name} complete. Next exercise: ${nextEx.name}. Rest for 90 seconds.`);
      } else {
        // Complete routine
        setPhase('completed');
        speakText(`Incredible effort! You completed the entire ${routine.title}!`);
      }
    }
  };

  const handleFinishAndSaveAll = () => {
    cancelSpeech();
    onFinishWorkout({
      exerciseName: routine.title,
      setsCompleted: repsHistory.length,
      repsCompleted: repsHistory,
      notes: `Completed Yellow Dude Combo: ${routine.title} with 3-minute warm-up.`
    });
    onClose();
  };

  const handleReplayVoice = () => {
    if (phase === 'warmup') {
      speakWarmupStep(currentWarmup);
    } else if (phase === 'main') {
      speakExerciseIntro(currentExercise);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content oled-workout-player animate-scale-up max-w-xl w-full p-4 md:p-6">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3">
          <button
            className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 text-zinc-300 border-zinc-800"
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
          >
            <ChevronLeft className="icon-xs" />
            <span>Exit Menu</span>
          </button>

          <div className="text-center">
            <span className="oled-badge-lime">{routine.badge}</span>
            <h3 className="text-sm md:text-base font-black text-white mt-0.5 uppercase tracking-wide">
              {routine.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-full border transition-all ${
                isMuted ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-lime-950/60 border-lime-500 text-lime-400'
              }`}
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Audio Voice Coach' : 'Mute Audio Coach'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              className="btn-close text-zinc-400 hover:text-white"
              onClick={() => {
                cancelSpeech();
                onClose();
              }}
              title="Close Workout"
            >
              &times;
            </button>
          </div>
        </div>

        {/* 3-Stage Progress Pipeline Indicator */}
        <div className="flex items-center justify-between gap-1 mb-4 text-[10px] md:text-xs font-bold uppercase tracking-wider">
          <div className={`flex-1 text-center py-1.5 rounded-md transition-all ${phase === 'warmup' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60' : 'bg-zinc-950 text-zinc-500'}`}>
            1. Warm-Up (3m)
          </div>
          <div className={`flex-1 text-center py-1.5 rounded-md transition-all ${phase === 'transition' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60' : 'bg-zinc-950 text-zinc-500'}`}>
            2. Transition (60s)
          </div>
          <div className={`flex-1 text-center py-1.5 rounded-md transition-all ${phase === 'main' ? 'bg-lime-950/80 text-lime-300 border border-lime-500/60' : 'bg-zinc-950 text-zinc-500'}`}>
            3. Focused Sets
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 1: DYNAMIC WARM-UP (3 MINS) */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'warmup' && (
          <div className="text-center py-2">
            <div className="flex justify-between items-center text-xs text-zinc-400 font-bold mb-2">
              <span className="text-amber-400 uppercase">STEP {warmupStepIdx + 1} OF {yellowDudeWarmupSteps.length}</span>
              <span>{currentWarmup.title}</span>
            </div>

            {/* Playbook Visual Stage */}
            <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-900 my-2 flex items-center justify-center overflow-hidden max-h-[220px]">
              <img
                src={currentWarmup.image}
                alt={currentWarmup.title}
                className="max-h-[200px] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Massive 72pt Countdown Clock */}
            <div className="my-2">
              <div className="oled-countdown-clock font-mono text-amber-400">
                {warmupSecondsLeft}s
              </div>
              <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto leading-relaxed">
                {currentWarmup.instructions}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300"
                onClick={handleReplayVoice}
                title="Replay Voice Instructions"
              >
                <Volume2 size={14} className="text-amber-400" />
                <span>Hear Tips</span>
              </button>

              <button
                className="oled-center-play-btn"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Resume Warm-Up' : 'Pause Warm-Up'}
                style={{ backgroundColor: '#F59E0B' }}
              >
                {isPaused ? <Play size={36} fill="#000" /> : <Pause size={36} fill="#000" />}
              </button>

              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300"
                onClick={handleSkipWarmupStep}
              >
                <span>Skip</span>
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 2: 60-SECOND TRANSITION REST */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'transition' && (
          <div className="text-center py-4">
            <span className="oled-badge-lime text-cyan-300 border-cyan-400 bg-cyan-950/40">
              RECOVERY & PREPARATION
            </span>
            <h3 className="text-xl font-bold text-white mt-2">Breathe & Hydrate</h3>

            <div className="my-6">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">TRANSITION COUNTDOWN</div>
              <div className="oled-countdown-clock font-mono text-cyan-400">
                {transitionSecondsLeft}s
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-left max-w-md mx-auto mb-4">
              <div className="text-xs font-bold text-lime-400 uppercase mb-1">Up Next in Main Workout:</div>
              <div className="text-sm font-bold text-white">{currentExercise.name}</div>
              <div className="text-xs text-zinc-400 mt-1">
                Target: {currentExercise.recommendedSets} Sets &times; {currentExercise.recommendedReps}
              </div>
            </div>

            <button
              className="btn-primary w-full max-w-md mx-auto bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider"
              onClick={handleSkipTransition}
            >
              <Play className="icon-xs inline mr-1" />
              <span>Start Workout Now &rarr;</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 3: MAIN CALISTHENICS FOCUSED ROUTINE */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'main' && (
          <div className="text-center py-1">
            {/* Exercise Header */}
            <div className="flex justify-between items-center text-xs text-zinc-400 font-bold mb-1">
              <span className="text-lime-400 uppercase">
                EXERCISE {exerciseIdx + 1} OF {routine.exercises.length}
              </span>
              <span className="text-white font-bold">{currentExercise.name}</span>
            </div>

            {/* Playbook Visual Stage */}
            <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-900 my-2 flex items-center justify-center overflow-hidden max-h-[190px]">
              <img
                src={currentExercise.image}
                alt={currentExercise.name}
                className="max-h-[180px] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Set or Rest State */}
            {isResting ? (
              <div className="py-2">
                <div className="text-xs font-extrabold tracking-widest text-zinc-500 uppercase">REST & RECOVER</div>
                <div className="oled-countdown-clock font-mono text-lime-400 my-1">
                  {restSecondsLeft}s
                </div>
                <div className="text-xs text-zinc-400">Deep nasal breathing. Prepare for Set {setIdx + 1}.</div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-extrabold tracking-widest text-lime-400 uppercase">
                  SET {setIdx + 1} OF {currentExercise.recommendedSets}
                </div>
                <div className="text-xl md:text-2xl font-black text-white font-mono mt-0.5">
                  TARGET: {currentExercise.recommendedReps}
                </div>

                {/* Reps Input Stepper */}
                <div className="my-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center justify-between max-w-sm mx-auto">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Reps Completed:</span>
                  <div className="stepper flex items-center gap-3">
                    <button
                      className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-base hover:bg-zinc-800 border border-zinc-800"
                      onClick={() => setCurrentRepsInput((r) => Math.max(1, r - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="w-14 text-center text-xl font-black text-lime-400 bg-transparent border-none focus:outline-none font-mono"
                      value={currentRepsInput}
                      onChange={(e) => setCurrentRepsInput(Number(e.target.value))}
                    />
                    <button
                      className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-base hover:bg-zinc-800 border border-zinc-800"
                      onClick={() => setCurrentRepsInput((r) => r + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Controls: 80dp Center Action Button */}
            <div className="flex items-center justify-center gap-4 my-2">
              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300"
                onClick={handleReplayVoice}
                title="Hear Form Cues & Benefits"
              >
                <Volume2 size={14} className="text-lime-400" />
                <span>Hear Cues</span>
              </button>

              <button
                className="oled-center-play-btn"
                onClick={handleCompleteMainSet}
                title={setIdx + 1 < currentExercise.recommendedSets ? 'Complete Set & Start Rest' : 'Complete Exercise'}
              >
                <Check size={42} strokeWidth={3.5} />
              </button>

              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300"
                onClick={() => setShowFormTips(!showFormTips)}
              >
                <Info size={14} className="text-cyan-400" />
                <span>{showFormTips ? 'Hide' : 'Tips'}</span>
              </button>
            </div>

            {/* Collapsible Form Tips & Benefits */}
            {showFormTips && (
              <div className="collapsible-content text-left max-w-md mx-auto text-xs mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                <div className="font-bold text-lime-400 mb-1 flex items-center gap-1">
                  <Zap size={12} />
                  <span>Key Form Cue:</span>
                </div>
                <p className="text-zinc-300 mb-2">{currentExercise.keyCues[0]}</p>

                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <Award size={12} />
                  <span>Key Benefit:</span>
                </div>
                <p className="text-zinc-300">{currentExercise.keyBenefits[0]}</p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 4: WORKOUT COMPLETED CELEBRATION */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'completed' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-lime-400 text-black flex items-center justify-center mx-auto mb-3 pulse-glow">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Workout Crushed!</h2>
            <p className="text-sm text-zinc-400 mt-1">
              You completed the full 3-minute warm-up and {repsHistory.length} calisthenics work sets.
            </p>

            <div className="my-6 bg-zinc-950 p-4 rounded-xl border border-zinc-900 max-w-sm mx-auto text-center">
              <div className="text-xs font-bold text-zinc-400 uppercase">Total Sets Logged:</div>
              <div className="text-2xl font-black text-lime-400 font-mono mt-1">
                {repsHistory.length} Sets ({repsHistory.join(', ')} Reps)
              </div>
            </div>

            <button
              className="btn-primary w-full max-w-sm mx-auto bg-lime-400 text-black font-black uppercase tracking-wider py-3"
              onClick={handleFinishAndSaveAll}
            >
              <span>💾 Save Session to History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
