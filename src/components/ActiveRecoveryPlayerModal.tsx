import React, { useState, useEffect, useRef } from 'react';
import type { ActiveRecoveryProtocol, RecoveryStep } from '../types/tactical';
import {
  speakText,
  cancelSpeech,
  isAudioMuted,
  toggleAudioMute,
  playBeepTone
} from '../utils/audioCoach';
import { awardDisciplinePoints } from '../services/tacticalRoutineService';
import {
  ShieldCheck,
  ChevronLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Flame,
  Activity,
  Droplets,
  Moon
} from 'lucide-react';

interface ActiveRecoveryPlayerModalProps {
  protocol: ActiveRecoveryProtocol;
  onFinish: () => void;
  onClose: () => void;
}

export const ActiveRecoveryPlayerModal: React.FC<ActiveRecoveryPlayerModalProps> = ({
  protocol,
  onFinish,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(protocol.steps[0]?.durationSeconds || 120);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(isAudioMuted());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (4s)' | 'Exhale (4s)' | 'Hold (4s)'>('Inhale (4s)');

  const currentStep: RecoveryStep = protocol.steps[currentStepIdx] || protocol.steps[0];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Announce current step with audio coach
  useEffect(() => {
    if (!isCompleted && currentStep) {
      const speech = `Recovery protocol: ${currentStep.title}. Target: ${currentStep.targetArea}. ${currentStep.cue}`;
      speakText(speech, 0.95);
    }
  }, [currentStepIdx, isCompleted]);

  // Breathing pulse loop for box breathing step
  useEffect(() => {
    if (currentStep?.title.includes('Breathing') && !isPaused && !isCompleted) {
      const phases: ('Inhale (4s)' | 'Hold (4s)' | 'Exhale (4s)' | 'Hold (4s)')[] = [
        'Inhale (4s)',
        'Hold (4s)',
        'Exhale (4s)',
        'Hold (4s)',
      ];
      let idx = 0;
      const breathTimer = setInterval(() => {
        idx = (idx + 1) % phases.length;
        setBreathPhase(phases[idx]);
      }, 4000);
      return () => clearInterval(breathTimer);
    }
  }, [currentStepIdx, isPaused, isCompleted]);

  // Countdown timer effect
  useEffect(() => {
    if (isPaused || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playBeepTone(660, 200);
          handleNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isCompleted, currentStepIdx]);

  const handleNextStep = () => {
    if (currentStepIdx < protocol.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setSecondsLeft(protocol.steps[nextIdx].durationSeconds);
    } else {
      setIsCompleted(true);
      awardDisciplinePoints(50);
      speakText('Recovery protocol completed, soldier! Your central nervous system is reset and fortified.', 1.0);
    }
  };

  const handleToggleMute = () => {
    const next = toggleAudioMute();
    setIsMuted(next);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame size={20} className="text-[#FC5200]" />;
      case 'Shield': return <ShieldCheck size={20} className="text-cyan-400" />;
      case 'Moon': return <Moon size={20} className="text-[#CCFF00]" />;
      default: return <Activity size={20} className="text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0c1017] p-5 text-white shadow-2xl">
        {/* Top Radial Ambience */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#CCFF00]/10 blur-3xl" />

        {/* Header Bar */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-3">
          <button
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft size={14} />
            <span>Abort</span>
          </button>

          <div className="text-center">
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
              {protocol.codename}
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 mt-0.5">
              {protocol.title}
            </h3>
          </div>

          <button
            onClick={handleToggleMute}
            className={`rounded-xl border p-1.5 transition ${
              isMuted ? 'border-zinc-800 bg-zinc-900 text-zinc-600' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Content Body */}
        {!isCompleted ? (
          <div className="relative my-4 flex flex-1 flex-col justify-between space-y-4">
            {/* Step Counter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {protocol.steps.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-lg py-1 text-center text-[10px] font-bold uppercase transition ${
                    i === currentStepIdx
                      ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : i < currentStepIdx
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  Step {i + 1}
                </div>
              ))}
            </div>

            {/* Main Stage Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-emerald-500/10 text-emerald-400 shadow-inner">
                {getStepIcon(currentStep.iconName)}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Target: {currentStep.targetArea}
              </span>
              <h4 className="mt-1 text-base font-black text-white">
                {currentStep.title}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                "{currentStep.cue}"
              </p>

              {/* Box Breathing Visualizer if breathing step */}
              {currentStep.title.includes('Breathing') && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 animate-pulse">
                    <span className="text-center text-[10px] font-black uppercase text-emerald-300">
                      {breathPhase}
                    </span>
                  </div>
                </div>
              )}

              {/* Big Countdown Timer */}
              <div className="mt-4 font-mono text-4xl font-black tracking-tight text-[#CCFF00]">
                {formatTime(secondsLeft)}
              </div>
            </div>

            {/* Tactical Hydration & Electrolyte Reminder Bar */}
            <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs text-sky-200">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-sky-400" />
                <span className="text-[11px] font-semibold">Today's Target: {protocol.hydrationTargetLiters}L Water + Electrolytes</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">DEFCON 1</span>
            </div>

            {/* Control Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/20"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span>{isPaused ? 'Resume Protocol' : 'Pause'}</span>
              </button>

              <button
                onClick={handleNextStep}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
              >
                <span>Skip</span>
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Completion Stage */
          <div className="my-6 flex flex-1 flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400">
                MISSION ACCOMPLISHED
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                Tactical Regeneration Complete
              </h3>
              <p className="mt-2 text-xs text-zinc-300 max-w-xs">
                Your musculoskeletal system has been decompressed and metabolic waste flushed. You earned <span className="text-[#CCFF00] font-bold">+50 Discipline Points</span>!
              </p>
            </div>

            <button
              onClick={() => {
                onFinish();
                onClose();
              }}
              className="w-full rounded-xl bg-emerald-400 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-300"
            >
              Confirm Mission Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
