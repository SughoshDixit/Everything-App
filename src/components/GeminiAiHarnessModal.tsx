import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Sliders,
  Terminal,
  Copy,
  Check,
  Volume2,
  Key,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { GeminiAiService, type GeminiHarnessResult } from '../services/geminiAiService';
import { speakText } from '../utils/audioCoach';
import { playMechanicalClick, playLevelUpChime } from '../utils/audio';

interface GeminiAiHarnessModalProps {
  onClose: () => void;
  initialPrompt?: string;
}

const PRESETS = [
  {
    id: 'briefing',
    label: '⚡ Pre-Run Briefing',
    icon: Flame,
    prompt: 'Synthesize a high-energy, 15-second pre-run tactical directive for Sughosh before a 10km morning tempo run. Infuse Arne Slot high-tempo pressing intensity and Indian Armed Forces resolve.'
  },
  {
    id: 'excuse',
    label: '🛡️ Excuse Buster',
    icon: ShieldCheck,
    prompt: 'My legs feel heavy and I only slept 6 hours. Convince me why I shouldn\'t skip today\'s 5km cadence drill using Captain Vikram Batra ethos and Anfield discipline.'
  },
  {
    id: 'captions',
    label: '📸 Social Captions',
    icon: Sparkles,
    prompt: 'Generate 3 high-impact social captions for an 8.5 km run completed in 39 mins (4:35/km pace). Categories: 1) Anfield Banter, 2) Indian Armed Forces Grit, 3) Minimalist Athlete Telemetry.'
  },
  {
    id: 'nutrition',
    label: '🥗 Fuel & Recovery',
    icon: Activity,
    prompt: 'Analyze post-workout recovery fuel requirements after an intense 90-minute football training session. Specify protein, hydration, electrolyte, and complex carb targets.'
  },
  {
    id: 'split_cue',
    label: '🎙️ Split Voice Cue',
    icon: Volume2,
    prompt: 'Write an intense 10-word audio split directive to be spoken through headphones at kilometer 7 when runner pace is slipping from 4:40 to 4:55 /km.'
  }
];

export const GeminiAiHarnessModal: React.FC<GeminiAiHarnessModalProps> = ({ onClose, initialPrompt }) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) {
      return localStorage.getItem('gemini_api_key')!;
    }
    try {
      return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    } catch {
      return '';
    }
  });
  const [tempKey, setTempKey] = useState<string>(apiKey);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [showTuning, setShowTuning] = useState<boolean>(false);
  const [model, setModel] = useState<string>('gemini-3.5-flash-lite');
  const [temperature, setTemperature] = useState<number>(0.8);
  const [topP, setTopP] = useState<number>(0.95);
  const [maxTokens, setMaxTokens] = useState<number>(600);
  const [prompt, setPrompt] = useState<string>(initialPrompt || PRESETS[0].prompt);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeminiHarnessResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setTempKey(apiKey.trim());
    }
  }, [apiKey]);

  const handleRunQuery = async () => {
    if (!prompt.trim() || isLoading) return;
    playMechanicalClick();
    setIsLoading(true);

    // If cloud model is chosen but no API key is present, open key drawer and notify
    if (!apiKey.trim() && model !== 'on-device') {
      setShowKeyInput(true);
    }

    try {
      const res = await GeminiAiService.runHarnessQuery(
        prompt,
        apiKey.trim(),
        {
          model,
          temperature,
          topP,
          maxOutputTokens: maxTokens
        },
        {
          athleteName: 'Sughosh Dixit',
          streakCount: 14,
          recentPace: '4:40 /km',
          weeklyDistanceKm: 28.5
        }
      );
      setResult(res);
      playLevelUpChime();
    } catch (err: any) {
      setResult({
        text: `Execution failed: ${err?.message || err}`,
        modelUsed: model,
        latencyMs: 0,
        estimatedPromptTokens: 0,
        estimatedOutputTokens: 0,
        rawRequest: null,
        rawResponse: null,
        error: String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!result?.text) return;
    setIsSpeaking(true);
    speakText(result.text);
    setTimeout(() => setIsSpeaking(false), 8000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl h-[94dvh] sm:h-[86vh] max-h-[850px] bg-[#0E131B] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Mobile pull indicator */}
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 sm:hidden shrink-0" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-[#121824]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 shadow-sm">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight font-display text-white">
                  Gemini AI
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {model === 'on-device' ? 'OFFLINE' : 'LIVE'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                apiKey
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
              }`}
              title="Configure Google Gemini API Key"
            >
              <Key size={12} />
              <span className="hidden xs:inline">{apiKey ? 'API Key Active' : 'API Key'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              aria-label="Close Gemini AI"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* API Key Drawer (Expandable) */}
        {showKeyInput && (
          <div className="px-4 py-3 bg-[#151c2a] border-b border-white/10 space-y-2 animate-in slide-in-from-top-2 shrink-0">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                <Key size={13} className="text-[#CCFF00]" />
                <span>Google Gemini API Key</span>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#CCFF00] hover:underline font-mono"
              >
                Get Key ↗
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste AIzaSy... key"
                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] font-mono"
              />
              <button
                onClick={() => {
                  setApiKey(tempKey.trim());
                  if (tempKey.trim()) {
                    localStorage.setItem('gemini_api_key', tempKey.trim());
                    setShowKeyInput(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs transition cursor-pointer shrink-0"
              >
                Save
              </button>
              {apiKey && (
                <button
                  onClick={() => {
                    setApiKey('');
                    setTempKey('');
                    localStorage.removeItem('gemini_api_key');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/20 transition cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Controls Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#121824] border border-white/5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex-1 bg-[#1A2232] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00] truncate"
                >
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Recommended)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                  <option value="on-device">On-Device Synthesizer (Offline)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowTuning(!showTuning)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                  showTuning
                    ? 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/40'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                <Sliders size={13} />
                <span>{showTuning ? 'Done' : 'Tune'}</span>
              </button>
            </div>

            {/* Collapsible Tuning Sliders */}
            {showTuning && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#121824] border border-white/10 animate-in fade-in duration-150">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Temperature
                    </label>
                    <span className="font-mono text-[10px] font-bold text-[#CCFF00]">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#CCFF00] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Top-P
                    </label>
                    <span className="font-mono text-[10px] font-bold text-[#CCFF00]">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full accent-[#CCFF00] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Max Tokens
                    </label>
                    <span className="font-mono text-[10px] font-bold text-[#CCFF00]">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1200"
                    step="50"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full accent-[#CCFF00] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons - Smooth Horizontal Touch Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isCurrent = prompt === p.prompt;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    playMechanicalClick();
                    setPrompt(p.prompt);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer active:scale-95 ${
                    isCurrent
                      ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Prompt Editor */}
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleRunQuery();
                }
              }}
              rows={3}
              placeholder="Ask Gemini anything or tap a preset above..."
              className="w-full bg-[#121824] border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] shadow-inner"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPrompt('')}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </button>

              <button
                onClick={handleRunQuery}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-extrabold text-xs shadow-md shadow-[#CCFF00]/25 transition cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RotateCcw size={13} className="animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} fill="currentColor" />
                    <span>Run Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Telemetry & Result */}
          {result && (
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#121824] border border-white/10 animate-in fade-in">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#CCFF00] font-bold">
                    ⚡ {result.latencyMs}ms
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    &bull; {result.modelUsed}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-zinc-200 transition cursor-pointer"
                    title="Speak Response"
                  >
                    <Volume2 size={12} className={isSpeaking ? 'text-[#CCFF00] animate-pulse' : 'text-zinc-400'} />
                    <span>{isSpeaking ? 'Playing' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-zinc-200 transition cursor-pointer"
                    title="Copy Text"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Output Content */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap select-text">
                {result.text}
              </div>

              {/* Raw JSON Toggle */}
              <div>
                <button
                  onClick={() => setShowJsonInspector(!showJsonInspector)}
                  className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <Terminal size={11} />
                  <span>{showJsonInspector ? 'Hide Raw JSON' : 'Inspect JSON Payload'}</span>
                  {showJsonInspector ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>

                {showJsonInspector && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono animate-in fade-in">
                    <div className="p-2 rounded-xl bg-black/60 border border-white/10 overflow-x-auto max-h-40">
                      <div className="text-zinc-400 font-bold mb-1">REQUEST:</div>
                      <pre className="text-sky-300">{JSON.stringify(result.rawRequest, null, 2)}</pre>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-white/10 overflow-x-auto max-h-40">
                      <div className="text-zinc-400 font-bold mb-1">RESPONSE:</div>
                      <pre className="text-emerald-300">{JSON.stringify(result.rawResponse, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
