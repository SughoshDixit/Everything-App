import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Flame,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { getTacticalMissionDirective } from '../services/tacticalRoutineService';
import { GeminiAiService, type AiChatMessage } from '../services/geminiAiService';
import { speakText } from '../utils/audioCoach';

interface AiCoachBriefingCardProps {
  athleteName: string;
  streakCount: number;
  weeklyDistanceKm?: number;
  recentPace?: string;
  onQuickAction?: (actionKey: string) => void;
}

export const AiCoachBriefingCard: React.FC<AiCoachBriefingCardProps> = ({
  athleteName,
  streakCount,
  weeklyDistanceKm = 18.5,
  recentPace = '4:52 /km',
  onQuickAction,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [customInquiry, setCustomInquiry] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active 1-hour conversation thread
  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    return GeminiAiService.get1HourThread(athleteName).messages;
  });
  const [remainingMinutes, setRemainingMinutes] = useState<number>(() => {
    return GeminiAiService.get1HourThread(athleteName).remainingMinutes;
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Today's calendar context, military milestones & Anfield history
  const todayEvents = useMemo(() => GeminiAiService.getTodaySpecialityAndEvents(), []);

  // Daily mission directive & DEFCON level
  const mission = getTacticalMissionDirective(1, streakCount);
  const readinessScore = mission.readinessScore;

  // Periodically update remaining thread memory window
  useEffect(() => {
    const interval = setInterval(() => {
      const thread = GeminiAiService.get1HourThread(athleteName);
      setRemainingMinutes(thread.remainingMinutes);
    }, 60000);
    return () => clearInterval(interval);
  }, [athleteName]);

  useEffect(() => {
    if (expanded && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, expanded]);

  const dynamicPromptChips = useMemo(() => {
    return [
      `🎖️ ${todayEvents.dayOfYearTitle} Briefing`,
      '✨ Suggest 3 witty captions for today\'s workout',
      '🔴 How would Arne Slot assess my training today?',
      '⚽ Winger agility & first-step explosiveness',
      'SITREP: Shoulders & wrists feel fatigued',
      '⚔️ Dismantle my tiredness with Sam Manekshaw quote'
    ];
  }, [todayEvents]);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: Date.now()
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    GeminiAiService.saveThread(updated);
    setCustomInquiry('');
    setIsTyping(true);

    try {
      const aiReply = await GeminiAiService.askAi(queryText, updated, {
        athleteName,
        streakCount,
        weeklyDistanceKm,
        recentPace,
        defconLevel: mission.defconLevel
      });

      const finalHistory = [...updated, aiReply];
      setMessages(finalHistory);
      GeminiAiService.saveThread(finalHistory);
      setRemainingMinutes(60);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetThread = () => {
    GeminiAiService.clearThread();
    const fresh = GeminiAiService.get1HourThread(athleteName);
    setMessages(fresh.messages);
    setRemainingMinutes(60);
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handlePlayVoice = (text: string) => {
    // Strip markdown formatting for natural TTS
    const clean = text.replace(/[*_#`]/g, '').trim();
    speakText(clean, 1.0);
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
              <span className="text-[10px] font-black tracking-wider uppercase text-[#CCFF00] font-mono">
                Gen-AI Tactical Commander
              </span>
              <span className="flex items-center gap-0.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-zinc-300">
                <ShieldCheck size={10} className="text-emerald-400" /> Active 1h Thread
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

        {/* 🔴 Today's Speciality & Calendar Spotlight */}
        <div className="mt-3.5 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-950/30 via-[#181116] to-[#14121e] p-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 font-mono">
                {todayEvents.dayOfYearTitle}
              </span>
            </div>
            <button
              onClick={() => handlePlayVoice(todayEvents.militarySpeciality)}
              className="flex items-center gap-1 text-[9px] font-bold text-red-300 hover:text-white transition bg-red-500/20 px-2 py-0.5 rounded-md"
              title="Listen to Today's Speciality"
            >
              <Volume2 size={11} />
              <span>Audio Brief</span>
            </button>
          </div>

          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-300">
            {todayEvents.militarySpeciality}
          </p>

          <div className="mt-2 flex items-center justify-between border-t border-red-500/15 pt-2 text-[10px]">
            <span className="italic text-zinc-400 font-medium truncate max-w-[280px]">
              {todayEvents.anfieldTrivia}
            </span>
            <span className="font-bold text-red-400 shrink-0 font-mono">
              🔴 Anfield Intel
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Multi-Turn Gen AI Studio */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <span className="flex items-center gap-1.5 font-mono">
            <MessageSquare size={13} className="text-[#FC5200]" />
            Interactive Gen-AI Tactical Dialogue (1-Hour Thread)
          </span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-3 border-t border-white/10 pt-3 animate-in fade-in duration-200">
            {/* Thread Session Status Header */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-3 py-1.5 text-[10px] text-zinc-400">
              <div className="flex items-center gap-2 font-mono">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Thread Active · {remainingMinutes}m Memory Window</span>
              </div>
              <button
                type="button"
                onClick={handleResetThread}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition font-mono"
                title="Start a fresh conversation"
              >
                <RefreshCw size={11} />
                <span>Reset Thread</span>
              </button>
            </div>

            {/* Conversation Messages Transcript */}
            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1 scrollbar-none">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.sender === 'assistant' && msg.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#CCFF00] font-mono mb-1 flex items-center gap-1">
                      <Sparkles size={10} />
                      {msg.badge}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed max-w-[92%] ${
                      msg.sender === 'user'
                        ? 'bg-[#FC5200]/20 border border-[#FC5200]/40 text-white rounded-br-sm'
                        : 'bg-black/50 border border-white/10 text-zinc-200 rounded-bl-sm space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.sender === 'assistant' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-2">
                        <button
                          type="button"
                          onClick={() => handlePlayVoice(msg.text)}
                          className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 hover:text-[#CCFF00] transition bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg"
                        >
                          <Volume2 size={12} />
                          <span>Listen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 hover:text-[#CCFF00] transition bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 rounded-xl bg-black/40 p-3 text-xs text-zinc-400 font-mono">
                  <div className="h-2 w-2 animate-ping rounded-full bg-[#CCFF00]" />
                  <span>Commander Iron synthesizing tactical response with present day context...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Dynamic Present-Day Context Prompt Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono block">
                Quick Prompts based on {todayEvents.dayOfYearTitle}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dynamicPromptChips.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-white/20 hover:bg-white/10 transition text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(customInquiry);
              }}
              className="flex gap-2 pt-1"
            >
              <input
                type="text"
                placeholder="Ask for custom captions, tactics, Liverpool banter, or Army ethos..."
                value={customInquiry}
                onChange={(e) => setCustomInquiry(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#CCFF00]/50 placeholder:text-zinc-600 transition"
              />
              <button
                type="submit"
                disabled={isTyping || !customInquiry.trim()}
                className="rounded-xl bg-[#CCFF00] text-black px-3.5 py-2 text-xs font-black uppercase hover:bg-[#b8e600] disabled:opacity-40 transition flex items-center justify-center shrink-0"
              >
                <Send size={13} />
              </button>
            </form>

            {onQuickAction && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => onQuickAction('run')}
                  className="rounded-lg bg-[#FC5200]/20 border border-[#FC5200]/40 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#FC5200]/30 transition"
                >
                  🏃 Launch Run
                </button>
                <button
                  type="button"
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
