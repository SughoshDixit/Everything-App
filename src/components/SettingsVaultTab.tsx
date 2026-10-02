import React, { useState } from 'react';
import type { MotivationalQuote } from '../types';
import { Smartphone, Plus, ChevronDown, ChevronUp, Sparkles, Quote } from 'lucide-react';

interface SettingsVaultTabProps {
  quotes: MotivationalQuote[];
  onAddQuote: (quote: Omit<MotivationalQuote, 'id'>) => void;
}

export const SettingsVaultTab: React.FC<SettingsVaultTabProps> = ({ quotes, onAddQuote }) => {
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newAuthor, setNewAuthor] = useState('Athlete');
  const [newCategory, setNewCategory] = useState<MotivationalQuote['category']>('discipline');
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    onAddQuote({
      text: newQuoteText.trim(),
      author: newAuthor.trim() || 'Anonymous',
      category: newCategory,
      addedBy: newAuthor.toLowerCase().includes('women') ? 'women' : 'men'
    });
    setNewQuoteText('');
    alert('Quote added to vault!');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* PWA Install Guide */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setShowInstallGuide(!showInstallGuide)}
        >
          <div className="flex items-center gap-2.5">
            <Smartphone size={16} className="text-primary" />
            <span className="text-sm font-bold text-white font-display">
              Progressive Web App (PWA) Offline Installation Guide
            </span>
          </div>
          {showInstallGuide ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>

        {showInstallGuide && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-muted-foreground space-y-2 animate-fade-in">
            <p>1. Open this app in Chrome or Safari on your phone.</p>
            <p>2. Tap the browser menu ⋮ or Share button and select <strong>"Add to Home Screen"</strong>.</p>
            <p>3. Launch from your home screen for full native screen experience with offline caching.</p>
          </div>
        )}
      </div>

      {/* Add Mantra Form */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-dude" />
          <h3 className="text-sm font-bold text-white font-display">
            Add Athlete Mantra / Intention to Vault
          </h3>
        </div>

        <form onSubmit={handleCreateQuote} className="space-y-3.5">
          <div>
            <textarea
              placeholder="Your athletic quote, reminder or mantra..."
              value={newQuoteText}
              onChange={(e) => setNewQuoteText(e.target.value)}
              required
              rows={2}
              className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 transition resize-none placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="Author / Name"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-primary/50 transition"
              />
            </div>
            <div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MotivationalQuote['category'])}
                className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-primary/50 transition"
              >
                <option value="discipline">Discipline</option>
                <option value="calisthenics">Calisthenics</option>
                <option value="football">Football</option>
                <option value="consistency">Consistency</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow-sm"
          >
            <Plus size={14} />
            <span>Save to Mantra Vault</span>
          </button>
        </form>
      </div>

      {/* Quotes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-display">
          Mantra Library ({quotes.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-border bg-[#0e131b] hover:border-white/20 transition flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-primary">
                    {q.category}
                  </span>
                  <Quote size={13} className="text-muted-foreground opacity-60" />
                </div>
                <blockquote className="text-xs font-medium text-white italic leading-relaxed">
                  "{q.text}"
                </blockquote>
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold">
                &mdash; {q.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
