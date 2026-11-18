import React from 'react';
import {
  Compass,
  Zap,
  Heart,
  ShieldCheck,
  Plus
} from 'lucide-react';

export type TabType =
  | 'today'
  | 'train'
  | 'progress'
  | 'vault'
  | 'fithub'
  | 'feed'
  | 'calisthenics'
  | 'routine'
  | 'football'
  | 'nutrition'
  | 'sughoshdixit'
  | 'period'
  | 'music_veda'
  | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickAction?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onQuickAction }) => {
  const isToday = activeTab === 'today' || activeTab === 'routine';
  const isTrain = activeTab === 'train' || activeTab === 'calisthenics' || activeTab === 'football';
  const isProgress = activeTab === 'progress' || activeTab === 'fithub' || activeTab === 'feed' || activeTab === 'sughoshdixit';
  const isVault = activeTab === 'vault' || activeTab === 'nutrition' || activeTab === 'period' || activeTab === 'music_veda' || activeTab === 'settings';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-white/10 bg-[#0b0e14]/95 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl">
      {/* 1. Today */}
      <button
        onClick={() => onTabChange('today')}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all ${
          isToday ? 'text-primary font-bold' : 'text-muted-foreground hover:text-white'
        }`}
      >
        <Compass size={20} strokeWidth={isToday ? 2.5 : 1.7} />
        <span>Today</span>
      </button>

      {/* 2. Train */}
      <button
        onClick={() => onTabChange('train')}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all ${
          isTrain ? 'text-primary font-bold' : 'text-muted-foreground hover:text-white'
        }`}
      >
        <Zap size={20} strokeWidth={isTrain ? 2.5 : 1.7} />
        <span>Train</span>
      </button>

      {/* ⚡ CENTER ACTION FAB: + Log / Start Activity */}
      {onQuickAction && (
        <div className="flex items-center justify-center px-2">
          <button
            type="button"
            onClick={onQuickAction}
            className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#FC5200] to-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/25 hover:scale-105 active:scale-95 transition-all border-2 border-[#0b0e14] cursor-pointer shrink-0"
            title="Log Activity or Launch GPS"
            aria-label="Quick Action Hub"
          >
            <Plus size={24} strokeWidth={3} className="text-black" />
          </button>
        </div>
      )}

      {/* 3. Progress */}
      <button
        onClick={() => onTabChange('progress')}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all ${
          isProgress ? 'text-primary font-bold' : 'text-muted-foreground hover:text-white'
        }`}
      >
        <Heart size={20} strokeWidth={isProgress ? 2.5 : 1.7} />
        <span>Progress</span>
      </button>

      {/* 4. Vault */}
      <button
        onClick={() => onTabChange('vault')}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all ${
          isVault ? 'text-[#c084fc] font-bold' : 'text-muted-foreground hover:text-white'
        }`}
      >
        <ShieldCheck size={20} strokeWidth={isVault ? 2.5 : 1.7} />
        <span>Vault</span>
      </button>
    </nav>
  );
};
