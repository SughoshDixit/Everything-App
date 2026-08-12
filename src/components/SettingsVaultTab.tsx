import React, { useState } from 'react';
import type { MotivationalQuote } from '../types';
import { Smartphone, Plus, ChevronDown, ChevronUp } from 'lucide-react';

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
    alert('Quote added!');
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* PWA Install - Collapsed */}
      <div className="glass-card card-stagger card-hover-lift" style={{ animationDelay: '0s' }}>
        <button
          className={`toggle-details-btn ${showInstallGuide ? 'active' : ''}`}
          onClick={() => setShowInstallGuide(!showInstallGuide)}
          style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
        >
          <Smartphone size={14} />
          {showInstallGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          📱 Install Guide
        </button>
        {showInstallGuide && (
          <div className="collapsible-content" style={{ marginTop: '0.75rem' }}>
            <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Open in Chrome → your hosted URL</li>
              <li>Tap ⋮ → "Add to Home screen"</li>
              <li>Launch from home screen icon</li>
            </ol>
          </div>
        )}
      </div>

      {/* Add Quote Form - Compact */}
      <div className="glass-card card-stagger card-hover-lift" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleCreateQuote}>
          <div className="form-group">
            <textarea
              placeholder="Your quote or mantra..."
              value={newQuoteText}
              onChange={(e) => setNewQuoteText(e.target.value)}
              required
              rows={2}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div className="form-row" style={{ marginTop: '0.5rem' }}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Author"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>
            <div className="form-group">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MotivationalQuote['category'])}
                style={{ fontSize: '0.82rem' }}
              >
                <option value="discipline">Discipline</option>
                <option value="calisthenics">Calisthenics</option>
                <option value="football">Football</option>
                <option value="consistency">Consistency</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-2" style={{ width: '100%' }}>
            <Plus className="icon-sm" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Quotes Grid */}
      <div className="quotes-grid">
        {quotes.map((q, idx) => (
          <div
            key={q.id}
            className="quote-card glass-card card-stagger card-hover-lift"
            style={{ animationDelay: `${(idx + 2) * 0.08}s` }}
          >
            <div className="quote-cat-tag">{q.category.toUpperCase()}</div>
            <blockquote className="quote-body" style={{ fontSize: '0.85rem' }}>"{q.text}"</blockquote>
            <div className="quote-by" style={{ fontSize: '0.7rem' }}>&mdash; {q.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
