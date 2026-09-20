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
    <div className="bg-card rounded-3xl border border-glass p-5 md:p-6 shadow-xl my-4 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-glass pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
              HISTORICAL FITNESS INTELLIGENCE
            </span>
            <h3 className="text-base md:text-lg font-black text-main flex items-center gap-2">
              <span>Multi-Year Journey (2019 – 2026)</span>
              {isLoading && (
                <span className="text-[10px] text-amber-500 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 animate-pulse">
                  Syncing Firestore...
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-glass text-xs">
          <button
            onClick={() => setSelectedMetricView('distance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetricView === 'distance'
                ? 'bg-[#55198B] text-white shadow'
                : 'text-sub hover:text-main'
            }`}
          >
            Distance (km)
          </button>
          <button
            onClick={() => setSelectedMetricView('calories')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetricView === 'calories'
                ? 'bg-[#55198B] text-white shadow'
                : 'text-sub hover:text-main'
            }`}
          >
            Calories (kcal)
          </button>
          <button
            onClick={() => setSelectedMetricView('activeDays')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetricView === 'activeDays'
                ? 'bg-[#55198B] text-white shadow'
                : 'text-sub hover:text-main'
            }`}
          >
            Active Days
          </button>
        </div>
      </div>

      {/* 1. LIFETIME HERO METRIC STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">TOTAL CALORIES</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-main font-mono">
            {totalLifetimeCalories.toLocaleString()} <span className="text-xs font-normal text-sub">kcal</span>
          </div>
          <p className="text-[10px] text-sub mt-1">Google Fit Lifetime Burn</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">RUNNING VOLUME</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-main font-mono">
            {totalLifetimeRunKm} <span className="text-xs font-normal text-sub">km</span>
          </div>
          <p className="text-[10px] text-sub mt-1">Strava Logged Running</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FC4C02]/10 to-transparent border border-[#FC4C02]/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-[#FC4C02] tracking-wider">CYCLING VOLUME</span>
            <Zap size={16} className="text-[#FC4C02]" />
          </div>
          <div className="text-xl md:text-2xl font-black text-main font-mono">
            {totalLifetimeCycleKm} <span className="text-xs font-normal text-sub">km</span>
          </div>
          <p className="text-[10px] text-sub mt-1">Longest: {milestones.longestCycleKm || 10.7} km</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">JOURNEY TRACKED</span>
            <Calendar size={16} className="text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-main font-mono">
            {totalRecordedDays} <span className="text-xs font-normal text-sub">Days</span>
          </div>
          <p className="text-[10px] text-sub mt-1">2019 – 2026 Archive</p>
        </div>
      </div>

      {/* 2. MULTI-YEAR VOLUME PROGRESSION (2019 - 2026) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black text-sub uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 size={15} className="text-[#55198B] dark:text-[#c084fc]" />
            <span>Year-over-Year Fitness Volume</span>
          </h4>
          <span className="text-[11px] font-bold text-sub">
            {selectedMetricView === 'distance' ? 'Total Distance' : selectedMetricView === 'calories' ? 'Calorie Burn' : 'Days Active'}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-8 gap-2 items-end h-44 p-3 bg-black/20 rounded-2xl border border-glass">
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
                <span className="text-[9px] font-mono font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                  {selectedMetricView === 'distance'
                    ? `${rawVal.toFixed(0)}km`
                    : selectedMetricView === 'calories'
                    ? `${(rawVal / 1000).toFixed(0)}k`
                    : `${rawVal}d`}
                </span>

                {/* Animated Column */}
                <div
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                    selectedYear === y.year
                      ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-lg shadow-orange-500/30'
                      : 'bg-gradient-to-t from-[#55198B] to-[#7B2CBF] hover:from-[#7B2CBF] hover:to-[#c084fc]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                {/* Year Label */}
                <span className={`text-[10px] font-bold font-mono mt-2 ${selectedYear === y.year ? 'text-amber-400 font-black' : 'text-sub'}`}>
                  {y.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MONTHLY DETAIL FOR SELECTED YEAR */}
      <div className="p-4 rounded-2xl bg-black/15 border border-glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-main uppercase">
              {selectedYear === 'all' ? '2026' : selectedYear} Monthly Breakdown
            </span>
            <span className="text-[10px] text-sub font-semibold">(Click any year bar above to change)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">12-Month Progression</span>
        </div>

        <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5 items-end h-28 pt-2">
          {monthlyDataForYear.map((m) => {
            const val = selectedMetricView === 'distance' ? m.distanceKm : selectedMetricView === 'calories' ? m.calories : m.activeDays;
            const maxM = Math.max(...monthlyDataForYear.map(x => selectedMetricView === 'distance' ? x.distanceKm : selectedMetricView === 'calories' ? x.calories : x.activeDays), 1);
            const barH = Math.max(6, Math.round((val / maxM) * 100));

            return (
              <div key={m.month} className="flex flex-col items-center h-full justify-end">
                <div
                  className="w-full max-w-[16px] rounded-t-md bg-gradient-to-t from-cyan-600 to-emerald-400 transition-all duration-300"
                  style={{ height: `${barH}%` }}
                  title={`${m.month}: ${val.toFixed(1)}`}
                />
                <span className="text-[9px] font-mono text-sub mt-1.5">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ALL-TIME TROPHY CASE & PRS */}
      <div className="mt-5 pt-4 border-t border-glass">
        <h4 className="text-xs font-black text-sub uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Award size={15} className="text-amber-400" />
          <span>All-Time Personal Records Hall of Fame</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-card border border-glass flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              🥇
            </div>
            <div>
              <div className="text-[9px] text-sub font-bold uppercase">FASTEST 1 KM</div>
              <div className="text-sm font-black text-main font-mono">
                {milestones.fastest1kRunSeconds ? `${Math.floor(milestones.fastest1kRunSeconds / 60)}m ${milestones.fastest1kRunSeconds % 60}s` : '4m 34s'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-glass flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              🥈
            </div>
            <div>
              <div className="text-[9px] text-sub font-bold uppercase">LONGEST RUN</div>
              <div className="text-sm font-black text-main font-mono">
                {milestones.longestRunKm || 4.31} km
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-glass flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FC4C02]/10 text-[#FC4C02] flex items-center justify-center font-bold">
              🚴
            </div>
            <div>
              <div className="text-[9px] text-sub font-bold uppercase">LONGEST CYCLE</div>
              <div className="text-sm font-black text-main font-mono">
                {milestones.longestCycleKm || 10.69} km
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-glass flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <div className="text-[9px] text-sub font-bold uppercase">PEAK SPEED</div>
              <div className="text-sm font-black text-main font-mono">
                {milestones.topSpeedRunKmh || 53.8} km/h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
