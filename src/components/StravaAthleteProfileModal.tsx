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
      title: 'Monthly 50km Running Quest',
      sport: 'run',
      targetValue: 50,
      currentValue: 34.2,
      unit: 'km',
      month: 'October 2026',
      isCompleted: false,
      badgeIcon: '🏃',
      color: '#fc4c02'
    },
    {
      id: 'c2',
      title: '1,000 Push-ups Calisthenics Mastery',
      sport: 'calisthenics',
      targetValue: 1000,
      currentValue: 1000,
      unit: 'reps',
      month: 'October 2026',
      isCompleted: true,
      badgeIcon: '💪',
      color: '#ccff00'
    },
    {
      id: 'c3',
      title: '100km Gran Fondo Cycling',
      sport: 'cycle',
      targetValue: 100,
      currentValue: 62.5,
      unit: 'km',
      month: 'October 2026',
      isCompleted: false,
      badgeIcon: '🚴',
      color: '#38bdf8'
    }
  ];

  // Gear List
  const [gearList] = useState<StravaGearItem[]>([
    {
      id: 'g1',
      name: 'Nike Pegasus Turbo 4',
      type: 'shoes',
      brand: 'Nike',
      model: 'Pegasus Turbo',
      totalDistanceKm: 184.5,
      maxDistanceKm: 650,
      isDefault: true
    },
    {
      id: 'g2',
      name: 'Puma Ultra Match Football Boots',
      type: 'shoes',
      brand: 'Puma',
      model: 'Ultra Match FG',
      totalDistanceKm: 42.0,
      maxDistanceKm: 300,
      isDefault: false
    },
    {
      id: 'g3',
      name: 'Trek Domane AL 3 Road Bike',
      type: 'bike',
      brand: 'Trek',
      model: 'Domane AL 3',
      totalDistanceKm: 210.8,
      maxDistanceKm: 2000,
      isDefault: true
    }
  ]);

  // Generate 52-week mock heatmap data
  const weeks = Array.from({ length: 18 }, (_, weekIdx) => {
    return Array.from({ length: 7 }, (_, dayIdx) => {
      const isWorkout = (weekIdx * 7 + dayIdx) % 3 === 0 || (weekIdx * 7 + dayIdx) % 5 === 0;
      const intensity = isWorkout ? ((weekIdx + dayIdx) % 4) + 1 : 0;
      return { dayIdx, intensity };
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-2xl bg-[#0e131b] border border-white/10 shadow-2xl rounded-3xl overflow-hidden my-auto animate-scale-up text-foreground">
        {/* Header Profile Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#121824] via-[#1a2232] to-[#121824] border-b border-white/10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4 pt-1">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-3xl font-black shadow-lg">
              {athleteAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">{athleteName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                  Verified Athlete
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{athleteHandle} &bull; Bengaluru, India 🇮🇳</p>
              <p className="text-[11px] text-slate-300 mt-1 italic font-medium">
                "Intention over everything &bull; Calisthenics &amp; Football Winger &bull; Unstoppable consistency"
              </p>
            </div>
          </div>

          {/* Social Stats Strip */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="font-bold text-white font-mono">148</span>{' '}
              <span className="text-muted-foreground">Activities</span>
            </div>
            <div>
              <span className="font-bold text-white font-mono">1.2k</span>{' '}
              <span className="text-muted-foreground">Kudos Received</span>
            </div>
            <div>
              <span className="font-bold text-primary font-mono">34</span>{' '}
              <span className="text-muted-foreground">Trophies &amp; PRs</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-white/10 bg-[#080b11] px-4 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Training Log
          </button>
          <button
            onClick={() => setActiveTab('prs')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'prs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            All-Time PRs 🏆
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'challenges'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Trophy Case ({challenges.filter(c => c.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('gear')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'gear'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Gear Tracker
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-display">
                  <Calendar size={14} className="text-primary" />
                  <span>Activity Consistency Heatmap (2026)</span>
                </h3>
                <span className="text-xs text-muted-foreground font-mono">148 Active Days</span>
              </div>

              {/* Heatmap Grid */}
              <div className="p-4 rounded-2xl bg-[#080b11] border border-white/10 overflow-x-auto">
                <div className="flex gap-1 min-w-[340px]">
                  {weeks.map((w, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {w.map((d, dIdx) => (
                        <div
                          key={dIdx}
                          className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 ${
                            d.intensity === 0
                              ? 'bg-white/5'
                              : d.intensity === 1
                              ? 'bg-primary/25'
                              : d.intensity === 2
                              ? 'bg-primary/60'
                              : d.intensity === 3
                              ? 'bg-primary'
                              : 'bg-dude shadow-xs'
                          }`}
                          title={`Week ${wIdx + 1}, Day ${dIdx + 1}: ${d.intensity > 0 ? `${d.intensity * 3}km workout` : 'Rest Day'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 mt-2 border-t border-white/5">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-white/5"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/25"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/60"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-dude"></div>
                  </div>
                  <span>More active</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRS */}
          {activeTab === 'prs' && (
            <div className="space-y-4">
              {/* Running PRs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
                  🏃 Running Best Efforts
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">1K PR</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">4:05</div>
                    <div className="text-[9px] text-dude font-bold">🥇 Gold Effort</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">5K PR</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">23:40</div>
                    <div className="text-[9px] text-dude font-bold">🥇 Gold Effort</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">10K PR</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">51:12</div>
                    <div className="text-[9px] text-slate-300 font-bold">🥈 Silver Effort</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Longest Run</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">14.2 km</div>
                    <div className="text-[9px] text-primary font-bold">🏅 Lifetime Max</div>
                  </div>
                </div>
              </div>

              {/* Calisthenics PRs */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
                  💪 Calisthenics Mastery PRs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Max Push-ups</div>
                    <div className="text-base font-extrabold text-primary font-mono mt-0.5">38 Reps</div>
                    <div className="text-[9px] text-primary font-bold">Strict Form</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Max Pull-ups</div>
                    <div className="text-base font-extrabold text-primary font-mono mt-0.5">12 Reps</div>
                    <div className="text-[9px] text-primary font-bold">Deadhang</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Parallel Dips</div>
                    <div className="text-base font-extrabold text-primary font-mono mt-0.5">22 Reps</div>
                    <div className="text-[9px] text-primary font-bold">Deep ROM</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121824] border border-white/5 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Plank Hold</div>
                    <div className="text-base font-extrabold text-dude font-mono mt-0.5">3m 15s</div>
                    <div className="text-[9px] text-dude font-bold">Hollow Body</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHALLENGES */}
          {activeTab === 'challenges' && (
            <div className="space-y-3">
              {challenges.map((c) => {
                const progressPct = Math.min(100, Math.round((c.currentValue / c.targetValue) * 100));

                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
                      c.isCompleted
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-[#121824] border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-xs">
                          {c.badgeIcon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-display">{c.title}</h4>
                          <p className="text-[11px] text-muted-foreground">{c.month}</p>
                        </div>
                      </div>

                      {c.isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-primary">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-bold font-mono text-dude">
                          {c.currentValue} / {c.targetValue} {c.unit}
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: c.isCompleted ? '#ccff00' : '#ffd700'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: GEAR */}
          {activeTab === 'gear' && (
            <div className="space-y-3">
              {gearList.map((g) => {
                const gearPct = Math.min(100, Math.round((g.totalDistanceKm / g.maxDistanceKm) * 100));

                return (
                  <div key={g.id} className="p-4 rounded-2xl bg-[#121824] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{g.type === 'shoes' ? '👟' : '🚴'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white font-display">{g.name}</h5>
                            {g.isDefault && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{g.brand} {g.model}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-white">
                          {g.totalDistanceKm.toFixed(1)} <span className="text-muted-foreground font-normal">/ {g.maxDistanceKm} km</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{g.maxDistanceKm - g.totalDistanceKm} km remaining</div>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${gearPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
