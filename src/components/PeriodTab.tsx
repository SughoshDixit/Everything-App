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
  AlertCircle
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
    if (confirm('Load 3+ months of realistic mock cycle demo data?')) {
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
      icsContent += `BEGIN:VEVENT\r\nSUMMARY:Predicted Ovulation Day (Cycle #${idx + 1})\r\nDTSTART;VALUE=DATE:${ovClean}\r\nDTEND;VALUE=DATE:${ovClean}\r\nDESCRIPTION:Estimated peak fertile day\r\nEND:VEVENT\r\n`;
    });

    icsContent += 'END:VCALENDAR\r\n';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cycle_predictions.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      logs,
      settings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cycle_tracker_backup_${todayStr}.json`;
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

  // Insights Data Calculation (Last 90 Days)
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
    <div className="tab-container animate-fade-in">
      {/* Hero Header */}
      <div className="period-hero glass-card flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="badge-pill bg-rose flex items-center gap-1 inline-flex">
            <Heart className="icon-xs text-rose fill-current" />
            <span>MENSTRUATION & OVULATION TRACKER</span>
          </div>
          <h2 className="mt-1">Cycle Health & Ovulation Tracker</h2>
          <p className="text-sub text-sm">
            100% Private, local cycle mathematics & ovulation forecasting for athletic women.
          </p>
        </div>

        <button
          className="btn-primary btn-large bg-rose hover:bg-rose-600 pulse-glow flex items-center gap-1"
          onClick={() => handleOpenLogModal(todayStr)}
        >
          <Plus className="icon-sm" />
          <span>Log Today ({todayStr})</span>
        </button>
      </div>

      {/* Subtab Navigation */}
      <div className="subtab-bar">
        <button
          className={`subtab-btn ${activeSubTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('dashboard')}
        >
          <CalendarIcon className="icon-xs" />
          <span>📊 Dashboard</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <Activity className="icon-xs" />
          <span>📜 History</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('insights')}
        >
          <Sparkles className="icon-xs" />
          <span>📈 Insights</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings className="icon-xs" />
          <span>⚙️ Settings & Backup</span>
        </button>
      </div>

      {/* 1. DASHBOARD SUBTAB */}
      {activeSubTab === 'dashboard' && (
        <div className="subtab-content grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Calendar Card */}
          <div className="lg:col-span-2 glass-card card-stagger" style={{ animationDelay: '0.05s' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex gap-1 items-center">
                <button className="btn-secondary text-xs px-2 py-1" onClick={handlePrevMonth}>
                  &lt; Prev
                </button>
                <button className="btn-primary text-xs px-3 py-1 bg-cyan" onClick={handleTodayClick}>
                  Today
                </button>
                <button className="btn-secondary text-xs px-2 py-1" onClick={handleNextMonth}>
                  Next &gt;
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center font-bold text-xs text-sub mb-2">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
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

                let cellBgClass = 'bg-slate-900/60 border-slate-800';
                if (isPeriod) {
                  cellBgClass = 'bg-rose-950/80 border-rose-600 text-rose-200';
                } else if (isPredictedPeriod) {
                  cellBgClass = 'bg-rose-900/30 border-dashed border-rose-500/60 text-rose-300';
                } else if (isOvulation) {
                  cellBgClass = 'bg-amber-950/80 border-amber-500 text-amber-200';
                } else if (isFertile) {
                  cellBgClass = 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200';
                }

                if (cell.isOtherMonth) {
                  cellBgClass += ' opacity-40';
                }

                return (
                  <button
                    key={idx}
                    className={`min-h-[64px] p-1 rounded-lg border text-left flex flex-col justify-between transition-all hover:scale-105 ${cellBgClass} ${
                      isToday ? 'ring-2 ring-cyan-400' : ''
                    } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
                    onClick={() => handleOpenLogModal(cell.dateStr)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${isToday ? 'text-cyan' : 'text-slate-300'}`}>
                        {cell.dayNum}
                      </span>
                      {isPeriod && (
                        <span className="text-[10px] bg-rose-600/60 text-white px-1 rounded">
                          {log.flow.toUpperCase()}
                        </span>
                      )}
                      {isOvulation && <span className="text-[10px] text-amber-400 font-bold">★ OV</span>}
                    </div>

                    {/* Logged Icons / Emojis */}
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
            <div className="flex flex-wrap gap-3 text-xs mt-3 pt-3 border-t border-slate-800 text-sub">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-600"></span> Period Logged
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border border-dashed border-rose-400 bg-rose-950/40"></span> Predicted Period
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-cyan-900 border border-cyan-500"></span> Fertile Window
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-600"></span> Ovulation Day
              </div>
            </div>
          </div>

          {/* Right Column: Cycle Status & Highlights */}
          <div className="flex flex-col gap-4">
            {/* Phase & Day Status Card */}
            <div className="glass-card card-stagger text-center" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-rose-500/50 bg-rose-950/30 mb-2">
                <div>
                  <div className="text-2xl font-extrabold text-white">Day {phaseInfo.cycleDay}</div>
                  <div className="text-[10px] text-cyan font-bold uppercase">{phaseInfo.phaseName}</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mt-1">{phaseInfo.phaseName} Phase</h3>
              <div className="badge-pill bg-amber mt-1 inline-block">{phaseInfo.pregnancyChance}</div>
              <p className="text-xs text-sub mt-2 leading-relaxed">{phaseInfo.phaseDescription}</p>
            </div>

            {/* Highlights Widget */}
            <div className="glass-card card-stagger" style={{ animationDelay: '0.15s' }}>
              <h3 className="text-md font-bold text-white mb-2 flex items-center gap-1">
                <CalendarCheck className="icon-xs text-cyan" />
                <span>Cycle Highlights</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-xl font-bold text-cyan">{metrics.avgCycleLength}</div>
                  <div className="text-[10px] text-sub uppercase">Avg Cycle (Days)</div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-xl font-bold text-rose">{metrics.avgPeriodLength}</div>
                  <div className="text-[10px] text-sub uppercase">Avg Period (Days)</div>
                </div>
              </div>

              <div className="bg-rose-950/40 p-3 rounded-lg border border-rose-800/60 text-xs">
                <div className="text-rose-300 font-bold mb-1">Next Expected Period:</div>
                <div className="text-slate-200 font-semibold">{nextPeriodText}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HISTORY SUBTAB */}
      {activeSubTab === 'history' && (
        <div className="subtab-content glass-card card-stagger">
          <h3 className="text-lg font-bold text-white mb-3">Cycle Log History</h3>

          {metrics.groups.length === 0 ? (
            <div className="text-center py-8 text-sub">
              <AlertCircle className="mx-auto mb-2 icon-lg text-slate-600" />
              <p>No historical cycle data logged yet. Click "Log Today" or select a calendar date!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {metrics.groups.slice().reverse().map((grp, idx) => (
                <div key={idx} className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <span className="badge-pill bg-rose text-xs">Cycle #{metrics.groups.length - idx}</span>
                    <h4 className="font-bold text-white mt-1">
                      {grp.startDateStr} &rarr; {grp.endDateStr}
                    </h4>
                    <div className="text-xs text-sub mt-0.5">
                      Duration: <strong>{grp.length} Days Period</strong>
                    </div>
                  </div>

                  <button
                    className="btn-secondary text-xs"
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
        <div className="subtab-content grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symptoms Chart */}
          <div className="glass-card card-stagger">
            <h3 className="text-md font-bold text-white mb-1">Logged Symptoms Frequency</h3>
            <p className="text-xs text-sub mb-3">Most common symptoms recorded across your cycles</p>

            {sortedSymptoms.length === 0 ? (
              <p className="text-xs text-sub py-4">No symptoms logged yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedSymptoms.map(([sym, count]) => {
                  const pct = Math.round((count / maxSymptomVal) * 100);
                  return (
                    <div key={sym}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{SYMPTOM_EMOJIS[sym] || '•'} {SYMPTOM_LABELS[sym] || sym}</span>
                        <span className="text-cyan font-bold">{count} times</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
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

          {/* Mood Patterns Chart */}
          <div className="glass-card card-stagger">
            <h3 className="text-md font-bold text-white mb-1">Mood Patterns</h3>
            <p className="text-xs text-sub mb-3">Distribution of recorded moods across your cycles</p>

            {sortedMoods.length === 0 ? (
              <p className="text-xs text-sub py-4">No moods logged yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedMoods.map(([mood, count]) => {
                  const pct = Math.round((count / maxMoodVal) * 100);
                  return (
                    <div key={mood}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{MOOD_EMOJIS[mood] || '•'} {MOOD_LABELS[mood] || mood}</span>
                        <span className="text-amber font-bold">{count} times</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
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

      {/* 4. SETTINGS & BACKUP SUBTAB */}
      {activeSubTab === 'settings' && (
        <div className="subtab-content grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cycle Configuration Form */}
          <div className="glass-card card-stagger">
            <h3 className="text-md font-bold text-white mb-2">Cycle Settings</h3>
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="text-xs text-sub">Default Cycle Length (days):</label>
                <input
                  type="number"
                  value={formCycleLen}
                  onChange={(e) => setFormCycleLen(Number(e.target.value))}
                  min="20"
                  max="45"
                  className="w-full mt-1"
                />
              </div>
              <div className="form-group">
                <label className="text-xs text-sub">Default Period Duration (days):</label>
                <input
                  type="number"
                  value={formPeriodLen}
                  onChange={(e) => setFormPeriodLen(Number(e.target.value))}
                  min="2"
                  max="10"
                  className="w-full mt-1"
                />
              </div>
              <button type="submit" className="btn-primary">Save Settings</button>
            </form>
          </div>

          {/* Backup & Tools */}
          <div className="glass-card card-stagger flex flex-col gap-3">
            <h3 className="text-md font-bold text-white">Data Management & Calendar Sync</h3>

            <button className="btn-secondary flex items-center justify-center gap-1" onClick={handleLoadDemoData}>
              <RotateCcw className="icon-xs" />
              <span>Load 3-Month Demo Data</span>
            </button>

            <button className="btn-secondary flex items-center justify-center gap-1" onClick={handleExportICS}>
              <CalendarCheck className="icon-xs text-cyan" />
              <span>Sync with Calendar (.ICS File)</span>
            </button>

            <div className="flex gap-2">
              <button className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs" onClick={handleExportJSON}>
                <Download className="icon-xs" />
                <span>Export Backup</span>
              </button>

              <label className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs cursor-pointer">
                <Upload className="icon-xs" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>

            <button className="btn-secondary text-rose border-rose-900/50 hover:bg-rose-950/40 text-xs mt-2" onClick={handleClearAllData}>
              Clear All Period Data
            </button>
          </div>
        </div>
      )}

      {/* LOG EDITOR MODAL */}
      {showLogModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-scale-up max-w-lg">
            <div className="modal-header">
              <h3>Log Cycle Details ({selectedDateStr})</h3>
              <button className="btn-close" onClick={() => setShowLogModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveLog} className="flex flex-col gap-3 mt-2">
              {/* Flow Selector */}
              <div>
                <label className="text-xs text-sub font-bold block mb-1">Menstrual Flow Level:</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['none', 'light', 'medium', 'heavy'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`p-2 rounded text-xs font-bold border transition-all ${
                        editFlow === f
                          ? 'bg-rose-600 border-rose-400 text-white'
                          : 'bg-slate-900/80 border-slate-800 text-sub'
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
                <label className="text-xs text-sub font-bold block mb-1">Symptoms:</label>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(SYMPTOM_EMOJIS).map((sym) => {
                    const isSelected = editSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        className={`px-2 py-1 rounded-full text-xs border transition-all ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-400 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-sub'
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
                <label className="text-xs text-sub font-bold block mb-1">Moods:</label>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(MOOD_EMOJIS).map((m) => {
                    const isSelected = editMoods.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`px-2 py-1 rounded-full text-xs border transition-all ${
                          isSelected
                            ? 'bg-amber-600 border-amber-400 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-sub'
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
                <label className="text-xs text-sub font-bold block mb-1">Notes / Journal:</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes on energy, sleep, or physical feeling..."
                  rows={2}
                  className="w-full text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  className="btn-secondary text-rose border-rose-900/40 text-xs flex items-center gap-1"
                  onClick={handleDeleteLog}
                >
                  <Trash2 className="icon-xs" />
                  <span>Clear Entry</span>
                </button>

                <div className="flex gap-2">
                  <button type="button" className="btn-secondary text-xs" onClick={() => setShowLogModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs bg-rose hover:bg-rose-600">
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
