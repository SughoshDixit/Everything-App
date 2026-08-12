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
    { id: 'routine', label: 'Daily Timetable & Habits', icon: CalendarDays },
    { id: 'calisthenics', label: 'Calisthenics Module', icon: Dumbbell },
    { id: 'football', label: 'Football Winger', icon: Trophy },
    { id: 'nutrition', label: 'Nutrition & Recovery', icon: Utensils },
    { id: 'music_veda', label: 'Music & Vedas', icon: Music },
    { id: 'settings', label: 'Settings & Vault', icon: Sliders }
  ];

  return (
    <nav className="app-nav">
      <div className="nav-container">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(t.id as TabType)}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
