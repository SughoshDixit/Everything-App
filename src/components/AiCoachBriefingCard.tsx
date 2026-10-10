import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Droplets,
  Moon,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface AiCoachBriefingCardProps {
  athleteName: string;
  streakCount: number;
  weeklyDistanceKm?: number;
  recentPace?: string;
  onQuickAction?: (actionKey: string) => void;
}

const COACH_PROMPTS = [
  'How should I recover today?',
  'Pre-match football nutrition advice',
  'Should I push my calisthenics ladder today?',
  'What pace should I target for my 5K?',
];

const PREBUILT_ADVICE: Record<string, string> = {
  'How should I recover today?':
    'Based on your recent training load, spend 15 minutes foam rolling your quads and calves, drink at least 3.0L water with electrolytes, and complete a 20-minute restorative walk before 8 PM.',
  'Pre-match football nutrition advice':
    'Eat a clean carbohydrate meal (oats with banana or rice with light protein) 3 hours before kickoff. Sip 500ml water with sodium 45 mins prior. Avoid heavy fats to keep explosive reaction times sharp.',
  'Should I push my calisthenics ladder today?':
    'Your discipline streak is strong! If your shoulders and wrists feel fresh, test your Level 4 push-up volume ladder. If experiencing slight fatigue, focus on slow eccentric reps (3s down) instead of max volume.',
  'What pace should I target for my 5K?':
    'Looking at your recent 1K benchmark (3:52 /km), aim for a controlled 4:45–5:00 /km pace for the first 3km, then open up your stride for the final 2km to finish strong under 24 minutes.',
};

export const AiCoachBriefingCard: React.FC<AiCoachBriefingCardProps> = ({
  athleteName,
  streakCount,
  weeklyDistanceKm = 18.5,
  recentPace = '4:52 /km',
  onQuickAction,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [coachResponse, setCoachResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Compute a dynamic readiness score (e.g., 88%)
  const readinessScore = Math.min(96, Math.max(72, 78 + (streakCount > 7 ? 6 : 2)));

  const handleAskCoach = (prompt: string) => {
    setSelectedPrompt(prompt);
    setIsTyping(true);
    setCoachResponse(null);

    setTimeout(() => {
      setCoachResponse(PREBUILT_ADVICE[prompt] || 'Keep consistent with your routine and prioritize hydration today!');
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121824] via-[#161f2e] to-[#0f1521] p-5 text-white shadow-xl">
      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#FC5200]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#CCFF00]/10 blur-3xl" />

      {/* Header Row */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FC5200] to-[#ff7b39] text-white shadow-lg shadow-[#FC5200]/25">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#CCFF00]">
                AI Performance Intelligence
              </span>
              <span className="flex items-center gap-0.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-zinc-300">
                <ShieldCheck size={10} className="text-emerald-400" /> Live Sync
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white">
              Coach Dude's Daily Briefing
            </h3>
          </div>
        </div>

        {/* Readiness Ring Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-zinc-400">Readiness</p>
            <p className="text-sm font-black text-[#CCFF00]">{readinessScore}%</p>
          </div>
          <div className="h-8 w-1 rounded-full bg-[#CCFF00]" />
        </div>
      </div>

      {/* Personalized AI Synthesis */}
      <div className="relative mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3.5 backdrop-blur-sm">
        <p className="text-xs leading-relaxed text-zinc-200">
          <span className="font-semibold text-white">Good morning, {athleteName}!</span> Your
          aerobic engine and discipline streak (<span className="text-[#FC5200] font-bold">🔥 {streakCount} days</span>) are operating in high gear. Weekly distance is on track at{' '}
          <span className="text-white font-semibold">{weeklyDistanceKm.toFixed(1)} km</span> with benchmark pace{' '}
          <span className="text-[#CCFF00] font-semibold">{recentPace}</span>.
        </p>

        {/* Daily Target Metrics Bar */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FC5200]/15 text-[#FC5200]">
              <Zap size={14} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Today's Load</p>
              <p className="text-[11px] font-bold text-white">Optimal Aerobic</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/15 text-sky-400">
              <Droplets size={14} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Hydration</p>
              <p className="text-[11px] font-bold text-white">3.2 Liters</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
              <Moon size={14} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Recovery</p>
              <p className="text-[11px] font-bold text-white">Mobility Block</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Coach Dialogue */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare size={13} className="text-[#FC5200]" />
            Ask Coach Dude Tactical Advice
          </span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-3 border-t border-white/10 pt-3 animate-in fade-in duration-200">
            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COACH_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskCoach(prompt)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                    selectedPrompt === prompt
                      ? 'border-[#FC5200] bg-[#FC5200]/20 text-white font-bold'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* AI Coach Output Bubble */}
            {isTyping && (
              <div className="flex items-center gap-2 rounded-xl bg-black/40 p-3 text-xs text-zinc-400">
                <div className="h-2 w-2 animate-ping rounded-full bg-[#CCFF00]" />
                Coach Dude is analyzing your biometric log...
              </div>
            )}

            {coachResponse && (
              <div className="rounded-xl border border-[#CCFF00]/20 bg-[#CCFF00]/5 p-3.5 text-xs leading-relaxed text-zinc-200 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#CCFF00]">
                  <Sparkles size={12} /> Coach Recommendation
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-200">{coachResponse}</p>
              </div>
            )}

            {onQuickAction && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => onQuickAction('run')}
                  className="rounded-lg bg-[#FC5200]/20 border border-[#FC5200]/40 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#FC5200]/30 transition"
                >
                  🏃 Launch Run
                </button>
                <button
                  onClick={() => onQuickAction('football')}
                  className="rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00]/30 px-2.5 py-1 text-[10px] font-bold text-[#CCFF00] hover:bg-[#CCFF00]/25 transition"
                >
                  ⚽ Football Drill
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default AiCoachBriefingCard;
