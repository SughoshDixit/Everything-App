import React from 'react';
import {
  Activity,
  CalendarDays,
  Dumbbell,
  Trophy,
  Utensils,
  Heart,
  Music,
  Sliders
} from 'lucide-react';

export type TabType = 'fithub' | 'routine' | 'calisthenics' | 'football' | 'nutrition' | 'period' | 'music_veda' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'fithub', label: '📊 Fit Hub', icon: Activity },
    { id: 'calisthenics', label: '💪 Calisthenics', icon: Dumbbell },
    { id: 'routine', label: '📅 Routine', icon: CalendarDays },
    { id: 'football', label: '⚽ Football', icon: Trophy },
    { id: 'nutrition', label: '🥗 Nutrition', icon: Utensils },
    { id: 'period', label: '🌸 Cycle', icon: Heart },
    { id: 'music_veda', label: '🎵 Music', icon: Music },
    { id: 'settings', label: '⚙️ Settings', icon: Sliders }
  ];

  return (
    <>
      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 5px rgba(6,182,212,0.3); } 50% { box-shadow: 0 0 20px rgba(6,182,212,0.6); } }
        .nav-item-animated {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item-animated:hover {
          transform: translateY(-2px) scale(1.03);
        }
        .nav-active-animated {
          animation: slideInRight 0.3s ease-out, pulseGlow 2s infinite;
        }
      `}</style>
      <nav className="app-nav">
        <div className="nav-container">
          {tabs.map((t, index) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                className={`nav-item nav-item-animated ${isActive ? 'active nav-active-animated' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onTabChange(t.id as TabType)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
