import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Droplets,
  Moon,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Volume2,
  Send,
  Radio,
  Flame
} from 'lucide-react';
import { TacticalAiEngine } from '../services/tacticalAiEngine';
import { getTacticalMissionDirective } from '../services/tacticalRoutineService';
import { speakText } from '../utils/audioCoach';
import type { TacticalAiResponse } from '../types/tactical';

interface AiCoachBriefingCardProps {
  athleteName: string;
  streakCount: number;
  weeklyDistanceKm?: number;
  recentPace?: string;
  onQuickAction?: (actionKey: string) => void;
}

const TACTICAL_CHIPS = [
  '🔴 Anfield Mentality: How would Klopp coach me today?',
  '⚽ Winger agility & first-step explosiveness',
  'How should I recover today?',
  'SITREP: Shoulders & wrists feel fatigued',
  'I feel lazy today, dismantle my excuse',
  'What pace should I target for my 5K?',
];

export const AiCoachBriefingCard: React.FC<AiCoachBriefingCardProps> = ({
  athleteName,
  streakCount,
  weeklyDistanceKm = 18.5,
  recentPace = '4:52 /km',
  onQuickAction,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [customInquiry, setCustomInquiry] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<TacticalAiResponse | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Today's football history & Anfield milestone
  const footballMilestone = useMemo(() => TacticalAiEngine.getTodayFootballMilestone(), []);

  // Get daily mission directive & DEFCON level
  const mission = getTacticalMissionDirective(1, streakCount);
  const readinessScore = mission.readinessScore;

  const handleAskCommander = (promptText: string) => {
    if (!promptText.trim()) return;
    setSelectedPrompt(promptText);
    setIsTyping(true);
    setAiResponse(null);

    setTimeout(() => {
      const resp = TacticalAiEngine.evaluateInquiry(promptText, {
        athleteName,
        streakCount,
        recentPace,
        weeklyDistanceKm,
        defconLevel: mission.defconLevel,
        isRestDay: mission.isRestDay,
        dayNumber: mission.dayNumber,
      });
      setAiResponse(resp);
      setIsTyping(false);
    }, 350);
  };

  const handlePlayVoice = (text: string) => {
    speakText(text, 1.02);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121824] via-[#161f2e] to-[#0f1521] p-5 text-white shadow-xl">
      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#FC5200]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#CCFF00]/10 blur-3xl" />

      {/* Header Row */}
      <div className="relative flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FC5200] to-[#ff7b39] text-white shadow-lg shadow-[#FC5200]/25">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase text-[#CCFF00]">
                Tactical AI Commander
              </span>
              <span className="flex items-center gap-0.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-zinc-300">
                <ShieldCheck size={10} className="text-emerald-400" /> Embedded SLM
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white">
              {mission.codename}
            </h3>
          </div>
        </div>

        {/* DEFCON Readiness Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-wider text-zinc-400 font-mono">
              {mission.defconLevel === 'DEFCON_1_REGEN' ? 'DEFCON 1 (REGEN)' : 'DEFCON 3 (COMBAT)'}
            </p>
            <p className="text-sm font-black text-[#CCFF00] font-mono">{readinessScore}%</p>
          </div>
          <div className={`h-8 w-1 rounded-full ${mission.defconLevel === 'DEFCON_1_REGEN' ? 'bg-amber-400' : 'bg-[#CCFF00]'}`} />
        </div>
      </div>

      {/* Personalized AI Synthesis */}
      <div className="relative mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3.5 backdrop-blur-sm">
        <p className="text-xs leading-relaxed text-zinc-200">
          <span className="font-semibold text-white">Attention, {athleteName}!</span> {mission.briefing}{' '}
          Discipline streak stands firm at (<span className="text-[#FC5200] font-bold">🔥 {streakCount} days</span>). Weekly aerobic mileage is{' '}
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
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono">Today's Load</p>
              <p className="text-[11px] font-bold text-white">
                {mission.isRestDay ? 'Active Recovery' : 'Full Combat PT'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/15 text-sky-400">
              <Droplets size={14} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono">Hydration</p>
              <p className="text-[11px] font-bold text-white">{mission.hydrationLiters} Liters</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
              <Moon size={14} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono">Recovery</p>
              <p className="text-[11px] font-bold text-white">
                {mission.isRestDay ? 'Spinal Decompress' : '60s Rest Cadence'}
              </p>
            </div>
          </div>
        </div>

        {/* 🔴 Anfield Pulse & Football History Spotlight */}
        <div className="mt-3.5 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-950/30 via-[#181116] to-[#14121e] p-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 font-mono">
                {footballMilestone.dayTheme} • {footballMilestone.dateKey}
              </span>
            </div>
            <button
              onClick={() => handlePlayVoice(`${footballMilestone.hero} on this day: ${footballMilestone.tacticalLesson}`)}
              className="flex items-center gap-1 text-[9px] font-bold text-red-300 hover:text-white transition bg-red-500/20 px-2 py-0.5 rounded-md"
              title="Listen to Anfield Spirit"
            >
              <Volume2 size={11} />
              <span>Anfield Audio</span>
            </button>
          </div>

          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-300">
            {footballMilestone.eventDescription}
          </p>

          <div className="mt-2 flex items-center justify-between border-t border-red-500/15 pt-2 text-[10px]">
            <span className="italic text-zinc-400 font-medium truncate max-w-[260px]">
              "{footballMilestone.tacticalLesson}"
            </span>
            <span className="font-bold text-red-400 shrink-0 font-mono">
              — {footballMilestone.hero}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Interactive Commander Dialogue */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <span className="flex items-center gap-1.5 font-mono">
            <MessageSquare size={13} className="text-[#FC5200]" />
            Request Tactical Guidance & Excuse Dismantling
          </span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-3 border-t border-white/10 pt-3 animate-in fade-in duration-200">
            {/* Quick Tactical Chips */}
            <div className="flex flex-wrap gap-1.5">
              {TACTICAL_CHIPS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskCommander(prompt)}
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

            {/* Custom Free-Form Inquiry Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskCommander(customInquiry);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask Commander Iron anything (e.g. sore ankles, pacing, rest rules)..."
                value={customInquiry}
                onChange={(e) => setCustomInquiry(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#CCFF00]/50 placeholder:text-zinc-600 transition"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#CCFF00] text-black px-3 py-2 text-xs font-black uppercase hover:bg-[#b8e600] transition flex items-center justify-center shrink-0"
              >
                <Send size={13} />
              </button>
            </form>

            {/* AI Commander Thinking Animation */}
            {isTyping && (
              <div className="flex items-center gap-2 rounded-xl bg-black/40 p-3 text-xs text-zinc-400 font-mono">
                <div className="h-2 w-2 animate-ping rounded-full bg-[#CCFF00]" />
                Commander Iron evaluating tactical readiness and fatigue markers...
              </div>
            )}

            {/* AI Commander Output Card */}
            {aiResponse && (
              <div className="rounded-xl border border-[#CCFF00]/25 bg-[#CCFF00]/5 p-4 text-xs leading-relaxed text-zinc-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#CCFF00] font-mono">
                    <Sparkles size={12} /> {aiResponse.headline}
                  </span>
                  <button
                    onClick={() => handlePlayVoice(aiResponse.audioCadenceLine || aiResponse.directive)}
                    className="flex items-center gap-1 text-[10px] font-bold text-white hover:text-[#CCFF00] transition bg-white/10 px-2 py-0.5 rounded-lg"
                    title="Listen to Drill Sergeant Voice"
                  >
                    <Volume2 size={12} />
                    <span>Hear Orders</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-200 leading-relaxed font-medium">
                  {aiResponse.directive}
                </p>

                {aiResponse.orders && aiResponse.orders.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono block">
                      Tactical Action Orders:
                    </span>
                    <ul className="space-y-1">
                      {aiResponse.orders.map((order, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                          <span className="text-[#CCFF00] font-bold">[{i + 1}]</span>
                          <span>{order}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResponse.footballBonusQuote && (
                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-950/20 p-2.5 text-[11px] text-zinc-300">
                    <span className="text-[9px] font-black uppercase tracking-wider text-red-400 font-mono flex items-center gap-1">
                      <Flame size={11} className="text-red-500" />
                      Anfield Mindset: {aiResponse.footballBonusQuote.speaker}
                    </span>
                    <p className="mt-1 italic text-zinc-200">
                      "{aiResponse.footballBonusQuote.text}"
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">
                      {aiResponse.footballBonusQuote.context}
                    </p>
                  </div>
                )}
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
