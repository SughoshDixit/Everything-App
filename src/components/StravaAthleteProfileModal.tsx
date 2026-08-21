import React, { useState } from 'react';
import type { UserProfile, StravaGearItem, StravaMonthlyChallenge, PersonalMilestones } from '../types';
import {
  X,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface StravaAthleteProfileModalProps {
  currentProfile: UserProfile;
  onClose: () => void;
  milestones?: PersonalMilestones;
}

export const StravaAthleteProfileModal: React.FC<StravaAthleteProfileModalProps> = ({
  currentProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'prs' | 'challenges' | 'gear'>('heatmap');

  const athleteName = currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit';
  const athleteAvatar = currentProfile === 'women' ? '👩' : '👨';
  const athleteHandle = currentProfile === 'women' ? '@shreyadixit' : '@sughoshdixit';

  // Monthly Challenges
  const challenges: StravaMonthlyChallenge[] = [
    {
      id: 'c1',
      title: 'August 50km Running Quest',
      sport: 'run',
      targetValue: 50,
      currentValue: 34.2,
      unit: 'km',
      month: 'August 2026',
      isCompleted: false,
      badgeIcon: '🏃',
      color: '#55198B'
    },
    {
      id: 'c2',
      title: '1,000 Push-ups Calisthenics Mastery',
      sport: 'calisthenics',
      targetValue: 1000,
      currentValue: 1000,
      unit: 'reps',
      month: 'August 2026',
      isCompleted: true,
      badgeIcon: '💪',
      color: '#10B981'
    },
    {
      id: 'c3',
      title: '100km Gran Fondo Cycling',
      sport: 'cycle',
      targetValue: 100,
      currentValue: 62.5,
      unit: 'km',
      month: 'August 2026',
      isCompleted: false,
      badgeIcon: '🚴',
      color: '#F59E0B'
    }
  ];

  // Gear Items
  const [gearList] = useState<StravaGearItem[]>([
    {
      id: 'g1',
      name: 'Nike Pegasus 40 Road Runners',
      type: 'shoes',
      brand: 'Nike',
      model: 'Pegasus 40',
      totalDistanceKm: 184.5,
      maxDistanceKm: 600,
      isDefault: true
    },
    {
      id: 'g2',
      name: 'Puma Velocity Nitro 2',
      type: 'shoes',
      brand: 'Puma',
      model: 'Velocity Nitro',
      totalDistanceKm: 42.0,
      maxDistanceKm: 500,
      isDefault: false
    },
    {
      id: 'g3',
      name: 'Trek Domane SL 6 Road Bike',
      type: 'bike',
      brand: 'Trek',
      model: 'Domane SL 6',
      totalDistanceKm: 680.0,
      maxDistanceKm: 5000,
      isDefault: true
    }
  ]);

  // Generate 52-week mock heatmap data (7 days x 16 visible weeks on mobile)
  const weeks = Array.from({ length: 18 }, (_, weekIdx) => {
    return Array.from({ length: 7 }, (_, dayIdx) => {
      const isWorkout = (weekIdx * 7 + dayIdx) % 3 === 0 || (weekIdx * 7 + dayIdx) % 5 === 0;
      const intensity = isWorkout ? ((weekIdx + dayIdx) % 4) + 1 : 0;
      return { dayIdx, intensity };
    });
  });

  return (
    <div className="modal-backdrop z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="google-card w-full max-w-2xl bg-white dark:bg-[#141820] border border-black/10 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden my-auto animate-scale-up">
        {/* Header Profile Banner */}
        <div className="p-5 bg-gradient-to-r from-[#55198B] to-[#7b29be] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-white text-[#55198B] flex items-center justify-center text-3xl font-black shadow-lg border-2 border-white/40">
              {athleteAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{athleteName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  Verified Pro
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">{athleteHandle} &bull; Bengaluru, India 🇮🇳</p>
              <p className="text-[11px] text-white/90 mt-1 italic font-medium">
                "Data Science by day &bull; Calisthenics &amp; Football Winger by evening &bull; Unstoppable consistency"
              </p>
            </div>
          </div>

          {/* Social Stats Strip */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/20 text-xs">
            <div>
              <span className="font-bold text-white font-mono">148</span>{' '}
              <span className="text-white/70">Activities</span>
            </div>
            <div>
              <span className="font-bold text-white font-mono">1.2k</span>{' '}
              <span className="text-white/70">Kudos Received</span>
            </div>
            <div>
              <span className="font-bold text-white font-mono">34</span>{' '}
              <span className="text-white/70">Trophies &amp; PRs</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-glass bg-slate-100 dark:bg-[#181c26] px-4">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'heatmap'
                ? 'border-[#55198B] text-[#55198B] dark:text-[#c084fc]'
                : 'border-transparent text-sub hover:text-main'
            }`}
          >
            Training Log
          </button>
          <button
            onClick={() => setActiveTab('prs')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'prs'
                ? 'border-[#55198B] text-[#55198B] dark:text-[#c084fc]'
                : 'border-transparent text-sub hover:text-main'
            }`}
          >
            All-Time PRs 🏆
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'challenges'
                ? 'border-[#55198B] text-[#55198B] dark:text-[#c084fc]'
                : 'border-transparent text-sub hover:text-main'
            }`}
          >
            Trophy Case ({challenges.filter(c => c.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('gear')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'gear'
                ? 'border-[#55198B] text-[#55198B] dark:text-[#c084fc]'
                : 'border-transparent text-sub hover:text-main'
            }`}
          >
            Gear Tracker
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 52-WEEK HEATMAP TRAINING LOG */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#55198B] dark:text-[#c084fc]" />
                  <span>Activity Consistency Heatmap (2026)</span>
                </h3>
                <span className="text-xs text-sub font-mono">148 Active Days</span>
              </div>

              {/* Heatmap Grid */}
              <div className="p-4 rounded-2xl bg-card border border-glass overflow-x-auto">
                <div className="flex gap-1 min-w-[340px]">
                  {weeks.map((w, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {w.map((d, dIdx) => (
                        <div
                          key={dIdx}
                          className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 ${
                            d.intensity === 0
                              ? 'bg-slate-200 dark:bg-slate-800'
                              : d.intensity === 1
                              ? 'bg-purple-300 dark:bg-purple-900/60'
                              : d.intensity === 2
                              ? 'bg-purple-500'
                              : d.intensity === 3
                              ? 'bg-[#55198B]'
                              : 'bg-amber-400 shadow-xs'
                          }`}
                          title={`Week ${wIdx + 1}, Day ${dIdx + 1}: ${d.intensity > 0 ? `${d.intensity * 3}km workout` : 'Rest Day'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-sub pt-3 mt-2 border-t border-glass">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-purple-300 dark:bg-purple-900/60"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-purple-500"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-[#55198B]"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-amber-400"></div>
                  </div>
                  <span>More active</span>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: BEST EFFORTS & ALL-TIME PRS */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'prs' && (
            <div className="space-y-4">
              {/* Running PRs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                  <span>🏃 Running Best Efforts</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">1K PR</div>
                    <div className="text-base font-black text-main font-mono mt-0.5">4:05</div>
                    <div className="text-[9px] text-amber-500 font-bold">🥇 Gold Effort</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">5K PR</div>
                    <div className="text-base font-black text-main font-mono mt-0.5">23:40</div>
                    <div className="text-[9px] text-amber-500 font-bold">🥇 Gold Effort</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">10K PR</div>
                    <div className="text-base font-black text-main font-mono mt-0.5">51:12</div>
                    <div className="text-[9px] text-slate-400 font-bold">🥈 Silver Effort</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">Longest Run</div>
                    <div className="text-base font-black text-main font-mono mt-0.5">14.2 km</div>
                    <div className="text-[9px] text-emerald-500 font-bold">🏅 Lifetime Max</div>
                  </div>
                </div>
              </div>

              {/* Calisthenics PRs */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                  <span>💪 Calisthenics Mastery PRs</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">Max Push-ups</div>
                    <div className="text-base font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">38 Reps</div>
                    <div className="text-[9px] text-emerald-500 font-bold">Strict Form</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">Max Pull-ups</div>
                    <div className="text-base font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">12 Reps</div>
                    <div className="text-[9px] text-emerald-500 font-bold">Deadhang</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">Parallel Dips</div>
                    <div className="text-base font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">22 Reps</div>
                    <div className="text-[9px] text-emerald-500 font-bold">Deep ROM</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-glass text-center">
                    <div className="text-[10px] text-sub font-bold uppercase">Plank Hold</div>
                    <div className="text-base font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">3m 15s</div>
                    <div className="text-[9px] text-amber-500 font-bold">Hollow Body</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: TROPHY CASE & MONTHLY QUESTS */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'challenges' && (
            <div className="space-y-3">
              {challenges.map((c) => {
                const progressPct = Math.min(100, Math.round((c.currentValue / c.targetValue) * 100));

                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
                      c.isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-card border-glass'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-xs">
                          {c.badgeIcon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-main">{c.title}</h4>
                          <p className="text-[11px] text-sub">{c.month}</p>
                        </div>
                      </div>

                      {c.isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-bold font-mono text-[#55198B] dark:text-[#c084fc]">
                          {c.currentValue} / {c.targetValue} {c.unit}
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: c.isCompleted ? '#10B981' : '#55198B'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 4: GEAR TRACKER */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'gear' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sub">
                  Footwear &amp; Equipment Mileage
                </h4>
              </div>

              <div className="space-y-3">
                {gearList.map((g) => {
                  const gearPct = Math.min(100, Math.round((g.totalDistanceKm / g.maxDistanceKm) * 100));

                  return (
                    <div key={g.id} className="p-4 rounded-2xl bg-card border border-glass space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{g.type === 'shoes' ? '👟' : '🚴'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-main">{g.name}</h5>
                              {g.isDefault && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-[#55198B] dark:text-[#c084fc] uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-sub">{g.brand} {g.model}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-main">
                            {g.totalDistanceKm.toFixed(1)} <span className="text-sub font-normal">/ {g.maxDistanceKm} km</span>
                          </div>
                          <div className="text-[10px] text-sub">{g.maxDistanceKm - g.totalDistanceKm} km remaining</div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#55198B] to-[#7b29be] rounded-full"
                          style={{ width: `${gearPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
