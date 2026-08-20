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
    <header className="app-header pb-2 mb-1">
      {/* Top App Bar: Brand + Quick Actions */}
      <div className="flex items-center justify-between gap-3 pb-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-wide leading-tight text-main">
              EVERYTHING APP
            </h1>
            <span className="text-[10px] font-bold text-sub tracking-wider uppercase">
              Performance & Fitness Hub
            </span>
          </div>
        </div>

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
