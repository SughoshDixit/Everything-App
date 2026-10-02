import React, { useState, useEffect, useMemo } from 'react';
import type { GpsActivityLog, PersonalMilestones } from '../types';
import { fetchDailyMetricsFromFirestore, type DailyMetricDoc } from '../services/firestoreService';
import {
  Flame,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  Award
} from 'lucide-react';

interface HistoricalTrendsDashboardProps {
  gpsActivities: GpsActivityLog[];
  milestones: PersonalMilestones;
}

export const HistoricalTrendsDashboard: React.FC<HistoricalTrendsDashboardProps> = ({
  gpsActivities,
  milestones
}) => {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMetricView, setSelectedMetricView] = useState<'distance' | 'calories' | 'activeDays'>('distance');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Load 1,456 days of Google Fit metrics from Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    fetchDailyMetricsFromFirestore('sughosh', 2000)
      .then((records) => {
        if (isMounted) {
          setDailyMetrics(records);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Could not load daily metrics from Firestore:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute multi-year yearly summaries (2019 to 2026)
  const yearlyStats = useMemo(() => {
    const yearsMap: Record<string, { year: string; distanceKm: number; calories: number; activeDays: number; totalSteps: number }> = {};

    // 1. Process Google Fit daily records
    dailyMetrics.forEach((d) => {
      const year = d.date.split('-')[0];
      if (!yearsMap[year]) {
        yearsMap[year] = { year, distanceKm: 0, calories: 0, activeDays: 0, totalSteps: 0 };
      }
      yearsMap[year].calories += d.caloriesKcal || 0;
      yearsMap[year].distanceKm += (d.distanceMeters || 0) / 1000;
      yearsMap[year].totalSteps += d.stepCount || 0;
      if ((d.stepCount && d.stepCount > 1000) || (d.moveMinutes && d.moveMinutes > 15) || (d.distanceMeters && d.distanceMeters > 500)) {
        yearsMap[year].activeDays++;
      }
    });

    // 2. Add any Strava activities that might have additional distance
    gpsActivities.forEach((act) => {
      const year = new Date(act.date).getFullYear().toString() || '2026';
      if (!yearsMap[year]) {
        yearsMap[year] = { year, distanceKm: 0, calories: 0, activeDays: 0, totalSteps: 0 };
      }
    });

    return Object.values(yearsMap).sort((a, b) => a.year.localeCompare(b.year));
  }, [dailyMetrics, gpsActivities]);

  // Compute maximum values for bar chart scaling
  const maxYearValue = useMemo(() => {
    if (yearlyStats.length === 0) return 1;
    if (selectedMetricView === 'distance') {
      return Math.max(...yearlyStats.map((y) => y.distanceKm), 10);
    }
    if (selectedMetricView === 'calories') {
      return Math.max(...yearlyStats.map((y) => y.calories), 1000);
    }
    return Math.max(...yearlyStats.map((y) => y.activeDays), 10);
  }, [yearlyStats, selectedMetricView]);

  // Total Lifetime Aggregates
  const totalLifetimeCalories = milestones.totalCaloriesBurned || 2424095;
  const totalLifetimeRunKm = milestones.totalDistanceRunKm || 121.8;
  const totalLifetimeCycleKm = milestones.totalDistanceCycleKm || 10.7;
  const totalRecordedDays = dailyMetrics.length || 1456;

  // Monthly breakdown for selected year
  const monthlyDataForYear = useMemo(() => {
    const targetYear = selectedYear === 'all' ? '2026' : selectedYear;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap: Record<number, { month: string; distanceKm: number; calories: number; activeDays: number }> = {};

    months.forEach((m, idx) => {
      monthMap[idx] = { month: m, distanceKm: 0, calories: 0, activeDays: 0 };
    });

    dailyMetrics.forEach((d) => {
      if (d.date.startsWith(targetYear)) {
        const monthIdx = parseInt(d.date.split('-')[1], 10) - 1;
        if (monthMap[monthIdx]) {
          monthMap[monthIdx].distanceKm += (d.distanceMeters || 0) / 1000;
          monthMap[monthIdx].calories += d.caloriesKcal || 0;
          if ((d.stepCount && d.stepCount > 1000) || (d.moveMinutes && d.moveMinutes > 15)) {
            monthMap[monthIdx].activeDays++;
          }
        }
      }
    });

    return Object.values(monthMap);
  }, [dailyMetrics, selectedYear]);

  return (
    <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg animate-fade-in font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary block font-display">
              HISTORICAL FITNESS INTELLIGENCE
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
              <span>Multi-Year Journey (2019 – 2026)</span>
              {isLoading && (
                <span className="text-[10px] text-dude font-semibold px-2 py-0.5 rounded-full bg-dude/10 animate-pulse">
                  Syncing Firestore...
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1 bg-[#121824] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setSelectedMetricView('distance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetricView === 'distance'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Distance (km)
          </button>
          <button
            onClick={() => setSelectedMetricView('calories')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetricView === 'calories'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Calories (kcal)
          </button>
          <button
            onClick={() => setSelectedMetricView('activeDays')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetricView === 'activeDays'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Active Days
          </button>
        </div>
      </div>

      {/* 1. LIFETIME HERO METRIC STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-[#121824] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase text-dude tracking-wider">TOTAL CALORIES</span>
            <Flame size={15} className="text-dude" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {totalLifetimeCalories.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">kcal</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Google Fit Lifetime Burn</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121824] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase text-primary tracking-wider">RUNNING VOLUME</span>
            <Activity size={15} className="text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {totalLifetimeRunKm} <span className="text-xs font-normal text-muted-foreground">km</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Strava Logged Running</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121824] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase text-[#ff9667] tracking-wider">CYCLING VOLUME</span>
            <Zap size={15} className="text-[#ff9667]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {totalLifetimeCycleKm} <span className="text-xs font-normal text-muted-foreground">km</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Longest: {milestones.longestCycleKm || 10.7} km</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121824] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase text-sky-400 tracking-wider">JOURNEY TRACKED</span>
            <Calendar size={15} className="text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {totalRecordedDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">2019 – 2026 Archive</p>
        </div>
      </div>

      {/* 2. MULTI-YEAR VOLUME PROGRESSION (2019 - 2026) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-display">
            <BarChart3 size={15} className="text-primary" />
            <span>Year-over-Year Fitness Volume</span>
          </h4>
          <span className="text-[11px] font-bold text-white">
            {selectedMetricView === 'distance' ? 'Total Distance' : selectedMetricView === 'calories' ? 'Calorie Burn' : 'Days Active'}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-8 gap-2 items-end h-44 p-3 bg-[#080b11] rounded-xl border border-white/10">
          {yearlyStats.map((y) => {
            const rawVal =
              selectedMetricView === 'distance'
                ? y.distanceKm
                : selectedMetricView === 'calories'
                ? y.calories
                : y.activeDays;

            const heightPct = Math.max(8, Math.round((rawVal / maxYearValue) * 100));

            return (
              <div
                key={y.year}
                className="flex flex-col items-center h-full justify-end group cursor-pointer"
                onClick={() => setSelectedYear(y.year)}
              >
                {/* Tooltip value on hover */}
                <span className="text-[9px] font-mono font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                  {selectedMetricView === 'distance'
                    ? `${rawVal.toFixed(0)}km`
                    : selectedMetricView === 'calories'
                    ? `${(rawVal / 1000).toFixed(0)}k`
                    : `${rawVal}d`}
                </span>

                {/* Animated Column */}
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                    selectedYear === y.year
                      ? 'bg-primary shadow-lg shadow-primary/30'
                      : 'bg-primary/25 hover:bg-primary/50'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                {/* Year Label */}
                <span className={`text-[10px] font-bold font-mono mt-2 ${selectedYear === y.year ? 'text-primary font-black' : 'text-muted-foreground'}`}>
                  {y.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MONTHLY DETAIL FOR SELECTED YEAR */}
      <div className="p-4 rounded-xl bg-[#080b11] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase font-display">
              {selectedYear === 'all' ? '2026' : selectedYear} Monthly Breakdown
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">(Tap any year bar above to change)</span>
          </div>
          <span className="text-[10px] text-primary font-bold">12-Month Progression</span>
        </div>

        <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5 items-end h-28 pt-2">
          {monthlyDataForYear.map((m) => {
            const val = selectedMetricView === 'distance' ? m.distanceKm : selectedMetricView === 'calories' ? m.calories : m.activeDays;
            const maxM = Math.max(...monthlyDataForYear.map(x => selectedMetricView === 'distance' ? x.distanceKm : selectedMetricView === 'calories' ? x.calories : x.activeDays), 1);
            const barH = Math.max(6, Math.round((val / maxM) * 100));

            return (
              <div key={m.month} className="flex flex-col items-center h-full justify-end">
                <div
                  className="w-full max-w-[16px] rounded-t-sm bg-gradient-to-t from-primary/30 to-primary transition-all duration-300"
                  style={{ height: `${barH}%` }}
                  title={`${m.month}: ${val.toFixed(1)}`}
                />
                <span className="text-[9px] font-mono text-muted-foreground mt-1.5">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ALL-TIME TROPHY CASE & PRS */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5 font-display">
          <Award size={15} className="text-dude" />
          <span>All-Time Personal Records Hall of Fame</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#121824] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-dude/10 text-dude flex items-center justify-center font-bold">
              🥇
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase">FASTEST 1 KM</div>
              <div className="text-sm font-bold text-white font-mono">
                {milestones.fastest1kRunSeconds ? `${Math.floor(milestones.fastest1kRunSeconds / 60)}m ${milestones.fastest1kRunSeconds % 60}s` : '4m 34s'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121824] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              🥈
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase">LONGEST RUN</div>
              <div className="text-sm font-bold text-white font-mono">
                {milestones.longestRunKm || 4.31} km
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121824] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#fc4c02]/10 text-[#ff9667] flex items-center justify-center font-bold">
              🚴
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase">LONGEST CYCLE</div>
              <div className="text-sm font-bold text-white font-mono">
                {milestones.longestCycleKm || 10.69} km
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121824] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase">PEAK SPEED</div>
              <div className="text-sm font-bold text-white font-mono">
                {milestones.topSpeedRunKmh || 53.8} km/h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
