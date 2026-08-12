import React, { useState } from 'react';
import type { MotivationalQuote } from '../types';
import { Smartphone, Plus } from 'lucide-react';

interface SettingsVaultTabProps {
  quotes: MotivationalQuote[];
  onAddQuote: (quote: Omit<MotivationalQuote, 'id'>) => void;
}

export const SettingsVaultTab: React.FC<SettingsVaultTabProps> = ({ quotes, onAddQuote }) => {
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newAuthor, setNewAuthor] = useState('Athlete');
  const [newCategory, setNewCategory] = useState<MotivationalQuote['category']>('discipline');

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
    alert('Custom Quote added to your daily Motivational Vault!');
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero */}
      <div className="settings-hero glass-card">
        <div className="badge-pill bg-cyan">APP SETTINGS & PWA VAULT</div>
        <h2>PWA Installation & Motivational Vault</h2>
        <p>
          Configure your Progressive Web App for Android home screen installation and manage custom discipline quotes.
        </p>
      </div>

      {/* PWA Installation Card */}
      <div className="pwa-card glass-card">
        <div className="pwa-header">
          <Smartphone className="icon-md text-cyan" />
          <div>
            <h3>Install on Android Device (sughoshkishreya.space)</h3>
            <p className="subtext">Get a native app experience on your phone without app store installs!</p>
          </div>
        </div>

        <ol className="pwa-steps">
          <li>
            <strong>1. Open in Chrome on Android:</strong> Navigate to <code>https://sughoshkishreya.space</code>
          </li>
          <li>
            <strong>2. Tap Menu (&vellip;):</strong> Select <em>"Add to Home screen"</em> or <em>"Install app"</em>.
          </li>
          <li>
            <strong>3. Launch Anytime:</strong> The app icon will appear on your home screen with offline timer & sound support!
          </li>
        </ol>
      </div>

      {/* Custom Quote Manager */}
      <div className="quotes-manager-section mt-4">
        <h3 className="section-title">Motivational Quote Vault</h3>

        {/* Add Quote Form */}
        <div className="add-quote-card glass-card mb-4">
          <h4>Add Personal Quote or Mantra</h4>
          <form onSubmit={handleCreateQuote} className="mt-3">
            <div className="form-group">
              <label>Quote Text</label>
              <textarea
                placeholder="e.g. Self-discipline is the bridge between goals and accomplishment."
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                required
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Author / Speaker</label>
                <input
                  type="text"
                  placeholder="e.g. Sughosh, Shreya, Marcus Aurelius"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MotivationalQuote['category'])}
                >
                  <option value="discipline">Self Discipline</option>
                  <option value="calisthenics">Calisthenics</option>
                  <option value="football">Football Mindset</option>
                  <option value="consistency">Consistency & Habit</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary mt-2">
              <Plus className="icon-sm" />
              <span>Add to Vault</span>
            </button>
          </form>
        </div>

        {/* Existing Quotes List */}
        <div className="quotes-grid">
          {quotes.map((q) => (
            <div key={q.id} className="quote-card glass-card">
              <div className="quote-cat-tag">{q.category.toUpperCase()}</div>
              <blockquote className="quote-body">"{q.text}"</blockquote>
              <div className="quote-by">&mdash; {q.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
