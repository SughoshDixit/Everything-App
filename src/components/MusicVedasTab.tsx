import React, { useState } from 'react';
import type { CarnaticYouTubeItem, InstrumentSong, VedaSukta } from '../types';
import { Music, Guitar, BookOpen, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

interface MusicVedasTabProps {
  carnaticItems: CarnaticYouTubeItem[];
  instrumentSongs: InstrumentSong[];
  vedaSuktas: VedaSukta[];
}

export const MusicVedasTab: React.FC<MusicVedasTabProps> = ({
  carnaticItems,
  instrumentSongs,
  vedaSuktas
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'carnatic' | 'instruments' | 'vedas'>('carnatic');
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const togglePracticeTimer = () => {
    if (isPracticing) {
      if (timerRef) clearInterval(timerRef);
      setIsPracticing(false);
    } else {
      setIsPracticing(true);
      const interval = setInterval(() => {
        setPracticeSeconds((prev) => prev + 1);
      }, 1000);
      setTimerRef(interval);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Subtab Navigation Pills */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('carnatic')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'carnatic'
              ? 'bg-[#c084fc]/15 text-[#dec0fa] border border-[#c084fc]/30'
              : 'text-muted-foreground hover:text-white border border-transparent'
          }`}
        >
          <Music size={14} />
          <span>🎶 Carnatic Kritis</span>
        </button>
        <button
          onClick={() => setActiveSubTab('instruments')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'instruments'
              ? 'bg-dude/15 text-dude border border-dude/30'
              : 'text-muted-foreground hover:text-white border border-transparent'
          }`}
        >
          <Guitar size={14} />
          <span>🎸 Strings & Chords</span>
        </button>
        <button
          onClick={() => setActiveSubTab('vedas')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'vedas'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-muted-foreground hover:text-white border border-transparent'
          }`}
        >
          <BookOpen size={14} />
          <span>📿 Vedic Chanting</span>
        </button>
      </div>

      {/* 1. CARNATIC */}
      {activeSubTab === 'carnatic' && (
        <div className="space-y-4">
          {/* Practice Timer */}
          <div className="rounded-2xl border border-border bg-[#0e131b] p-6 shadow-lg text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-2 font-display">
              RIYAZ & VOCAL PRACTICE STOPWATCH
            </span>
            <div className="text-5xl font-extrabold text-white font-mono tracking-tight my-1">
              {formatTime(practiceSeconds)}
            </div>
            <button
              onClick={togglePracticeTimer}
              className={`mt-4 flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition shadow-sm ${
                isPracticing
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-primary text-primary-foreground hover:brightness-110'
              }`}
            >
              {isPracticing ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPracticing ? 'Pause Practice' : 'Start Practice'}</span>
            </button>
          </div>

          {/* Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {carnaticItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-border bg-[#0e131b] hover:border-white/20 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-[#c084fc]/15 px-2 py-0.5 text-[10px] font-bold text-[#dec0fa]">
                      {item.raga}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-display">{item.kritiName}</h4>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Composer: <span className="text-slate-300">{item.composer}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#dec0fa] hover:text-white transition"
                  >
                    {expandedId === item.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <span>{expandedId === item.id ? 'Hide Details' : 'View Notes'}</span>
                  </button>
                  {expandedId === item.id && (
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. INSTRUMENTS */}
      {activeSubTab === 'instruments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instrumentSongs.map((song) => (
            <div
              key={song.id}
              className="p-4 rounded-2xl border border-border bg-[#0e131b] hover:border-white/20 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="rounded-md bg-dude/15 px-2 py-0.5 text-[10px] font-bold text-dude">
                    {song.instrument}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {song.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-display">{song.title}</h4>

                <div className="mt-3 flex gap-1.5 flex-wrap">
                  {song.chords.map((c, i) => (
                    <span key={i} className="rounded-md border border-white/10 bg-[#121824] px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => toggleExpand(song.id)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-dude hover:text-white transition"
                >
                  {expandedId === song.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  <span>{expandedId === song.id ? 'Hide Details' : 'Song Details'}</span>
                </button>
                {expandedId === song.id && (
                  <div className="mt-2 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                    {song.genre} &bull; Difficulty: <span className="text-white font-semibold">{song.difficulty}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. VEDAS */}
      {activeSubTab === 'vedas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vedaSuktas.map((sukta) => {
            const pct = Math.round((sukta.memorizedVerses / sukta.totalVerses) * 100);
            return (
              <div
                key={sukta.id}
                className="p-4 rounded-2xl border border-border bg-[#0e131b] hover:border-white/20 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-primary" />
                      <h4 className="text-sm font-bold text-white font-display">{sukta.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary">{pct}%</span>
                  </div>

                  <div className="w-full bg-[#121824] h-2 rounded-full overflow-hidden my-2.5 border border-white/5">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-muted-foreground font-mono">
                    {sukta.memorizedVerses} / {sukta.totalVerses} Verses Memorized
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => toggleExpand(sukta.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-white transition"
                  >
                    {expandedId === sukta.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <span>{expandedId === sukta.id ? 'Hide Chanting' : 'View Chanting Text'}</span>
                  </button>
                  {expandedId === sukta.id && (
                    <div className="mt-2 text-xs space-y-1.5 animate-fade-in">
                      <p className="italic text-slate-200">"{sukta.transliteration}"</p>
                      <p className="text-muted-foreground text-[11px]">{sukta.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
