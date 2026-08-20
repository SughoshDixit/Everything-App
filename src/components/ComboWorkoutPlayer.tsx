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
import { ZoomableImageModal } from './ZoomableImageModal';
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
  Zap,
  CheckCircle2,
  ZoomIn
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
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string; page?: number } | null>(null);

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
      setSetIdx((s) => s + 1);
      setIsResting(true);
      setRestSecondsLeft(currentExercise.restSeconds || 60);
      speakText(`Set completed! Rest for ${currentExercise.restSeconds} seconds.`);
    } else {
      if (exerciseIdx + 1 < routine.exercises.length) {
        const nextEx = routine.exercises[exerciseIdx + 1];
        setExerciseIdx((e) => e + 1);
        setSetIdx(0);
        setIsResting(true);
        setRestSecondsLeft(90);
        speakText(`Great work! ${currentExercise.name} complete. Next exercise: ${nextEx.name}. Rest for 90 seconds.`);
      } else {
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
      <div className="modal-content oled-workout-player animate-scale-up max-w-md w-full max-h-[92vh] overflow-y-auto p-4 flex flex-col justify-between">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
          <button
            className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 text-zinc-300 border-zinc-800 py-1 px-2"
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
          >
            <ChevronLeft size={14} />
            <span>Exit</span>
          </button>

          <div className="text-center">
            <span className="oled-badge-lime text-[9px]">{routine.badge}</span>
            <h3 className="text-sm font-black text-white mt-0.5 uppercase tracking-wide">
              {routine.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className={`p-1.5 rounded-full border transition-all ${
                isMuted ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-lime-950/60 border-lime-500 text-lime-400'
              }`}
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Audio Voice Coach' : 'Mute Audio Coach'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            
            {/* Info button for detailed written instructions */}
            <button
              className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 hover:text-white"
              onClick={() => setShowInfoModal(true)}
              title="View Written Details"
            >
              <Info size={15} />
            </button>
          </div>
        </div>

        {/* 3-Stage Progress Pipeline Indicator */}
        <div className="flex items-center justify-between gap-1 mb-2 text-[10px] font-bold uppercase tracking-wider">
          <div className={`flex-1 text-center py-1 rounded transition-all ${phase === 'warmup' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60' : 'bg-zinc-950 text-zinc-500'}`}>
            1. Warm-Up
          </div>
          <div className={`flex-1 text-center py-1 rounded transition-all ${phase === 'transition' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60' : 'bg-zinc-950 text-zinc-500'}`}>
            2. Rest (60s)
          </div>
          <div className={`flex-1 text-center py-1 rounded transition-all ${phase === 'main' ? 'bg-lime-950/80 text-lime-300 border border-lime-500/60' : 'bg-zinc-950 text-zinc-500'}`}>
            3. Sets
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 1: DYNAMIC WARM-UP (3 MINS) */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'warmup' && (
          <div className="text-center py-1 flex flex-col justify-between flex-1">
            <div className="flex justify-between items-center text-xs text-zinc-400 font-bold mb-1">
              <span className="text-amber-400 uppercase">STEP {warmupStepIdx + 1} OF {yellowDudeWarmupSteps.length}</span>
              <span className="text-white font-bold">{currentWarmup.title}</span>
            </div>

            {/* Bounded Clean Image Stage (100% Fit, Tap to Zoom & Read) */}
            <div
              className="playbook-img-card my-1 group cursor-zoom-in"
              onClick={() => setZoomImage({ src: currentWarmup.image, title: currentWarmup.title })}
              title="Tap to Zoom & Read Full Page"
            >
              <img
                src={currentWarmup.image}
                alt={currentWarmup.title}
              />
              <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-zinc-700">
                <ZoomIn size={11} className="text-cyan-400" />
                <span>Zoom</span>
              </div>
            </div>

            {/* 72pt Countdown Clock */}
            <div className="my-1">
              <div className="oled-countdown-clock font-mono text-amber-400 leading-none">
                {warmupSecondsLeft}s
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1.5 px-3"
                onClick={handleReplayVoice}
                title="Replay Voice Instructions"
              >
                <Volume2 size={13} className="text-amber-400" />
                <span>Hear Voice</span>
              </button>

              <button
                className="oled-center-play-btn"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Resume Warm-Up' : 'Pause Warm-Up'}
                style={{ backgroundColor: '#F59E0B' }}
              >
                {isPaused ? <Play size={32} fill="#000" /> : <Pause size={32} fill="#000" />}
              </button>

              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1.5 px-3"
                onClick={handleSkipWarmupStep}
              >
                <span>Skip</span>
                <SkipForward size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 2: 60-SECOND TRANSITION REST */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'transition' && (
          <div className="text-center py-2 flex flex-col justify-between flex-1">
            <div>
              <span className="oled-badge-lime text-cyan-300 border-cyan-400 bg-cyan-950/40 text-[10px]">
                RECOVERY & HYDRATION
              </span>
              <h3 className="text-base font-bold text-white mt-1">Catch Your Breath</h3>
            </div>

            <div className="my-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">TRANSITION COUNTDOWN</div>
              <div className="oled-countdown-clock font-mono text-cyan-400 leading-none">
                {transitionSecondsLeft}s
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-left my-2">
              <div className="text-[10px] font-bold text-lime-400 uppercase">Up Next in Main Workout:</div>
              <div className="text-sm font-bold text-white mt-0.5">{currentExercise.name}</div>
              <div className="text-xs text-emerald-400 font-bold mt-0.5">
                Target: {currentExercise.recommendedSets} Sets &times; {currentExercise.recommendedReps}
              </div>
            </div>

            <button
              className="btn-primary w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs py-2.5"
              onClick={handleSkipTransition}
            >
              <Play size={14} fill="#000" className="inline mr-1" />
              <span>Start Workout Now &rarr;</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 3: MAIN CALISTHENICS FOCUSED ROUTINE */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'main' && (
          <div className="text-center py-1 flex flex-col justify-between flex-1">
            {/* Exercise Header */}
            <div className="flex justify-between items-center text-xs text-zinc-400 font-bold mb-1">
              <span className="text-lime-400 uppercase text-[10px]">
                EXERCISE {exerciseIdx + 1} OF {routine.exercises.length}
              </span>
              <span className="text-white font-bold truncate max-w-[180px]">{currentExercise.name}</span>
            </div>

            {/* Bounded Clean Image Stage (100% Fit, Tap to Zoom & Read) */}
            <div
              className="playbook-img-card my-1 group cursor-zoom-in"
              onClick={() => setZoomImage({ src: currentExercise.image, title: currentExercise.name, page: currentExercise.pageNumber })}
              title="Tap to Zoom & Read Full Page"
            >
              <img
                src={currentExercise.image}
                alt={currentExercise.name}
              />
              <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-zinc-700">
                <ZoomIn size={11} className="text-cyan-400" />
                <span>Zoom</span>
              </div>
            </div>

            {/* Set or Rest State */}
            {isResting ? (
              <div className="my-1">
                <div className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">REST & RECOVER</div>
                <div className="oled-countdown-clock font-mono text-lime-400 leading-none my-1">
                  {restSecondsLeft}s
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[10px] font-extrabold tracking-widest text-lime-400 uppercase">
                  SET {setIdx + 1} OF {currentExercise.recommendedSets}
                </div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  TARGET: {currentExercise.recommendedReps}
                </div>

                {/* Reps Input Stepper */}
                <div className="my-1.5 bg-zinc-950 p-2 rounded-xl border border-zinc-900 flex items-center justify-between max-w-xs mx-auto">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Reps Done:</span>
                  <div className="stepper flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 border border-zinc-800"
                      onClick={() => setCurrentRepsInput((r) => Math.max(1, r - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="w-10 text-center text-lg font-black text-lime-400 bg-transparent border-none focus:outline-none font-mono"
                      value={currentRepsInput}
                      onChange={(e) => setCurrentRepsInput(Number(e.target.value))}
                    />
                    <button
                      className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 border border-zinc-800"
                      onClick={() => setCurrentRepsInput((r) => r + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Controls: 80dp Center Action Button */}
            <div className="flex items-center justify-center gap-3 my-1">
              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1.5 px-2.5"
                onClick={handleReplayVoice}
                title="Hear Voice Coach Form Instructions & Benefits"
              >
                <Volume2 size={13} className="text-lime-400" />
                <span>Hear Voice</span>
              </button>

              <button
                className="oled-center-play-btn"
                onClick={handleCompleteMainSet}
                title={setIdx + 1 < currentExercise.recommendedSets ? 'Complete Set & Start Rest' : 'Complete Exercise'}
              >
                <Check size={38} strokeWidth={3.5} />
              </button>

              <button
                className="btn-secondary text-xs flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1.5 px-2.5"
                onClick={() => setShowInfoModal(true)}
                title="Read Cues & Instructions"
              >
                <Info size={13} className="text-cyan-400" />
                <span>Info</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PHASE 4: WORKOUT COMPLETED CELEBRATION */}
        {/* ------------------------------------------------------------------- */}
        {phase === 'completed' && (
          <div className="text-center py-4 flex flex-col justify-between flex-1">
            <div className="w-14 h-14 rounded-full bg-lime-400 text-black flex items-center justify-center mx-auto mb-2 pulse-glow">
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Workout Crushed!</h2>
            <p className="text-xs text-zinc-400 mt-1">
              You completed the 3-minute warm-up and {repsHistory.length} calisthenics work sets.
            </p>

            <div className="my-4 bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Total Sets Logged:</div>
              <div className="text-xl font-black text-lime-400 font-mono mt-0.5">
                {repsHistory.length} Sets ({repsHistory.join(', ')} Reps)
              </div>
            </div>

            <button
              className="btn-primary w-full bg-lime-400 text-black font-black uppercase tracking-wider py-2.5 text-xs"
              onClick={handleFinishAndSaveAll}
            >
              <span>💾 Save Session to History</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 'ℹ️' INFO MODAL DURING WORKOUT */}
        {/* ------------------------------------------------------------------- */}
        {showInfoModal && (
          <div className="modal-backdrop">
            <div className="modal-content glass-card animate-scale-up max-w-sm w-full max-h-[80vh] overflow-y-auto p-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                <h4 className="text-sm font-bold text-white">
                  {phase === 'warmup' ? currentWarmup.title : currentExercise.name}
                </h4>
                <button className="btn-close text-xs" onClick={() => setShowInfoModal(false)}>&times;</button>
              </div>

              {phase === 'warmup' ? (
                <div className="text-xs text-zinc-300 space-y-2">
                  <p>{currentWarmup.instructions}</p>
                  <div className="font-bold text-amber-400 mt-2">Cues:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {currentWarmup.cues.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-xs text-zinc-300 space-y-2">
                  <div className="font-bold text-lime-400 flex items-center gap-1">
                    <Zap size={12} />
                    <span>Key Form Cue:</span>
                  </div>
                  <p>{currentExercise.keyCues[0]}</p>

                  <div className="font-bold text-emerald-400 flex items-center gap-1 mt-2">
                    <Award size={12} />
                    <span>Key Benefit:</span>
                  </div>
                  <p>{currentExercise.keyBenefits[0]}</p>

                  <div className="font-bold text-rose-400 flex items-center gap-1 mt-2">
                    <CheckCircle2 size={12} />
                    <span>Instructions:</span>
                  </div>
                  <p>{currentExercise.instructions}</p>
                </div>
              )}

              <button
                className="btn-secondary w-full text-xs mt-3 py-1.5"
                onClick={() => setShowInfoModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ZOOMABLE IMAGE MODAL (PINCH-TO-ZOOM & PAN) */}
        {zoomImage && (
          <ZoomableImageModal
            imageSrc={zoomImage.src}
            title={zoomImage.title}
            pageNumber={zoomImage.page}
            onClose={() => setZoomImage(null)}
          />
        )}
      </div>
    </div>
  );
};
