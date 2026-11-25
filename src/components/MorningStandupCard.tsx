import React, { useState, useMemo } from 'react';
import {
  Sun,
  Radio,
  Flame,
  CheckCircle2,
  Droplets,
  Heart,
  Volume2,
  Play
} from 'lucide-react';
import {
  playBugleChime,
  playMechanicalClick,
  startCadenceMetronome,
  stopCadenceMetronome,
  startVedicDrone,
  stopVedicDrone
} from '../utils/audio';
import { reportForMusterDuty, getMusterStatus } from '../services/tacticalRoutineService';
import type { UserProfile } from '../types';

interface MorningStandupCardProps {
  currentProfile: UserProfile;
  streakCount: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
  onQuickAction?: (actionKey: string) => void;
}

export const MorningStandupCard: React.FC<MorningStandupCardProps> = ({
  currentProfile,
  streakCount,
  completedHabitsCount,
  totalHabitsCount,
  onQuickAction,
}) => {
  const [musterStatus, setMusterStatus] = useState(() => getMusterStatus());
  const [activeAudioTool, setActiveAudioTool] = useState<'none' | 'metronome' | 'drone'>('none');
  const [waterLiters, setWaterLiters] = useState<number>(1.5);

  const athleteName = currentProfile === 'women' ? 'Shreya' : 'Sughosh';
  const partnerName = currentProfile === 'women' ? 'Sughosh' : 'Shreya';

  // Athletic Battery / Recovery percentage calculation
  const batteryScore = useMemo(() => {
    const base = 88;
    const bonus = Math.min(10, Math.floor(streakCount / 2));
    return Math.min(98, base + bonus);
  }, [streakCount]);

  const handleMusterCheckIn = () => {
    playBugleChime();
    const updated = reportForMusterDuty();
    setMusterStatus(updated);
  };

  const handleToggleMetronome = () => {
    playMechanicalClick();
    if (activeAudioTool === 'metronome') {
      stopCadenceMetronome();
      setActiveAudioTool('none');
    } else {
      stopVedicDrone();
      startCadenceMetronome(175);
      setActiveAudioTool('metronome');
    }
  };

  const handleToggleDrone = () => {
    playMechanicalClick();
    if (activeAudioTool === 'drone') {
      stopVedicDrone();
      setActiveAudioTool('none');
    } else {
      stopCadenceMetronome();
      startVedicDrone(432);
      setActiveAudioTool('drone');
    }
  };

  const handleAddWater = () => {
    playMechanicalClick();
    setWaterLiters((prev) => Math.min(4.0, Number((prev + 0.5).toFixed(1))));
  };

  const movementTargetPct = 75;
  const disciplineTargetPct = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;
  const hydrationTargetPct = Math.min(100, Math.round((waterLiters / 3.0) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#121927] via-[#0f1522] to-[#0a0d16] p-5 sm:p-6 text-white shadow-2xl">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#CCFF00]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[#FC5200]/15 blur-3xl" />

      {/* Top Banner Row */}
      <div className="relative flex items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FC5200] to-amber-400 text-black shadow-md shadow-[#FC5200]/25">
            <Sun size={18} className="text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-display">
                Good Morning, {athleteName}
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 text-[9px] font-bold text-amber-300">
                <Flame size={10} className="text-[#FC5200]" />
                {streakCount}d
              </span>
            </div>
          </div>
        </div>

        {/* Athletic Battery Gauge */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hidden sm:inline">
            Battery
          </span>
          <span className="text-xs font-black text-[#CCFF00] font-mono">
            {batteryScore}%
          </span>
          <div className="relative flex h-5 w-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-[#CCFF00] rounded-full transition-all duration-700"
              style={{ height: `${batteryScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: 3 Target Rings */}
      <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Ring 1: Movement */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="transparent"
                stroke="#FC5200"
                strokeWidth="3.5"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - movementTargetPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-black text-white">{movementTargetPct}%</span>
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block">
              Movement
            </span>
            <p className="text-xs font-bold text-white">4.2 / 5.0 km</p>
          </div>
        </div>

        {/* Ring 2: Discipline Habits */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="transparent"
                stroke="#CCFF00"
                strokeWidth="3.5"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - disciplineTargetPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-black text-white">{disciplineTargetPct}%</span>
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block">
              Discipline
            </span>
            <p className="text-xs font-bold text-white">
              {completedHabitsCount} / {totalHabitsCount || 5} Habits
            </p>
          </div>
        </div>

        {/* Ring 3: Hydration */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - hydrationTargetPct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
              </svg>
              <Droplets size={14} className="absolute text-sky-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block">
                Hydration
              </span>
              <p className="text-xs font-bold text-white">{waterLiters} / 3.0 L</p>
            </div>
          </div>
          <button
            onClick={handleAddWater}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-400 hover:bg-sky-400/20 active:scale-95 transition cursor-pointer text-xs font-bold"
            title="Log +500ml water"
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom Action Strip: Muster Duty & Soundscapes */}
      <div className="relative mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
        {/* 1-Tap Muster Roll Call */}
        {!musterStatus.musteredToday ? (
          <button
            onClick={handleMusterCheckIn}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#CCFF00] to-emerald-400 text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-[#CCFF00]/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Radio size={15} className="animate-pulse" />
            <span>0630 Muster Check-In (+25 XP)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
            <CheckCircle2 size={16} />
            <span>Muster Duty Confirmed for {athleteName} &amp; {partnerName}!</span>
          </div>
        )}

        {/* Ambient Soundscapes Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Metronome 175 SPM */}
          <button
            type="button"
            onClick={handleToggleMetronome}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              activeAudioTool === 'metronome'
                ? 'border-[#FC5200] bg-[#FC5200]/20 text-[#FC5200] animate-pulse'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 175 SPM Cadence Metronome for running"
          >
            <Play size={12} fill="currentColor" />
            <span>175 SPM</span>
          </button>

          {/* 432Hz Vedic Focus */}
          <button
            type="button"
            onClick={handleToggleDrone}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              activeAudioTool === 'drone'
                ? 'border-[#c084fc] bg-[#c084fc]/20 text-[#c084fc] animate-pulse'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 432Hz Vedic Focus Drone for mobility & stretching"
          >
            <Volume2 size={13} />
            <span>432Hz Focus</span>
          </button>

          {/* Direct Workout Trigger */}
          {onQuickAction && (
            <button
              onClick={() => onQuickAction('run')}
              className="flex items-center gap-1.5 rounded-xl bg-primary text-black px-3.5 py-2 text-xs font-black uppercase hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <Heart size={13} fill="currentColor" />
              <span>Train</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorningStandupCard;
