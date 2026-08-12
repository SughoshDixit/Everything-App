import React, { useState } from 'react';
import type { CarnaticYouTubeItem, InstrumentSong, VedaSukta } from '../types';
import { Music, Guitar, BookOpen, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

interface MusicVedasTabProps {
  carnaticItems: CarnaticYouTubeItem[];
  instrumentSongs: InstrumentSong[];
  vedaSuktas: VedaSukta[];
}

export const MusicVedasTab: React.FC<MusicVedasTabProps> = ({
  carnaticItems,
  instrumentSongs,
  vedaSuktas
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'carnatic' | 'instruments' | 'vedas'>('carnatic');
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const togglePracticeTimer = () => {
    if (isPracticing) {
      if (timerRef) clearInterval(timerRef);
      setIsPracticing(false);
    } else {
      setIsPracticing(true);
      const interval = setInterval(() => {
        setPracticeSeconds((prev) => prev + 1);
      }, 1000);
      setTimerRef(interval);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Sub Tab Buttons */}
      <div className="subtab-bar">
        <button
          className={`subtab-btn ${activeSubTab === 'carnatic' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('carnatic')}
        >
          <Music className="icon-xs" />
          <span>🎶 Carnatic</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'instruments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('instruments')}
        >
          <Guitar className="icon-xs" />
          <span>🎸 Strings</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'vedas' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vedas')}
        >
          <BookOpen className="icon-xs" />
          <span>📿 Vedas</span>
        </button>
      </div>

      {/* 1. CARNATIC */}
      {activeSubTab === 'carnatic' && (
        <div className="subtab-content">
          {/* Practice Timer - Visual Only */}
          <div className="practice-timer-card glass-card card-hover-lift" style={{ textAlign: 'center' }}>
            <div className="timer-clock number-pop" style={{ fontSize: '3rem' }}>{formatTime(practiceSeconds)}</div>
            <button
              className={`btn-primary btn-large ${isPracticing ? 'bg-rose' : ''}`}
              onClick={togglePracticeTimer}
              style={{ marginTop: '0.75rem' }}
            >
              {isPracticing ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
              <span>{isPracticing ? 'Pause' : 'Practice'}</span>
            </button>
          </div>

          {/* Pipeline Cards */}
          <div className="items-list" style={{ marginTop: '1rem' }}>
            {carnaticItems.map((item, idx) => (
              <div
                key={item.id}
                className="pipeline-card glass-card card-stagger card-hover-lift"
                style={{ animationDelay: `${idx * 0.1}s`, marginBottom: '0.75rem' }}
              >
                <div className="card-top">
                  <div>
                    <span className="badge-pill bg-violet">{item.raga}</span>
                    <h4 className="kriti-title" style={{ marginTop: '0.25rem' }}>{item.kritiName}</h4>
                  </div>
                  <span className="status-tag">{item.status}</span>
                </div>
                <button
                  className={`toggle-details-btn ${expandedId === item.id ? 'active' : ''}`}
                  onClick={() => toggleExpand(item.id)}
                  style={{ marginTop: '0.5rem' }}
                >
                  {expandedId === item.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  📝 Notes
                </button>
                {expandedId === item.id && (
                  <div className="collapsible-content">
                    <div><strong>Composer:</strong> {item.composer}</div>
                    <div style={{ marginTop: '0.25rem' }}>{item.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. INSTRUMENTS */}
      {activeSubTab === 'instruments' && (
        <div className="subtab-content">
          <div className="songs-grid">
            {instrumentSongs.map((song, idx) => (
              <div
                key={song.id}
                className="song-card glass-card card-stagger card-hover-lift"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="song-header">
                  <span className="badge-pill bg-amber">{song.instrument}</span>
                  <span className="status-tag">{song.status}</span>
                </div>
                <h4 className="song-title">{song.title}</h4>
                <div className="chords-box mt-2">
                  <div className="chords-list">
                    {song.chords.map((c, i) => (
                      <span key={i} className="chord-pill">{c}</span>
                    ))}
                  </div>
                </div>
                <button
                  className={`toggle-details-btn ${expandedId === song.id ? 'active' : ''}`}
                  onClick={() => toggleExpand(song.id)}
                  style={{ marginTop: '0.5rem' }}
                >
                  {expandedId === song.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  ℹ️ Details
                </button>
                {expandedId === song.id && (
                  <div className="collapsible-content">
                    {song.genre} · {song.difficulty}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VEDAS */}
      {activeSubTab === 'vedas' && (
        <div className="subtab-content">
          <div className="suktas-grid">
            {vedaSuktas.map((sukta, idx) => {
              const pct = Math.round((sukta.memorizedVerses / sukta.totalVerses) * 100);
              return (
                <div
                  key={sukta.id}
                  className="sukta-card glass-card card-stagger card-hover-lift"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="sukta-header">
                    <BookOpen className="icon-sm text-green" />
                    <h4>{sukta.name}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div className="progress-bar-wrap progress-animated" style={{ flex: 1 }}>
                      <div
                        className="progress-bar-fill bg-emerald"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-emerald font-bold number-pop">{pct}%</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {sukta.memorizedVerses}/{sukta.totalVerses} verses
                  </div>

                  <button
                    className={`toggle-details-btn ${expandedId === sukta.id ? 'active' : ''}`}
                    onClick={() => toggleExpand(sukta.id)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {expandedId === sukta.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    📖 View
                  </button>
                  {expandedId === sukta.id && (
                    <div className="collapsible-content">
                      <div style={{ fontStyle: 'italic' }}>"{sukta.transliteration}"</div>
                      <div style={{ marginTop: '0.25rem' }}>{sukta.notes}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
