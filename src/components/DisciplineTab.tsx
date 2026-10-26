import React, { useState } from 'react';
import type { RoutineItem, MotivationalQuote, UserProfile, UserStats } from '../types';
import {
  getMilitaryRankProgression,
  getMusterStatus,
  reportForMusterDuty
} from '../services/tacticalRoutineService';
import {
  speakMorningMusterCall,
  speakExcuseRejection
} from '../services/militaryCadenceService';
import { TacticalAiEngine } from '../services/tacticalAiEngine';
import {
  CheckCircle2,
  Plus,
  Zap,
  Sparkles,
  Sun,
  Dumbbell,
  BookOpen,
  Music,
  Moon,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  Volume2,
  Terminal,
  Radio
} from 'lucide-react';

interface DisciplineTabProps {
  currentProfile: UserProfile;
  routines: RoutineItem[];
  quotes: MotivationalQuote[];
  stats: UserStats;
  onToggleRoutine: (id: string) => void;
  onAddRoutine: (routine: Omit<RoutineItem, 'id' | 'completed'>) => void;
}

export const DisciplineTab: React.FC<DisciplineTabProps> = ({
  currentProfile,
  routines,
  quotes,
  stats,
  onToggleRoutine,
  onAddRoutine
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RoutineItem['category']>('morning');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newDuration, setNewDuration] = useState(15);
  const [newAssigned, setNewAssigned] = useState<'men' | 'women' | 'both'>('men');
  const [quoteIdx, setQuoteIdx] = useState(0);

  const [showManifesto, setShowManifesto] = useState(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  // Tactical Military States
  const [musterStatus, setMusterStatus] = useState(getMusterStatus());
  const [rankProgression, setRankProgression] = useState(getMilitaryRankProgression());
  const [excuseInput, setExcuseInput] = useState('');
  const [excuseResult, setExcuseResult] = useState<{ rebuttal: string; battleCry: string } | null>(null);
  const [showExcuseBuster, setShowExcuseBuster] = useState(false);

  const handleReportMuster = () => {
    speakMorningMusterCall();
    const updated = reportForMusterDuty();
    setMusterStatus(updated);
    setRankProgression(getMilitaryRankProgression());
  };

  const handleDismantleExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseInput.trim()) return;
    const result = TacticalAiEngine.dismantleExcuse(excuseInput.trim());
    setExcuseResult(result);
    speakExcuseRejection(result.rebuttal);
  };

  // Filter routines based on persona
  const filteredRoutines = routines.filter((r) => {
    if (currentProfile === 'couple') return true;
    return r.assignedTo === currentProfile || r.assignedTo === 'both';
  });

  const completedCount = filteredRoutines.filter((r) => r.completed).length;
  const totalCount = filteredRoutines.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentQuote = quotes[quoteIdx % quotes.length] || quotes[0] || {
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Aristotle'
  };

  const handleNextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddRoutine({
      title: newTitle.trim(),
      category: newCategory,
      timeOfDay: newTime,
      durationMinutes: Number(newDuration),
      assignedTo: newAssigned,
      icon: newCategory === 'fitness' ? 'Dumbbell' : newCategory === 'music_veda' ? 'Music' : newCategory === 'morning' ? 'Sun' : 'Moon'
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: RoutineItem['category']) => {
    switch (cat) {
      case 'morning': return <Sun size={15} className="text-dude" />;
      case 'fitness': return <Dumbbell size={15} className="text-primary" />;
      case 'music_veda': return <Music size={15} className="text-[#c084fc]" />;
      case 'evening': return <Moon size={15} className="text-sky-400" />;
      default: return <BookOpen size={15} className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Motivational Quote Banner - Modern Minimal Ticker */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-3.5 flex items-center justify-between gap-3 shadow-md">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-dude hover:bg-white/10 shrink-0 transition"
          onClick={handleNextQuote}
          title="Next Mantra"
        >
          <Sparkles size={15} />
        </button>
        <div className="overflow-hidden flex-1 text-center sm:text-left">
          <p className="text-xs sm:text-sm font-medium text-white italic truncate">
            "{currentQuote.text}" <span className="text-muted-foreground not-italic font-normal">&mdash; {currentQuote.author}</span>
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold text-primary uppercase shrink-0 hidden sm:inline">
          DAILY MANTRA
        </span>
      </div>

      {/* Discipline Dashboard & Score Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg flex items-center justify-around flex-wrap gap-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="#ccff00"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - completionPct / 100)}`}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white font-mono">{completionPct}%</span>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Today</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-display">
                HABITS COMPLETED
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {completedCount} <span className="text-sm font-normal text-muted-foreground">/ {totalCount}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-display">
                CURRENT STREAK
              </span>
              <span className="text-2xl font-black text-primary font-mono flex items-center gap-1.5 justify-center sm:justify-start">
                {currentProfile === 'men' ? stats.menStreak : currentProfile === 'women' ? stats.womenStreak : stats.coupleStreak}d
                <span className="text-lg">🔥</span>
              </span>
            </div>
          </div>
        </div>

        {/* Self-Discipline Core Principles Card */}
        <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-dude flex items-center gap-1.5 font-display">
                <Zap size={13} /> THE INNER LAW
              </span>
              <button
                className="text-xs text-muted-foreground hover:text-white"
                onClick={() => setShowManifesto(!showManifesto)}
              >
                {showManifesto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-display">
              “You don’t rise to the occasion. You sink to the level of your daily training.”
            </p>
          </div>

          {showManifesto && (
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-dude">⚡</span> <span>Consistency &gt; Adrenaline</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">🛡️</span> <span>Identity First, Goals Second</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sky-400">⏱️</span> <span>Mastery over Rush</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TACTICAL MILITARY HUD: 0630 MUSTER & RANK PROGRESSION */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. 0630 Morning Muster & Roll Call */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#121824] to-[#0d141e] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] flex items-center gap-1.5 font-mono">
                <Radio size={14} className="text-[#CCFF00] animate-pulse" />
                0630 HRS MORNING MUSTER
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                musterStatus.musteredToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {musterStatus.musteredToday ? 'ON DECK' : 'ROLL CALL PENDING'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Daily Military Accountability Check</h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {musterStatus.statusText}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            {!musterStatus.musteredToday ? (
              <button
                onClick={handleReportMuster}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] py-2.5 px-4 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition shadow-md"
              >
                <Radio size={14} />
                <span>Report for Duty (+25 XP)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <CheckCircle2 size={16} />
                <span>Duty Confirmed. Demerits Avoided.</span>
              </div>
            )}

            <button
              onClick={() => speakMorningMusterCall()}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition shrink-0"
              title="Sound Morning Bugle / Muster Call"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>

        {/* 2. Military Rank & Insignia Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#121824] to-[#0d141e] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 font-mono">
                <Shield size={14} className="text-primary" />
                TACTICAL CADRE PROGRESSION
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {rankProgression.demerits} Demerits
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl">{rankProgression.currentRank.insignia}</span>
              <div>
                <h4 className="text-sm font-black text-white">
                  [{rankProgression.currentRank.rankCode}] {rankProgression.currentRank.rankTitle}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {rankProgression.currentRank.perks}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400 mb-1">
              <span>{rankProgression.totalPoints} PTS</span>
              <span>
                {rankProgression.nextRank ? `Next: [${rankProgression.nextRank.rankCode}] ${rankProgression.nextRank.rankTitle} (${rankProgression.nextRank.minPoints} PTS)` : 'MAX RANK ACHIEVED'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#CCFF00] rounded-full transition-all duration-700"
                style={{ width: `${rankProgression.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. TACTICAL EXCUSE BUSTER TERMINAL */}
      {/* ------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <Terminal size={15} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Tactical Excuse Buster Mini-Terminal
              </h3>
              <p className="text-[11px] text-zinc-400">
                Type any hesitation, sluggishness or excuse. Commander Iron will dismantle it with zero negotiation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExcuseBuster(!showExcuseBuster)}
            className="text-xs text-muted-foreground hover:text-white"
          >
            {showExcuseBuster ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showExcuseBuster && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3 animate-fade-in">
            <form onSubmit={handleDismantleExcuse} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. I am too tired after work, maybe I'll rest instead..."
                value={excuseInput}
                onChange={(e) => setExcuseInput(e.target.value)}
                className="flex-1 bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-rose-500/50 transition placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="rounded-xl bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition shrink-0"
              >
                Dismantle
              </button>
            </form>

            {excuseResult && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-400 uppercase tracking-widest text-[10px]">
                    EXCUSE REJECTED BY COMMANDER
                  </span>
                  <button
                    onClick={() => speakExcuseRejection(excuseResult.rebuttal)}
                    className="flex items-center gap-1 text-[11px] font-bold text-white hover:text-rose-300"
                  >
                    <Volume2 size={13} />
                    <span>Hear Drill Sergeant</span>
                  </button>
                </div>
                <p className="text-zinc-200 font-medium leading-relaxed">
                  "{excuseResult.rebuttal}"
                </p>
                <div className="pt-1 text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                  <span>⚡</span> <span>{excuseResult.battleCry}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Routine Checklist Section */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Daily Discipline Checklist
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Habits designed for athletic conditioning, mental clarity and recovery.
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            <span>Add Habit</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {filteredRoutines.map((item) => (
            <div
              key={item.id}
              onClick={() => setExpandedRoutineId(expandedRoutineId === item.id ? null : item.id)}
              className={`p-3.5 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                item.completed
                  ? 'border-primary/40 bg-primary/5 text-white'
                  : 'border-white/5 bg-[#121824] text-muted-foreground hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Toggle completed"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRoutine(item.id);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                      item.completed
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-white/20 bg-white/5 text-transparent hover:border-white/40'
                    }`}
                  >
                    {item.completed && <CheckCircle2 size={16} />}
                  </button>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${item.completed ? 'text-white line-through opacity-80' : 'text-slate-200'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                      <Clock size={11} /> {item.timeOfDay} &bull; {item.durationMinutes}m
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.assignedTo}
                  </span>
                </div>
              </div>

              {expandedRoutineId === item.id && (
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-muted-foreground animate-fade-in">
                  <span className="text-primary font-bold">Category:</span> {item.category.replace('_', ' ').toUpperCase()} &bull;{' '}
                  <span className="text-primary font-bold">Target Duration:</span> {item.durationMinutes} minutes
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e131b] p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white font-display">
                Add Daily Habit / Routine
              </h3>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:text-white"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 font-display">
                  Habit Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 Mins Dynamic Hip & Ankle Mobility"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 font-display">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RoutineItem['category'])}
                    className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-primary/50"
                  >
                    <option value="morning">Morning Routine</option>
                    <option value="fitness">Fitness / Calisthenics</option>
                    <option value="music_veda">Music & Vedas</option>
                    <option value="evening">Evening Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 font-display">
                    Assigned To
                  </label>
                  <select
                    value={newAssigned}
                    onChange={(e) => setNewAssigned(e.target.value as 'men' | 'women' | 'both')}
                    className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-primary/50"
                  >
                    <option value="men">Sughosh (Men)</option>
                    <option value="women">Shreya (Women)</option>
                    <option value="both">Both (Shared)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 font-display">
                    Time of Day
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 font-display">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-white"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 shadow-sm"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
