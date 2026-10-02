import React, { useState } from 'react';
import type { RoutineItem, MotivationalQuote, UserProfile, UserStats } from '../types';
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
  X
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
