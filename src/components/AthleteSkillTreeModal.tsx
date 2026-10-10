import React from 'react';
import {
  X,
  Zap,
  Activity,
  Flame,
  Trophy,
  Dumbbell,
} from 'lucide-react';

interface AthleteSkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  totalDistanceKm?: number;
  athleteName?: string;
}

export const AthleteSkillTreeModal: React.FC<AthleteSkillTreeModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  totalDistanceKm = 142.8,
  athleteName = 'Sughosh',
}) => {
  if (!isOpen) return null;

  // XP calculation
  const enduranceXp = Math.floor(totalDistanceKm * 25);
  const strengthXp = 1850;
  const explosivenessXp = 1400;
  const mindfulnessXp = streakCount * 90;
  const totalXp = enduranceXp + strengthXp + explosivenessXp + mindfulnessXp;

  // Level computation: e.g. Level 8
  const currentLevel = Math.max(1, Math.floor(totalXp / 1000));
  const currentTier =
    currentLevel >= 15
      ? 'Vedic Titan'
      : currentLevel >= 8
      ? 'Iron Spartan'
      : currentLevel >= 4
      ? 'Varsity Playmaker'
      : 'Rookie Strider';

  const nextLevelXp = (currentLevel + 1) * 1000;
  const currentLevelBaseXp = currentLevel * 1000;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.floor(((totalXp - currentLevelBaseXp) / 1000) * 100))
  );

  const pillars = [
    {
      title: 'Aerobic Endurance',
      subtitle: `${totalDistanceKm.toFixed(1)} km logged`,
      xp: enduranceXp,
      icon: <Activity size={18} className="text-[#FC5200]" />,
      color: 'from-[#FC5200]/20 to-[#FC5200]/5',
      borderColor: 'border-[#FC5200]/30',
      badge: 'Tier IV Runner',
    },
    {
      title: 'Upper Body Strength',
      subtitle: 'Push-up Ladders & Form',
      xp: strengthXp,
      icon: <Dumbbell size={18} className="text-[#CCFF00]" />,
      color: 'from-[#CCFF00]/20 to-[#CCFF00]/5',
      borderColor: 'border-[#CCFF00]/30',
      badge: 'Diamond Push-Up Master',
    },
    {
      title: 'Pitch Explosiveness',
      subtitle: 'Football Sprints & Agility',
      xp: explosivenessXp,
      icon: <Zap size={18} className="text-amber-400" />,
      color: 'from-amber-400/20 to-amber-400/5',
      borderColor: 'border-amber-400/30',
      badge: 'Matchday Playmaker',
    },
    {
      title: 'Vedic Mindfulness',
      subtitle: `${streakCount} Days Habit Adherence`,
      xp: mindfulnessXp,
      icon: <Flame size={18} className="text-purple-400" />,
      color: 'from-purple-400/20 to-purple-400/5',
      borderColor: 'border-purple-400/30',
      badge: 'Disciplined Mind',
    },
  ];

  const badges = [
    { name: '14-Day Streak', icon: '🔥', desc: 'Unbroken athletic discipline' },
    { name: 'Sub-4 1K Pace', icon: '⚡', desc: '3:52 /km speed barrier broken' },
    { name: 'Pitch Veteran', icon: '⚽', desc: '90-min full match stamina' },
    { name: 'Vedic Seeker', icon: '🕉️', desc: 'Sanskrit chanting mastered' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c1118] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FC5200] to-amber-400 text-white shadow-lg">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Athlete Skill Tree</h2>
              <p className="text-[11px] text-zinc-400">Progression & Discipline Tiers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Level Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#162130] via-[#1a273a] to-[#121a24] p-5 shadow-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#CCFF00]/15 blur-2xl" />

            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-[#CCFF00]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#CCFF00]">
                  Level {currentLevel} • {currentTier}
                </span>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white">
                  {athleteName}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total XP</p>
                <p className="text-lg font-black text-[#FC5200]">{totalXp.toLocaleString()} XP</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-zinc-300">
                <span>Progress to Level {currentLevel + 1}</span>
                <span>{progressPercent}% ({totalXp} / {nextLevelXp} XP)</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FC5200] to-[#CCFF00] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              The 4 Athletic Pillars
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className={`flex flex-col justify-between rounded-xl border ${pillar.borderColor} bg-gradient-to-b ${pillar.color} p-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40">
                      {pillar.icon}
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-zinc-300">
                      +{pillar.xp} XP
                    </span>
                  </div>

                  <div className="mt-3">
                    <h5 className="text-xs font-bold text-white">{pillar.title}</h5>
                    <p className="text-[10px] text-zinc-400">{pillar.subtitle}</p>
                    <span className="mt-2 inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-200">
                      {pillar.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked Achievements */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Discipline Badges
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {badges.map((b) => (
                <div
                  key={b.name}
                  className="flex flex-col items-center rounded-xl border border-white/10 bg-[#131b26] p-3 text-center transition hover:border-[#CCFF00]/40"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <p className="mt-1.5 text-[11px] font-bold text-white">{b.name}</p>
                  <p className="text-[9px] text-zinc-400 leading-tight mt-0.5">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AthleteSkillTreeModal;
