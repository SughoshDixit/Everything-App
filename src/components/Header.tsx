import React from 'react';
import type { UserProfile, UserStats } from '../types';
import { Flame, User, Users, ShieldCheck, Heart, Zap } from 'lucide-react';

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
  const activeStreak =
    currentProfile === 'men'
      ? stats.menStreak
      : currentProfile === 'women'
      ? stats.womenStreak
      : stats.coupleStreak;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <div className="brand-logo">
            <ShieldCheck className="icon-shield" />
          </div>
          <div>
            <h1 className="brand-title">EVERYTHING APP</h1>
            <div className="brand-subtitle">
              <span>ALL-IN-ONE PERFORMANCE & DISCIPLINE APP</span>
            </div>
          </div>
        </div>

        {/* Global Immersed Discipline Motto Ticker */}
        <div className="global-discipline-ticker glass-card">
          <Zap className="icon-xs text-amber inline mr-1" />
          <span className="ticker-text">
            <strong>IMMERSING SELF-DISCIPLINE:</strong> Consistency &gt; Adrenaline &bull; Action Creates Motivation
          </span>
        </div>

        <div className="header-right">
          {/* Streak pill */}
          <div className="streak-badge">
            <Flame className="icon-flame" />
            <div>
              <div className="streak-num">{activeStreak} Days</div>
              <div className="streak-label">Unbroken Consistency</div>
            </div>
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
              <span>Couples</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
