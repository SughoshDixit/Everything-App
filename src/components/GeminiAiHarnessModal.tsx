import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Cpu,
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
    label: '📸 Social Caption Studio',
    icon: Sparkles,
    prompt: 'Generate 3 high-impact social captions for an 8.5 km run completed in 39 mins (4:35/km pace). Categories: 1) Anfield Banter, 2) Indian Armed Forces Grit, 3) Minimalist Athlete Telemetry.'
  },
  {
    id: 'nutrition',
    label: '🥗 Fuel & Glycogen Diagnostic',
    icon: Activity,
    prompt: 'Analyze post-workout recovery fuel requirements after an intense 90-minute football training session. Specify protein, hydration, electrolyte, and complex carb targets.'
  },
  {
    id: 'split_cue',
    label: '🎙️ Audio Split Voice Cue',
    icon: Volume2,
    prompt: 'Write an intense 10-word audio split directive to be spoken through headphones at kilometer 7 when runner pace is slipping from 4:40 to 4:55 /km.'
  }
];

export const GeminiAiHarnessModal: React.FC<GeminiAiHarnessModalProps> = ({ onClose, initialPrompt }) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) || '';
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [model, setModel] = useState<string>('gemini-1.5-flash');
  const [temperature, setTemperature] = useState<number>(0.8);
  const [topP, setTopP] = useState<number>(0.95);
  const [maxTokens, setMaxTokens] = useState<number>(600);
  const [prompt, setPrompt] = useState<string>(initialPrompt || PRESETS[0].prompt);
  const [customSystem, setCustomSystem] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeminiHarnessResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    }
  }, [apiKey]);

  const handleRunQuery = async () => {
    if (!prompt.trim() || isLoading) return;
    playMechanicalClick();
    setIsLoading(true);

    try {
      const res = await GeminiAiService.runHarnessQuery(
        prompt,
        apiKey.trim(),
        {
          model,
          temperature,
          topP,
          maxOutputTokens: maxTokens,
          systemInstruction: customSystem.trim() || undefined
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-4xl h-[92vh] max-h-[920px] bg-[#0E131B] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#121824]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 shadow-sm">
              <Cpu size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight font-display text-white">
                  Gemini AI Interactive Test Harness
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  v2.1 Lab
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live model architecture benchmarker, parameter tuning &amp; prompt testing engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                apiKey
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
              title="Configure Gemini API Key"
            >
              <Key size={13} />
              <span>{apiKey ? 'API Key Active' : 'Offline Mode (Local Synthesizer)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* API Key Drawer (Expandable) */}
        {showKeyInput && (
          <div className="px-5 py-3 bg-[#151c2a] border-b border-white/10 flex items-center gap-3 animate-in slide-in-from-top-2">
            <Key size={16} className="text-[#CCFF00] shrink-0" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste Google Gemini API Key (saved securely in localStorage)"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
            />
            {apiKey && (
              <button
                onClick={() => {
                  setApiKey('');
                  localStorage.removeItem('gemini_api_key');
                }}
                className="text-xs text-rose-400 hover:underline px-2"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#121824] border border-white/5">
            {/* Model Selector */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Model Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#1A2232] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast Coach)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analytics)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Experimental)</option>
                <option value="on-device">On-Device Synthesizer (Zero-Key)</option>
              </select>
            </div>

            {/* Temperature Slider */}
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

            {/* Top-P Slider */}
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

            {/* Max Output Tokens */}
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

          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
                1-Tap Athletic Benchmarks
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-[#CCFF00] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Sliders size={12} />
                <span>{showAdvanced ? 'Hide System Prompt' : 'Custom System Prompt'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isCurrent
                        ? 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/40 shadow-sm'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced System Prompt Drawer */}
          {showAdvanced && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 animate-in fade-in">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                System Instructions Override (Optional)
              </label>
              <textarea
                value={customSystem}
                onChange={(e) => setCustomSystem(e.target.value)}
                placeholder="Leave blank to use default 'Commander Iron & Anfield Tactical Coach' system instructions..."
                rows={3}
                className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] font-mono"
              />
            </div>
          )}

          {/* User Prompt Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
                Prompt Laboratory
              </label>
              <button
                onClick={() => setPrompt('')}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleRunQuery();
                }
              }}
              rows={4}
              placeholder="Type your athletic instruction, tactical scenario, or excuse here..."
              className="w-full bg-[#121824] border border-white/10 rounded-2xl p-3.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] shadow-inner"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-zinc-500">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">Ctrl + Enter</kbd> to execute
              </span>

              <button
                onClick={handleRunQuery}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-extrabold text-xs shadow-lg shadow-[#CCFF00]/25 transition cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    <span>Executing Prompt...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>Run Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Telemetry & Result */}
          {result && (
            <div className="space-y-3 p-4 rounded-2xl bg-[#121824] border border-white/10 animate-in fade-in">
              {/* Telemetry Metrics Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white font-mono">
                    🤖 {result.modelUsed}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#CCFF00]">
                    ⚡ {result.latencyMs} ms
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    Input: {result.estimatedPromptTokens} tok &bull; Output: {result.estimatedOutputTokens} tok
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition cursor-pointer"
                    title="Speak Response"
                  >
                    <Volume2 size={13} className={isSpeaking ? 'text-[#CCFF00] animate-pulse' : 'text-zinc-400'} />
                    <span>Speak</span>
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition cursor-pointer"
                    title="Copy Text"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Output Content */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap">
                {result.text}
              </div>

              {/* Raw JSON Inspector Toggle */}
              <div>
                <button
                  onClick={() => setShowJsonInspector(!showJsonInspector)}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <Terminal size={12} />
                  <span>{showJsonInspector ? 'Hide Raw Request / Response JSON' : 'Inspect Raw JSON Payload'}</span>
                  {showJsonInspector ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showJsonInspector && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono animate-in fade-in">
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto max-h-48">
                      <div className="text-zinc-400 font-bold mb-1">RAW REQUEST:</div>
                      <pre className="text-sky-300">{JSON.stringify(result.rawRequest, null, 2)}</pre>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto max-h-48">
                      <div className="text-zinc-400 font-bold mb-1">RAW RESPONSE:</div>
                      <pre className="text-emerald-300">{JSON.stringify(result.rawResponse, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-white/10 bg-[#0E131B] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Google Gemini Interactions API &bull; Multi-Turn Contextual Harness</span>
          <span>Everything App v2.1.0</span>
        </div>
      </div>
    </div>
  );
};
