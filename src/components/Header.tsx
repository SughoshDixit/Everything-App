import React, { useState, useEffect } from 'react';
import type { UserProfile, UserStats } from '../types';
import { Flame, User, Users, ShieldCheck, Heart, Zap, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onSelectProfile,
  stats
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('everything_app_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('everything_app_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeStreak =
    currentProfile === 'men'
      ? stats.menStreak
      : currentProfile === 'women'
      ? stats.womenStreak
      : stats.coupleStreak;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand flex items-center gap-2">
          <div className="brand-logo animate-breathe">
            <ShieldCheck className="icon-shield text-cyan-400" />
          </div>
          <h1 className="brand-title text-lg font-black tracking-wider">EVERYTHING APP</h1>
        </div>

        {/* Compact Discipline Ticker */}
        <div className="global-discipline-ticker glass-card" style={{ padding: '0.3rem 0.75rem' }}>
          <Zap className="icon-xs text-amber" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-sub)' }}>
            DISCIPLINE · CONSISTENCY · ACTION
          </span>
        </div>

        <div className="header-right flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            className="p-2 rounded-full glass-card border border-slate-700 hover:border-cyan-400 text-sub hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
          </button>

          {/* Streak pill with pulse */}
          <div className="streak-badge pulse-glow">
            <Flame className="icon-flame" />
            <span className="streak-num number-pop">{activeStreak}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>days</span>
          </div>

          {/* Persona Switcher */}
          <div className="persona-selector">
            <button
              className={`persona-btn ${currentProfile === 'men' ? 'active' : ''}`}
              onClick={() => onSelectProfile('men')}
            >
              <User className="icon-sm" />
              <span>Men</span>
            </button>
            <button
              className={`persona-btn ${currentProfile === 'women' ? 'active' : ''}`}
              onClick={() => onSelectProfile('women')}
            >
              <Heart className="icon-sm" />
              <span>Women</span>
            </button>
            <button
              className={`persona-btn ${currentProfile === 'couple' ? 'active' : ''}`}
              onClick={() => onSelectProfile('couple')}
            >
              <Users className="icon-sm" />
              <span>Both</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
