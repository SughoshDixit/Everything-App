import React, { useState } from 'react';
import type { RoutineItem, MotivationalQuote, UserProfile, UserStats } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Zap,
  Target,
  Sparkles,
  Award,
  Sun,
  Dumbbell,
  BookOpen,
  Music,
  Moon,
  Clock
} from 'lucide-react';

interface DisciplineTabProps {
  currentProfile: UserProfile;
  routines: RoutineItem[];
  quotes: MotivationalQuote[];
  stats: UserStats;
  onToggleRoutine: (id: string) => void;
  onAddRoutine: (routine: Omit<RoutineItem, 'id' | 'completed'>) => void;
}

export const DisciplineTab: React.FC<DisciplineTabProps> = ({
  currentProfile,
  routines,
  quotes,
  stats,
  onToggleRoutine,
  onAddRoutine
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RoutineItem['category']>('morning');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newDuration, setNewDuration] = useState(15);
  const [newAssigned, setNewAssigned] = useState<'men' | 'women' | 'both'>('men');
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Filter routines based on persona
  const filteredRoutines = routines.filter((r) => {
    if (currentProfile === 'couple') return true;
    return r.assignedTo === currentProfile || r.assignedTo === 'both';
  });

  const completedCount = filteredRoutines.filter((r) => r.completed).length;
  const totalCount = filteredRoutines.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentQuote = quotes[quoteIdx % quotes.length] || quotes[0];

  const handleNextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddRoutine({
      title: newTitle.trim(),
      category: newCategory,
      timeOfDay: newTime,
      durationMinutes: Number(newDuration),
      assignedTo: newAssigned,
      icon: newCategory === 'fitness' ? 'Dumbbell' : newCategory === 'music_veda' ? 'Music' : newCategory === 'morning' ? 'Sun' : 'Moon'
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: RoutineItem['category']) => {
    switch (cat) {
      case 'morning': return <Sun className="icon-cat text-amber" />;
      case 'fitness': return <Dumbbell className="icon-cat text-cyan" />;
      case 'music_veda': return <Music className="icon-cat text-violet" />;
      case 'evening': return <Moon className="icon-cat text-indigo" />;
      default: return <BookOpen className="icon-cat text-green" />;
    }
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Motivational Quote Banner */}
      <div className="quote-banner glass-card">
        <div className="quote-header">
          <div className="quote-tag">
            <Sparkles className="icon-xs" />
            <span>CORE BELIEF & MOTIVATION</span>
          </div>
          <button className="btn-text" onClick={handleNextQuote}>
            Next Quote &rarr;
          </button>
        </div>
        <blockquote className="quote-text">
          "{currentQuote.text}"
        </blockquote>
        <div className="quote-author">&mdash; {currentQuote.author}</div>
      </div>

      {/* Discipline Dashboard & Score Header */}
      <div className="discipline-grid">
        <div className="score-card glass-card">
          <div className="score-header">
            <h3>Daily Consistency Score</h3>
            <span className="badge-pill">{currentProfile.toUpperCase()}</span>
          </div>
          <div className="score-display">
            <div className="score-circle">
              <svg className="progress-ring" width="120" height="120">
                <circle className="progress-ring-bg" strokeWidth="8" r="50" cx="60" cy="60" />
                <circle
                  className="progress-ring-fill"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionPct / 100)}`}
                  r="50"
                  cx="60"
                  cy="60"
                />
              </svg>
              <div className="score-number">{completionPct}%</div>
            </div>
            <div className="score-details">
              <div className="score-stat">
                <span className="stat-value">{completedCount} / {totalCount}</span>
                <span className="stat-label">Habits Completed Today</span>
              </div>
              <div className="score-stat">
                <span className="stat-value text-emerald">
                  {currentProfile === 'men' ? stats.menStreak : currentProfile === 'women' ? stats.womenStreak : stats.coupleStreak} Days
                </span>
                <span className="stat-label">Unbroken Consistency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Discipline Core Principles Card */}
        <div className="principles-card glass-card">
          <h3 className="card-title">
            <Target className="icon-sm text-cyan" />
            <span>The Self-Discipline Manifesto</span>
          </h3>
          <ul className="principles-list">
            <li>
              <Zap className="icon-bullet text-amber" />
              <span><strong>Consistency &gt; Adrenaline:</strong> One focused hour daily beats an 8-hour weekend spike.</span>
            </li>
            <li>
              <Award className="icon-bullet text-emerald" />
              <span><strong>Identity First:</strong> You aren't "trying to exercise"—you are a dedicated athlete & artist.</span>
            </li>
            <li>
              <Clock className="icon-bullet text-indigo" />
              <span><strong>Mastery over Rush:</strong> Master Calisthenics & Football step-by-step; hold non-essentials till ready.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Routine Checklist Section */}
      <div className="routine-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Daily Routine Checklist</h2>
            <p className="section-desc">Track your actions for {currentProfile === 'couple' ? 'both profiles' : currentProfile.toUpperCase()}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="icon-sm" />
            <span>Add Habit</span>
          </button>
        </div>

        <div className="routine-list">
          {filteredRoutines.map((item) => (
            <div
              key={item.id}
              className={`routine-card glass-card ${item.completed ? 'completed' : ''}`}
              onClick={() => onToggleRoutine(item.id)}
            >
              <button className="toggle-btn" aria-label="Toggle completed">
                {item.completed ? (
                  <CheckCircle2 className="icon-check text-emerald" />
                ) : (
                  <Circle className="icon-check text-muted" />
                )}
              </button>

              <div className="routine-icon-box">{getCategoryIcon(item.category)}</div>

              <div className="routine-info">
                <h4 className="routine-title">{item.title}</h4>
                <div className="routine-meta">
                  <span><Clock className="icon-xs inline" /> {item.timeOfDay}</span>
                  <span>&bull;</span>
                  <span>{item.durationMinutes} mins</span>
                  <span>&bull;</span>
                  <span className="badge-tag">{item.assignedTo.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-scale-up">
            <h3 className="modal-title">Add New Daily Habit / Routine</h3>
            <form onSubmit={handleCreateRoutine}>
              <div className="form-group">
                <label>Habit Title</label>
                <input
                  type="text"
                  placeholder="e.g. 10 Mins Dynamic Hip & Ankle Mobility"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RoutineItem['category'])}
                  >
                    <option value="morning">Morning Routine</option>
                    <option value="fitness">Fitness / Calisthenics</option>
                    <option value="music_veda">Music & Vedas</option>
                    <option value="evening">Evening Recovery</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned To</label>
                  <select
                    value={newAssigned}
                    onChange={(e) => setNewAssigned(e.target.value as 'men' | 'women' | 'both')}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="both">Both (Shared)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time of Day</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
