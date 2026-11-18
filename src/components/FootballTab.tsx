import React, { useState } from 'react';
import type { FootballDrill } from '../types';
import { Zap, Compass, CheckCircle2, Target, Activity, Clock, Plus, X, Volume2 } from 'lucide-react';
import { speakText } from '../utils/audioCoach';

interface FootballTabProps {
  drills: FootballDrill[];
  onOpenCreatePost?: () => void;
}

function TacticalPitchDiagram({ category }: { category: string; title: string }) {
  const cat = category.toLowerCase();
  return (
    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#0d2316] via-[#091a10] to-[#06120b] shadow-inner flex items-center justify-center my-3">
      <svg viewBox="0 0 300 160" className="w-full h-full">
        {/* Pitch markings */}
        <rect x="10" y="10" width="280" height="140" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.25" rx="4" />
        <line x1="150" y1="10" x2="150" y2="150" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="150" cy="80" r="28" fill="none" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="10" y="45" width="40" height="70" fill="none" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="250" y="45" width="40" height="70" fill="none" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.2" />

        {/* Cones */}
        <polygon points="55,60 50,72 60,72" fill="#FC5200" />
        <polygon points="105,40 100,52 110,52" fill="#FC5200" />
        <polygon points="150,85 145,97 155,97" fill="#FC5200" />
        <polygon points="195,45 190,57 200,57" fill="#CCFF00" />
        <polygon points="240,75 235,87 245,87" fill="#CCFF00" />

        {/* Movement Trace */}
        <path
          d={
            cat.includes('finishing') || cat.includes('shoot')
              ? "M 55,66 Q 130,25 200,51 T 270,80"
              : cat.includes('agility')
              ? "M 55,66 L 105,46 L 150,91 L 195,51 L 240,81"
              : "M 40,80 Q 100,125 150,80 T 260,80"
          }
          fill="none"
          stroke="#CCFF00"
          strokeWidth="2.5"
          strokeDasharray="6,4"
        />

        {/* Start & Finish Node */}
        <circle cx="55" cy="66" r="4.5" fill="#CCFF00" />
        <text x="30" y="60" fill="#CCFF00" fontSize="8" fontWeight="bold" fontFamily="monospace">START</text>

        <circle cx="240" cy="81" r="5" fill="#FC5200" stroke="#ffffff" strokeWidth="1.5" />
        <text x="248" y="85" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">STRIKE</text>
      </svg>
      <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[8px] font-mono text-emerald-400 font-bold border border-emerald-500/20">
        ⚽ 2D TACTICAL BOARD
      </div>
    </div>
  );
}

export const FootballTab: React.FC<FootballTabProps> = ({ drills, onOpenCreatePost }) => {
  const [selectedDrill, setSelectedDrill] = useState<FootballDrill | null>(null);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);

  const toggleDrillCompleted = (id: string) => {
    setCompletedDrills((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleAudioCoachDrill = (drill: FootballDrill) => {
    const text = `Drill: ${drill.title}. Duration: ${drill.durationMinutes} minutes. Setup: ${drill.coneSetup}. Steps: ${drill.instructions.join('. ')}`;
    speakText(text, 1.0);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Hero Header */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
            <Zap size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400 block font-display">
              FORWARD / WINGER CONDITIONING
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Speed, Agility & Finishing Protocol
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('kuchh_bhii_deep_link', { detail: { action: 'manual_football' } }))
            }}
            className="flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 px-3.5 py-2 text-xs font-bold text-sky-400 hover:bg-sky-400/20 transition shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Log Match</span>
          </button>

          {onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Compile Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Pitch vs Calisthenics Schedule Balance Guidance */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">
            Weekly Match & Conditioning Rhythm
          </span>
          <span className="text-[10px] text-sky-400 font-bold">Match Saturday ⚽</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {[
            { day: 'Mon', label: 'Tactical Sprints', color: 'text-sky-400', dot: 'bg-sky-400' },
            { day: 'Tue', label: 'Calisthenics Upper', color: 'text-primary', dot: 'bg-primary', highlight: true },
            { day: 'Wed', label: 'Midfield Agility', color: 'text-sky-400', dot: 'bg-sky-400' },
            { day: 'Thu', label: 'Leg Power & Plyo', color: 'text-dude', dot: 'bg-dude' },
            { day: 'Fri', label: 'Shooting Drills', color: 'text-sky-400', dot: 'bg-sky-400', highlight: true },
            { day: 'Sat', label: 'Match Day (90m)', color: 'text-[#ff9667]', dot: 'bg-[#fc4c02]', match: true },
            { day: 'Sun', label: 'Active Recovery', color: 'text-emerald-400', dot: 'bg-emerald-400' }
          ].map((d) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition ${
                d.match
                  ? 'bg-[#fc4c02]/15 border-[#fc4c02]/40 text-white'
                  : d.highlight
                  ? 'bg-primary/10 border-primary/30 text-white'
                  : 'bg-[#121824] border-white/5 text-muted-foreground'
              }`}
            >
              <div className="font-bold text-[11px] text-white">{d.day}</div>
              <div className={`w-2 h-2 rounded-full my-1.5 ${d.dot}`} />
              <div className="text-[8px] font-medium text-muted-foreground leading-tight hidden sm:block">
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drills List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-display">
          Positional Drills Library ({drills.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drills.map((drill) => {
            const isDone = completedDrills.includes(drill.id);
            return (
              <div
                key={drill.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-[#0e131b] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="font-bold text-sm text-white font-display">
                      {drill.title}
                    </h3>
                    <button
                      onClick={() => toggleDrillCompleted(drill.id)}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg border transition cursor-pointer ${
                        isDone
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-white/20 bg-white/5 text-transparent hover:border-white/40'
                      }`}
                      aria-label="Toggle completed"
                    >
                      {isDone && <CheckCircle2 size={16} />}
                    </button>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-2 text-[10px]">
                    <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300 font-bold flex items-center gap-1">
                      <Activity size={10} /> {drill.intensity.toUpperCase()}
                    </span>
                    <span className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-sky-400 font-bold flex items-center gap-1">
                      <Clock size={10} /> {drill.durationMinutes}m
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-muted-foreground font-bold flex items-center gap-1">
                      <Target size={10} /> {drill.category.toUpperCase()}
                    </span>
                  </div>

                  {/* 2D Mini Pitch preview for visual engagement */}
                  <TacticalPitchDiagram category={drill.category} title={drill.title} />

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {drill.coneSetup}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-muted-foreground hover:text-white hover:border-white/25 transition cursor-pointer"
                    onClick={() => setSelectedDrill(drill)}
                  >
                    <Compass size={13} className="text-dude" />
                    <span>Instructions</span>
                  </button>

                  <button
                    className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition cursor-pointer"
                    onClick={() => handleAudioCoachDrill(drill)}
                    title="Audio coach drill instructions"
                  >
                    <Volume2 size={14} />
                  </button>

                  {onOpenCreatePost && (
                    <button
                      className="flex items-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                      onClick={onOpenCreatePost}
                      title="Add drill to post"
                    >
                      <Plus size={13} />
                      <span>Post</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill Instructions Modal */}
      {selectedDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0e131b] p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400 block font-display">
                  DRILL BLUEPRINT
                </span>
                <h3 className="text-base font-bold text-white font-display mt-0.5">
                  {selectedDrill.title}
                </h3>
              </div>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:text-white cursor-pointer"
                onClick={() => setSelectedDrill(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <span className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-sky-400 font-bold">
                    {selectedDrill.category.toUpperCase()}
                  </span>
                  <span className="rounded-lg border border-dude/30 bg-dude/10 px-2 py-0.5 text-dude font-bold">
                    {selectedDrill.durationMinutes} Minutes
                  </span>
                </div>
                <button
                  onClick={() => handleAudioCoachDrill(selectedDrill)}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-white transition cursor-pointer"
                >
                  <Volume2 size={13} />
                  <span>Listen to Coach</span>
                </button>
              </div>

              {/* 2D Tactical Pitch Diagram */}
              <TacticalPitchDiagram category={selectedDrill.category} title={selectedDrill.title} />

              <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824]">
                <div className="flex items-center gap-1.5 text-dude font-bold mb-1">
                  <Compass size={14} /> <span>Cone Setup</span>
                </div>
                <div className="text-slate-300 leading-relaxed">{selectedDrill.coneSetup}</div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2 font-display">Execution Protocol:</h4>
                <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                  {selectedDrill.instructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-slate-200">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow-sm cursor-pointer"
                  onClick={() => setSelectedDrill(null)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
