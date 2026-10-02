import React, { useState } from 'react';
import type {
  CycleLogsMap,
  CycleSettings,
  CycleFlowType,
  UserProfile
} from '../types';
import {
  getLocalDateString,
  calculateCycleMetrics,
  getCurrentPhaseInfo,
  SYMPTOM_EMOJIS,
  SYMPTOM_LABELS,
  MOOD_EMOJIS,
  MOOD_LABELS,
  initialCycleLogs
} from '../utils/cycleTracker';
import {
  Calendar as CalendarIcon,
  Activity,
  Heart,
  Settings,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  CalendarCheck,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PeriodTabProps {
  currentProfile: UserProfile;
  logs: CycleLogsMap;
  settings: CycleSettings;
  onUpdateLogs: (newLogs: CycleLogsMap) => void;
  onUpdateSettings: (newSettings: CycleSettings) => void;
}

export const PeriodTab: React.FC<PeriodTabProps> = ({
  logs,
  settings,
  onUpdateLogs,
  onUpdateSettings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'history' | 'insights' | 'settings'>('dashboard');

  const todayDate = new Date();
  const todayStr = getLocalDateString(todayDate);

  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-indexed

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(todayStr);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Edit Log State
  const [editFlow, setEditFlow] = useState<CycleFlowType>('none');
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);
  const [editMoods, setEditMoods] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState<string>('');

  // Settings State Form
  const [formCycleLen, setFormCycleLen] = useState<number>(settings.cycleLength);
  const [formPeriodLen, setFormPeriodLen] = useState<number>(settings.periodLength);

  // Calculated Metrics
  const metrics = calculateCycleMetrics(logs, settings);
  const phaseInfo = getCurrentPhaseInfo(todayStr, logs, metrics);

  // Next Period Prediction text
  const nextPrediction = metrics.predictions.periods[0];
  let nextPeriodText = 'No prediction yet';
  let daysRemaining = 0;
  if (nextPrediction) {
    const nextDate = nextPrediction.start;
    const diff = Math.round((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diff);
    nextPeriodText = `${nextPrediction.startStr} (${daysRemaining} days remaining)`;
  }

  // Calendar Navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Open Log Modal for Date
  const handleOpenLogModal = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const existing = logs[dateStr] || { flow: 'none', symptoms: [], moods: [], notes: '' };
    setEditFlow(existing.flow || 'none');
    setEditSymptoms(existing.symptoms || []);
    setEditMoods(existing.moods || []);
    setEditNotes(existing.notes || '');
    setShowLogModal(true);
  };

  // Save Log Entry
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    const newLogs = { ...logs };
    if (editFlow === 'none' && editSymptoms.length === 0 && editMoods.length === 0 && !editNotes.trim()) {
      delete newLogs[selectedDateStr];
    } else {
      newLogs[selectedDateStr] = {
        flow: editFlow,
        symptoms: editSymptoms,
        moods: editMoods,
        notes: editNotes.trim()
      };
    }
    onUpdateLogs(newLogs);
    setShowLogModal(false);
  };

  // Delete Log Entry
  const handleDeleteLog = () => {
    if (!selectedDateStr) return;
    const newLogs = { ...logs };
    delete newLogs[selectedDateStr];
    onUpdateLogs(newLogs);
    setShowLogModal(false);
  };

  // Toggle Symptom / Mood Selection
  const toggleSymptom = (sym: string) => {
    setEditSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const toggleMood = (mood: string) => {
    setEditMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      cycleLength: Number(formCycleLen),
      periodLength: Number(formPeriodLen)
    });
    alert('Cycle settings saved!');
  };

  // Load Demo Data
  const handleLoadDemoData = () => {
    if (confirm('Load 3+ months of realistic cycle demo data?')) {
      onUpdateLogs({ ...initialCycleLogs });
      alert('Demo cycle data loaded successfully!');
    }
  };

  // Clear All Data
  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all logged period data? This cannot be undone.')) {
      onUpdateLogs({});
    }
  };

  // Export .ICS Calendar File
  const handleExportICS = () => {
    if (metrics.predictions.periods.length === 0) {
      alert('No predictions available to export yet. Log a period first!');
      return;
    }

    let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//EverythingApp//CycleTracker//EN\r\n';
    metrics.predictions.periods.forEach((p, idx) => {
      const startClean = p.startStr.replace(/-/g, '');
      const endClean = p.endStr.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\r\nSUMMARY:Predicted Period (Cycle #${idx + 1})\r\nDTSTART;VALUE=DATE:${startClean}\r\nDTEND;VALUE=DATE:${endClean}\r\nDESCRIPTION:Tracked by Everything App Cycle Tracker\r\nEND:VEVENT\r\n`;
    });

    metrics.predictions.ovulations.forEach((ov, idx) => {
      const ovClean = ov.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\r\nSUMMARY:Estimated Ovulation (Cycle #${idx + 1})\r\nDTSTART;VALUE=DATE:${ovClean}\r\nDESCRIPTION:High fertility window\r\nEND:VEVENT\r\n`;
    });
    icsContent += 'END:VCALENDAR\r\n';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EverythingApp_Cycle_Predictions_${todayStr}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      logs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EverythingApp_CycleBackup_${todayStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed.logs === 'object') {
          onUpdateLogs(parsed.logs);
          if (parsed.settings) onUpdateSettings(parsed.settings);
          alert('Cycle backup imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Generate 42-cell Calendar Days Grid
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayDate = new Date(currentYear, currentMonth, 1);
  let startDayOfWeek = firstDayDate.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0=Mon, 6=Sun

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells: { dayNum: number; dateStr: string; isOtherMonth: boolean }[] = [];

  // 1. Prev Month Padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDay = totalDaysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
    calendarCells.push({ dayNum: prevDay, dateStr, isOtherMonth: true });
  }

  // 2. Current Month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ dayNum: day, dateStr, isOtherMonth: false });
  }

  // 3. Next Month Padding to fill 42 cells
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ dayNum: day, dateStr, isOtherMonth: true });
  }

  // Insights Data Calculation
  const symptomCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};

  Object.values(logs).forEach((log) => {
    log.symptoms?.forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
    log.moods?.forEach((m) => {
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const maxSymptomVal = sortedSymptoms[0]?.[1] || 1;
  const maxMoodVal = sortedMoods[0]?.[1] || 1;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Hero Header */}
      <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Heart size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400 block font-display">
              CYCLE HEALTH & BIOMETRIC INTELLIGENCE
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Menstruation, Phase & Ovulation Tracker
            </h2>
          </div>
        </div>

        <button
          onClick={() => handleOpenLogModal(todayStr)}
          className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition shadow-sm"
        >
          <Plus size={15} />
          <span>Log Today ({todayStr})</span>
        </button>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 Calendar & Cycle', icon: CalendarIcon },
          { id: 'history', label: '📜 Log History', icon: Activity },
          { id: 'insights', label: '📈 Biometric Insights', icon: Sparkles },
          { id: 'settings', label: '⚙️ Settings & Backup', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'text-muted-foreground hover:text-white border border-transparent'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD SUBTAB */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar Card */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex gap-1.5 items-center">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleTodayClick}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white hover:border-white/25"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center font-bold text-[10px] text-muted-foreground mb-2">
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
              <div>SUN</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                const log = logs[cell.dateStr];
                const isPeriod = log && log.flow && log.flow !== 'none';
                const isPredictedPeriod = metrics.predictions.periods.some(
                  (p) => cell.dateStr >= p.startStr && cell.dateStr <= p.endStr
                );
                const isOvulation = metrics.predictions.ovulations.includes(cell.dateStr);
                const isFertile = metrics.predictions.fertileWindows.some((w) => w.includes(cell.dateStr));

                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDateStr;

                let cellBgClass = 'bg-[#121824] border-white/5 text-slate-300';
                if (isPeriod) {
                  cellBgClass = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else if (isPredictedPeriod) {
                  cellBgClass = 'bg-rose-900/30 border-dashed border-rose-500/60 text-rose-300';
                } else if (isOvulation) {
                  cellBgClass = 'bg-dude/20 border-dude text-dude';
                } else if (isFertile) {
                  cellBgClass = 'bg-sky-950/60 border-sky-500/50 text-sky-200';
                }

                if (cell.isOtherMonth) {
                  cellBgClass += ' opacity-40';
                }

                return (
                  <button
                    key={idx}
                    className={`min-h-[64px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition hover:scale-105 ${cellBgClass} ${
                      isToday ? 'ring-2 ring-primary' : ''
                    } ${isSelected ? 'ring-2 ring-dude' : ''}`}
                    onClick={() => handleOpenLogModal(cell.dateStr)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${isToday ? 'text-primary' : ''}`}>
                        {cell.dayNum}
                      </span>
                      {isPeriod && (
                        <span className="text-[9px] bg-rose-600/60 text-white px-1 rounded font-bold">
                          {log.flow.toUpperCase()}
                        </span>
                      )}
                      {isOvulation && <span className="text-[9px] text-dude font-bold">★ OV</span>}
                    </div>

                    {/* Logged Icons */}
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {log?.symptoms?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[11px]" title={s}>
                          {SYMPTOM_EMOJIS[s] || '•'}
                        </span>
                      ))}
                      {log?.moods?.slice(0, 2).map((m, i) => (
                        <span key={i} className="text-[11px]" title={m}>
                          {MOOD_EMOJIS[m] || '•'}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs mt-4 pt-3 border-t border-white/5 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-600"></span> Period Logged
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-dashed border-rose-400 bg-rose-950/40"></span> Predicted Period
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-900 border border-sky-500"></span> Fertile Window
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-dude"></span> Ovulation Day
              </div>
            </div>
          </div>

          {/* Right Column: Status Cards */}
          <div className="flex flex-col gap-4">
            {/* Phase & Day Status Card */}
            <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-rose-500/50 bg-rose-950/30 flex flex-col items-center justify-center mb-3">
                <span className="text-2xl font-black text-white font-mono leading-none">Day {phaseInfo.cycleDay}</span>
                <span className="text-[10px] text-rose-300 font-bold uppercase mt-1">{phaseInfo.phaseName}</span>
              </div>

              <h3 className="text-base font-bold text-white font-display">{phaseInfo.phaseName} Phase</h3>
              <div className="mt-1 inline-block rounded-full border border-dude/30 bg-dude/10 px-3 py-0.5 text-xs font-bold text-dude">
                {phaseInfo.pregnancyChance}
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{phaseInfo.phaseDescription}</p>
            </div>

            {/* Cycle Highlights */}
            <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5 font-display">
                <CalendarCheck size={14} className="text-primary" />
                <span>Cycle Highlights</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                <div className="bg-[#121824] p-3 rounded-xl border border-white/5">
                  <div className="text-xl font-bold text-primary font-mono">{metrics.avgCycleLength}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">Avg Cycle (Days)</div>
                </div>
                <div className="bg-[#121824] p-3 rounded-xl border border-white/5">
                  <div className="text-xl font-bold text-rose-400 font-mono">{metrics.avgPeriodLength}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">Avg Period (Days)</div>
                </div>
              </div>

              <div className="bg-[#121824] p-3 rounded-xl border border-rose-500/20 text-xs">
                <div className="text-rose-400 font-bold mb-1">Next Expected Period:</div>
                <div className="text-white font-semibold">{nextPeriodText}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HISTORY SUBTAB */}
      {activeSubTab === 'history' && (
        <div className="rounded-2xl border border-border bg-[#0e131b] p-5 sm:p-6 shadow-lg">
          <h3 className="text-base font-bold text-white mb-4 font-display">Cycle Log History</h3>

          {metrics.groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle size={28} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs">No historical cycle data logged yet. Click "Log Today" or select a calendar date!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.groups.slice().reverse().map((grp, idx) => (
                <div key={idx} className="bg-[#121824] p-4 rounded-xl border border-white/5 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      Cycle #{metrics.groups.length - idx}
                    </span>
                    <h4 className="font-bold text-white mt-1 text-sm font-display">
                      {grp.startDateStr} &rarr; {grp.endDateStr}
                    </h4>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Duration: <strong className="text-white">{grp.length} Days Period</strong>
                    </div>
                  </div>

                  <button
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white"
                    onClick={() => handleOpenLogModal(grp.startDateStr)}
                  >
                    View / Edit Log
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. INSIGHTS SUBTAB */}
      {activeSubTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-1 font-display">Logged Symptoms Frequency</h3>
            <p className="text-xs text-muted-foreground mb-4">Most common physical sensations recorded</p>

            {sortedSymptoms.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No symptoms logged yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedSymptoms.map(([sym, count]) => {
                  const pct = Math.round((count / maxSymptomVal) * 100);
                  return (
                    <div key={sym}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200">{SYMPTOM_EMOJIS[sym] || '•'} {SYMPTOM_LABELS[sym] || sym}</span>
                        <span className="text-rose-400 font-bold font-mono">{count} times</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-1 font-display">Mood & Energy Patterns</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution of mental state across your cycles</p>

            {sortedMoods.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No moods logged yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedMoods.map(([mood, count]) => {
                  const pct = Math.round((count / maxMoodVal) * 100);
                  return (
                    <div key={mood}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200">{MOOD_EMOJIS[mood] || '•'} {MOOD_LABELS[mood] || mood}</span>
                        <span className="text-dude font-bold font-mono">{count} times</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-dude rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SETTINGS SUBTAB */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 font-display">Cycle Length Settings</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">
                  Default Cycle Length (days):
                </label>
                <input
                  type="number"
                  value={formCycleLen}
                  onChange={(e) => setFormCycleLen(Number(e.target.value))}
                  min="20"
                  max="45"
                  className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">
                  Default Period Duration (days):
                </label>
                <input
                  type="number"
                  value={formPeriodLen}
                  onChange={(e) => setFormPeriodLen(Number(e.target.value))}
                  min="2"
                  max="10"
                  className="w-full bg-[#121824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-rose-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition"
              >
                Save Settings
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-[#0e131b] p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white mb-1 font-display">Data Management & Calendar Sync</h3>

            <button
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-muted-foreground hover:text-white"
              onClick={handleLoadDemoData}
            >
              <RotateCcw size={14} />
              <span>Load 3-Month Demo Data</span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 py-2.5 text-xs font-bold text-sky-400 hover:bg-sky-400/20"
              onClick={handleExportICS}
            >
              <CalendarCheck size={14} />
              <span>Sync with Calendar (.ICS File)</span>
            </button>

            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                onClick={handleExportJSON}
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-muted-foreground hover:text-white cursor-pointer">
                <Upload size={13} />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>

            <button
              className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 mt-3"
              onClick={handleClearAllData}
            >
              Clear All Period Data
            </button>
          </div>
        </div>
      )}

      {/* LOG EDITOR MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0e131b] p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white font-display">
                Log Cycle Details ({selectedDateStr})
              </h3>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:text-white"
                onClick={() => setShowLogModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4">
              {/* Flow Selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5 font-display">
                  Menstrual Flow Level:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'light', 'medium', 'heavy'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                        editFlow === f
                          ? 'bg-rose-500 border-rose-400 text-white'
                          : 'bg-[#121824] border-white/5 text-muted-foreground hover:text-white'
                      }`}
                      onClick={() => setEditFlow(f)}
                    >
                      {f === 'none' ? 'None' : f === 'light' ? 'Light 🩸' : f === 'medium' ? 'Medium 🩸🩸' : 'Heavy 🩸🩸🩸'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Pills */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5 font-display">
                  Symptoms:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(SYMPTOM_EMOJIS).map((sym) => {
                    const isSelected = editSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        className={`px-2.5 py-1 rounded-full text-xs border transition ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-primary font-bold'
                            : 'bg-[#121824] border-white/5 text-muted-foreground hover:text-white'
                        }`}
                        onClick={() => toggleSymptom(sym)}
                      >
                        {SYMPTOM_EMOJIS[sym]} {SYMPTOM_LABELS[sym]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Moods Pills */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5 font-display">
                  Moods:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(MOOD_EMOJIS).map((m) => {
                    const isSelected = editMoods.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`px-2.5 py-1 rounded-full text-xs border transition ${
                          isSelected
                            ? 'bg-dude/20 border-dude text-dude font-bold'
                            : 'bg-[#121824] border-white/5 text-muted-foreground hover:text-white'
                        }`}
                        onClick={() => toggleMood(m)}
                      >
                        {MOOD_EMOJIS[m]} {MOOD_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5 font-display">
                  Notes / Journal:
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes on energy, sleep, or physical feeling..."
                  rows={2}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 flex items-center gap-1"
                  onClick={handleDeleteLog}
                >
                  <Trash2 size={13} />
                  <span>Clear Entry</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                    onClick={() => setShowLogModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-bold text-white hover:bg-rose-600 transition shadow-sm"
                  >
                    Save Log Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
