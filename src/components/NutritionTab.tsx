import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { Utensils, Droplet, Moon, HeartPulse, Flame, Check, Plus, Minus, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface NutritionTabProps {
  currentProfile: UserProfile;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({ currentProfile }) => {
  const [water, setWater] = useState<number>(2.5);
  const [protein, setProtein] = useState<number>(120);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Optimal' | 'Good' | 'Fair' | 'Poor'>('Optimal');
  const [savedToday, setSavedToday] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const targetWater = 3.5;
  const targetProtein = 140;

  const handleSaveLogs = () => {
    setSavedToday(true);
    setTimeout(() => setSavedToday(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Hero Header */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <HeartPulse size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary block font-display">
              {currentProfile.toUpperCase()} RECOVERY & BIOMETRICS
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Nutrition, Hydration & Sleep
            </h2>
          </div>
        </div>

        <button
          onClick={handleSaveLogs}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
            savedToday
              ? 'bg-primary text-primary-foreground'
              : 'border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          {savedToday ? <Check size={15} /> : <Sparkles size={15} />}
          <span>{savedToday ? 'Logs Saved!' : 'Save Daily Log'}</span>
        </button>
      </div>

      {/* Main Trackers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hydration Tracker */}
        <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sky-400">
                <Droplet size={16} />
                <h3 className="text-sm font-bold text-white font-display">Hydration</h3>
              </div>
              <div className="font-mono text-sm font-bold text-sky-400">
                {water.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">/ {targetWater}L</span>
              </div>
            </div>

            <div className="w-full bg-[#121824] h-2 rounded-full overflow-hidden mb-4 border border-white/5">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (water / targetWater) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setWater((w) => Math.max(0, w - 0.5))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#121824] text-white hover:border-white/25 transition"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-mono font-bold text-muted-foreground">0.5 L</span>
            <button
              onClick={() => setWater((w) => w + 0.5)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/15 border border-sky-400/30 text-sky-400 hover:bg-sky-400/25 transition"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Protein Tracker */}
        <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-dude">
                <Utensils size={16} />
                <h3 className="text-sm font-bold text-white font-display">Protein Intake</h3>
              </div>
              <div className="font-mono text-sm font-bold text-dude">
                {protein} <span className="text-xs text-muted-foreground font-normal">/ {targetProtein}g</span>
              </div>
            </div>

            <div className="w-full bg-[#121824] h-2 rounded-full overflow-hidden mb-4 border border-white/5">
              <div
                className="h-full bg-dude rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (protein / targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setProtein((p) => Math.max(0, p - 10))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#121824] text-white hover:border-white/25 transition"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-mono font-bold text-muted-foreground">15 g</span>
            <button
              onClick={() => setProtein((p) => p + 15)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-dude/15 border border-dude/30 text-dude hover:bg-dude/25 transition"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary">
                <Moon size={16} />
                <h3 className="text-sm font-bold text-white font-display">Sleep & Recovery</h3>
              </div>
              <div className="font-mono text-sm font-bold text-primary">
                {sleepHours}h
              </div>
            </div>

            <div className="flex gap-1 mb-4">
              {(['Optimal', 'Good', 'Fair', 'Poor'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSleepQuality(q)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition ${
                    sleepQuality === q
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-[#121824] text-muted-foreground hover:text-white border border-white/5'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setSleepHours((s) => Math.max(4, s - 0.5))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#121824] text-white hover:border-white/25 transition"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-mono font-bold text-muted-foreground">0.5 h</span>
            <button
              onClick={() => setSleepHours((s) => s + 0.5)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Recovery & Mobility Tips */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-white font-display">
            <Flame size={16} className="text-[#ff9667]" />
            <span>Active Mobility & Injury Prevention Checklist</span>
          </div>
          {showTips ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>

        {showTips && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824]">
              <span className="font-bold text-dude block mb-1">Hip Flexor Mobilization</span>
              <p className="text-muted-foreground leading-relaxed">
                Prevents tight hip capsules after high-speed pitch sprints and weighted squats.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824]">
              <span className="font-bold text-primary block mb-1">Doorway Thoracic Opener</span>
              <p className="text-muted-foreground leading-relaxed">
                Counteracts chest tension from heavy push-ups, dips and desk posture.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#121824]">
              <span className="font-bold text-sky-400 block mb-1">Ankle Dorsiflexion Routine</span>
              <p className="text-muted-foreground leading-relaxed">
                Strengthens achilles resilience for change-of-direction cuts in football.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
