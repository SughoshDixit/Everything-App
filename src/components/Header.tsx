import React, { useState, useEffect } from 'react';
import type { UserProfile, UserStats } from '../types';
import { Flame, User, Users, Heart, Zap, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  stats: UserStats;
  onNavigateTab?: (tab: 'sughoshdixit') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onSelectProfile,
  stats,
  onNavigateTab
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
    <header className="app-header pb-2 mb-1">
      {/* Top App Bar: Brand + Quick Actions */}
      <div className="flex items-center justify-between gap-3 pb-2.5">
        {/* Brand: Sughosh Dixit & Everything App */}
        <button
          onClick={() => onNavigateTab?.('sughoshdixit')}
          className="flex items-center gap-2.5 text-left group cursor-pointer hover:opacity-90 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#55198b] to-[#007acc] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-md group-hover:scale-105 transition-transform">
            SD
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight leading-tight text-main group-hover:text-[#00e5ff] transition-colors">
              Sughosh Dixit
            </h1>
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block">
              Everything App &bull; Ecosystem
            </span>
          </div>
        </button>

        {/* Right Actions: Theme Toggle Circle & Streak Pill */}
        <div className="flex items-center gap-2">
          {/* Material 3 Circular Theme Switcher */}
          <button
            className="btn-google-icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-indigo-600" />
            )}
          </button>

          {/* Google Fit Streak Pill */}
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-sm">
            <Flame size={16} className="text-amber-500" />
            <span className="font-mono font-black text-xs">{activeStreak}</span>
            <span className="text-[10px] font-bold opacity-80">days</span>
          </div>
        </div>
      </div>

      {/* Row 2: Google Material 3 Segmented Persona Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-glass">
        <div className="persona-selector">
          <button
            className={`persona-btn ${currentProfile === 'men' ? 'active' : ''}`}
            onClick={() => onSelectProfile('men')}
          >
            <User size={14} />
            <span>Men</span>
          </button>
          <button
            className={`persona-btn ${currentProfile === 'women' ? 'active' : ''}`}
            onClick={() => onSelectProfile('women')}
          >
            <Heart size={14} />
            <span>Women</span>
          </button>
          <button
            className={`persona-btn ${currentProfile === 'couple' ? 'active' : ''}`}
            onClick={() => onSelectProfile('couple')}
          >
            <Users size={14} />
            <span>Both</span>
          </button>
        </div>

        {/* Compact Discipline Ticker */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-sub px-3 py-1 rounded-full bg-card border border-glass">
          <Zap size={12} className="text-amber-500" />
          <span className="tracking-widest">DISCIPLINE · CONSISTENCY</span>
        </div>
      </div>
    </header>
  );
};
