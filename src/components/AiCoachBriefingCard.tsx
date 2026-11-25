import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Volume2,
  Send,
  Radio,
  Copy,
  Check,
  RefreshCw,
  X
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
  onOpenAiHarness?: () => void;
  compactOnly?: boolean;
}

export const AiCoachBriefingCard: React.FC<AiCoachBriefingCardProps> = ({
  athleteName,
  streakCount,
  weeklyDistanceKm = 18.5,
  recentPace = '4:52 /km',
  onQuickAction,
  onOpenAiHarness,
  compactOnly = false,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [customInquiry, setCustomInquiry] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

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
    if (modalOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, modalOpen]);

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
    const clean = text.replace(/[*_#`]/g, '').trim();
    setIsPlayingAudio(true);
    speakText(clean, 1.0);
    setTimeout(() => setIsPlayingAudio(false), 5000);
  };

  // Crisp minimal 1-liner directive
  const ambientDirective = useMemo(() => {
    return mission.defconLevel === 'DEFCON_1_REGEN'
      ? 'Active recovery & mobility engaged · Prime muscle repair'
      : 'Readiness optimal at 94% · Prime state for tempo intervals & drills';
  }, [mission.defconLevel]);

  return (
    <>
      {/* 🌟 AMBIENT GLANCEABLE AI PILL (Minimalist, Mobile First) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#121824] via-[#161f2e] to-[#0f1521] p-3 sm:p-4 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FC5200]/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#CCFF00]/10 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Minimal Status Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FC5200] to-[#ff7b39] text-white shadow-md shadow-[#FC5200]/25">
              <Sparkles size={16} className="text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase text-[#CCFF00] font-mono flex items-center gap-1">
                  Gemini AI
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.2 text-[9px] font-bold text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                  {readinessScore}% Readiness
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">
                  🔥 {streakCount}d
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">
                {ambientDirective}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onQuickAction && (
              <button
                type="button"
                onClick={() => onQuickAction(mission.defconLevel === 'DEFCON_1_REGEN' ? 'football' : 'run')}
                className="hidden xs:flex items-center gap-1 rounded-xl bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition cursor-pointer"
              >
                <span>{mission.defconLevel === 'DEFCON_1_REGEN' ? '⚽ Drill' : '🏃 Run'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handlePlayVoice(ambientDirective)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 transition cursor-pointer"
              title="Listen to audio briefing"
            >
              <Volume2 size={13} className={isPlayingAudio ? "text-[#CCFF00] animate-pulse" : "text-zinc-300"} />
              <span className="hidden xs:inline">Listen</span>
            </button>

            {!compactOnly && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAiHarness) {
                    onOpenAiHarness();
                  } else {
                    setModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black px-3 py-1.5 text-xs font-black uppercase tracking-wider transition shadow-md shadow-[#CCFF00]/20 cursor-pointer active:scale-95"
                title="Open Gemini AI Coach"
              >
                <Sparkles size={13} fill="currentColor" />
                <span>Ask AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 EXPANDED COPILOT DIALOGUE DRAWER / MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-[#141a26] via-[#101520] to-[#0a0d14] p-5 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FC5200] to-[#ff7b39] text-white shadow-lg shadow-[#FC5200]/25">
                  <Radio size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#CCFF00] font-mono">
                      Tactical Intelligence Copilot
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-zinc-300">
                      <ShieldCheck size={10} className="text-emerald-400" /> {remainingMinutes}m Memory
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {mission.codename} · {todayEvents.dayOfYearTitle}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetThread}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition"
                  title="Reset conversation thread"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                  title="Close Copilot"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick Context Summary Chips */}
            <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-300">
              <span className="truncate max-w-[340px] text-[11px] italic">
                🔴 {todayEvents.anfieldTrivia}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#CCFF00] shrink-0">
                ⚡ DEFCON {mission.defconLevel === 'DEFCON_1_REGEN' ? '1' : '3'}
              </span>
            </div>

            {/* Conversation Messages Transcript */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-4 scrollbar-none min-h-[220px]">
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
                        ? 'bg-[#FC5200]/25 border border-[#FC5200]/40 text-white rounded-br-sm'
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
                  <span>Synthesizing tactical guidance...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono block">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
                {dynamicPromptChips.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-white/20 hover:bg-white/10 transition text-left cursor-pointer"
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
              className="flex gap-2 pt-3"
            >
              <input
                type="text"
                placeholder="Ask for workout captions, Liverpool banter, or tactics..."
                value={customInquiry}
                onChange={(e) => setCustomInquiry(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-[#CCFF00]/50 placeholder:text-zinc-500 transition"
              />
              <button
                type="submit"
                disabled={isTyping || !customInquiry.trim()}
                className="rounded-xl bg-[#CCFF00] text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-[#b8e600] disabled:opacity-40 transition flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiCoachBriefingCard;
