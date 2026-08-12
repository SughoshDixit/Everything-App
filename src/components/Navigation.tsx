import React from 'react';
import {
  CalendarDays,
  Dumbbell,
  Trophy,
  Utensils,
  Music,
  Sliders
} from 'lucide-react';

export type TabType = 'routine' | 'calisthenics' | 'football' | 'nutrition' | 'music_veda' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'routine', label: '📅 Routine', icon: CalendarDays },
    { id: 'calisthenics', label: '💪 Workout', icon: Dumbbell },
    { id: 'football', label: '⚽ Football', icon: Trophy },
    { id: 'nutrition', label: '🥗 Nutrition', icon: Utensils },
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
          transform: translateY(-2px) scale(1.05);
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
                style={{ animationDelay: `${index * 0.1}s` }}
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
