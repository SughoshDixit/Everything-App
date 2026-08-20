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
    <header className="app-header pb-2">
      {/* Top Main Bar: Brand & High-Visibility Actions */}
      <div className="flex items-center justify-between gap-2 pb-2">
        {/* Brand */}
        <div className="brand flex items-center gap-2">
          <div className="brand-logo animate-breathe flex items-center justify-center p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <ShieldCheck className="icon-shield text-cyan-400" size={22} />
          </div>
          <div>
            <h1 className="brand-title text-base md:text-lg font-black tracking-wider text-main leading-tight">
              EVERYTHING APP
            </h1>
          </div>
        </div>

        {/* Right Actions: High-Visibility Theme Toggle & Streak Badge */}
        <div className="flex items-center gap-2">
          {/* Prominent High-Visibility Theme Switcher Pill */}
          <button
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer border ${
              theme === 'dark'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 hover:border-amber-400'
                : 'bg-indigo-900/10 text-indigo-900 border-indigo-300 hover:bg-indigo-900/20'
            }`}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} className="text-amber-400 animate-spin-slow" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Streak pill with pulse */}
          <div className="streak-badge pulse-glow flex items-center gap-1 py-1.5 px-2.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Flame size={15} className="text-rose-500" />
            <span className="streak-num font-black text-xs">{activeStreak}</span>
            <span className="text-[10px] opacity-75 font-semibold">d</span>
          </div>
        </div>
      </div>

      {/* Row 2: Clean Persona Switcher & Mini Discipline Ticker */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-glass">
        {/* Persona Switcher Tabs */}
        <div className="persona-selector flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-glass">
          <button
            className={`persona-btn text-xs py-1 px-3 rounded-full transition-all flex items-center gap-1 font-bold ${
              currentProfile === 'men'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-sub hover:text-white'
            }`}
            onClick={() => onSelectProfile('men')}
          >
            <User size={13} />
            <span>Men</span>
          </button>
          <button
            className={`persona-btn text-xs py-1 px-3 rounded-full transition-all flex items-center gap-1 font-bold ${
              currentProfile === 'women'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-sub hover:text-white'
            }`}
            onClick={() => onSelectProfile('women')}
          >
            <Heart size={13} />
            <span>Women</span>
          </button>
          <button
            className={`persona-btn text-xs py-1 px-3 rounded-full transition-all flex items-center gap-1 font-bold ${
              currentProfile === 'couple'
                ? 'bg-violet-500 text-white shadow-md'
                : 'text-sub hover:text-white'
            }`}
            onClick={() => onSelectProfile('couple')}
          >
            <Users size={13} />
            <span>Both</span>
          </button>
        </div>

        {/* Discipline Ticker */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-sub px-3 py-1 rounded-full bg-slate-900/40 border border-glass">
          <Zap size={12} className="text-amber-400" />
          <span className="tracking-widest">DISCIPLINE · CONSISTENCY</span>
        </div>
      </div>
    </header>
  );
};
