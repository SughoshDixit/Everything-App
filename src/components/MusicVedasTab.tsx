import React, { useState } from 'react';
import type { CarnaticYouTubeItem, InstrumentSong, VedaSukta } from '../types';
import { Music, Guitar, BookOpen, Play, Pause } from 'lucide-react';

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

  // Practice Timer
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

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

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero */}
      <div className="music-hero glass-card">
        <div className="badge-pill bg-violet">ARTISTIC & SPIRITUAL MASTERY</div>
        <h2>Carnatic Classical, Instrument Songs & Vedas</h2>
        <p>
          Nurturing your voice, classical heritage, YouTube music production, and sacred Veda recitations.
        </p>
      </div>

      {/* Sub Tab Buttons */}
      <div className="subtab-bar">
        <button
          className={`subtab-btn ${activeSubTab === 'carnatic' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('carnatic')}
        >
          <Music className="icon-xs" />
          <span>Carnatic & YouTube Studio</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'instruments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('instruments')}
        >
          <Guitar className="icon-xs" />
          <span>Ukulele & Guitar Sing-Along</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'vedas' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vedas')}
        >
          <BookOpen className="icon-xs" />
          <span>Veda Sukta Memorizer</span>
        </button>
      </div>

      {/* 1. CARNATIC CLASSICAL & YOUTUBE PIPELINE */}
      {activeSubTab === 'carnatic' && (
        <div className="subtab-content">
          {/* Practice Timer */}
          <div className="practice-timer-card glass-card">
            <div className="timer-header">
              <h3>Abhyasa (Practice) Session Timer</h3>
              <span className="badge-pill bg-violet">VOCAL & RAGA</span>
            </div>
            <div className="timer-clock">{formatTime(practiceSeconds)}</div>
            <button
              className={`btn-primary btn-large ${isPracticing ? 'bg-rose' : ''}`}
              onClick={togglePracticeTimer}
            >
              {isPracticing ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
              <span>{isPracticing ? 'Pause Abhyasa' : 'Start Practice Session'}</span>
            </button>
          </div>

          {/* YouTube Video Pipeline */}
          <div className="pipeline-section mt-4">
            <div className="section-header">
              <h3>YouTube Cover & Music Production Pipeline</h3>
            </div>
            <div className="items-list">
              {carnaticItems.map((item) => (
                <div key={item.id} className="pipeline-card glass-card">
                  <div className="card-top">
                    <div>
                      <span className="badge-pill bg-violet">Raga {item.raga}</span>
                      <h4 className="kriti-title">{item.kritiName}</h4>
                      <div className="composer-name">Composer: {item.composer}</div>
                    </div>
                    <span className="status-tag">{item.status}</span>
                  </div>
                  <p className="notes-text">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. UKULELE & GUITAR */}
      {activeSubTab === 'instruments' && (
        <div className="subtab-content">
          <div className="section-header">
            <h3>Sing-Along & Performance Repertoire</h3>
            <p>Ready to play whenever and wherever asked!</p>
          </div>
          <div className="songs-grid">
            {instrumentSongs.map((song) => (
              <div key={song.id} className="song-card glass-card">
                <div className="song-header">
                  <span className="badge-pill bg-amber">{song.instrument}</span>
                  <span className="status-tag">{song.status}</span>
                </div>
                <h4 className="song-title">{song.title}</h4>
                <div className="genre-tag">Genre: {song.genre} &bull; {song.difficulty}</div>

                <div className="chords-box mt-3">
                  <span className="chords-lbl">Chords:</span>
                  <div className="chords-list">
                    {song.chords.map((c, idx) => (
                      <span key={idx} className="chord-pill">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VEDA SUKTAS */}
      {activeSubTab === 'vedas' && (
        <div className="subtab-content">
          <div className="section-header">
            <h3>Veda Suktas & Svara Accents Memorizer</h3>
          </div>
          <div className="suktas-grid">
            {vedaSuktas.map((sukta) => {
              const pct = Math.round((sukta.memorizedVerses / sukta.totalVerses) * 100);
              return (
                <div key={sukta.id} className="sukta-card glass-card">
                  <div className="sukta-header">
                    <BookOpen className="icon-sm text-green" />
                    <h4>{sukta.name}</h4>
                  </div>
                  <div className="transliteration">"{sukta.transliteration}"</div>

                  <div className="verse-stat mt-3">
                    <span>Memorized: {sukta.memorizedVerses} / {sukta.totalVerses} Verses</span>
                    <span className="text-emerald font-bold">{pct}%</span>
                  </div>

                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill bg-emerald"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="sukta-notes mt-2">{sukta.notes}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
