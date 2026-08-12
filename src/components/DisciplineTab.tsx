import React, { useState } from 'react';
import type { RoutineItem, MotivationalQuote, UserProfile, UserStats } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Zap,
  Sparkles,
  Award,
  Sun,
  Dumbbell,
  BookOpen,
  Music,
  Moon,
  Clock,
  ChevronDown,
  ChevronUp
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
  
  const [showManifesto, setShowManifesto] = useState(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

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
      {/* Motivational Quote Banner - Scrolling Ticker */}
      <div className="quote-banner glass-card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <button className="btn-icon" onClick={handleNextQuote} style={{ flexShrink: 0, marginRight: '1rem' }}>
          <Sparkles className="icon-xs text-amber" />
        </button>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}>
          <div style={{ display: 'inline-block', animation: 'ticker 15s linear infinite' }}>
            <span style={{ fontWeight: 'bold' }}>"{currentQuote.text}"</span> &mdash; {currentQuote.author}
          </div>
        </div>
      </div>

      {/* Discipline Dashboard & Score Header */}
      <div className="discipline-grid">
        <div className="score-card glass-card hover-scale">
          <div className="score-display" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div className="score-circle">
              <svg className="progress-ring" width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle className="progress-ring-bg" strokeWidth="8" r="50" cx="60" cy="60" style={{ stroke: '#333', fill: 'transparent' }} />
                <circle
                  className="progress-ring-fill"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionPct / 100)}`}
                  r="50"
                  cx="60"
                  cy="60"
                  style={{ stroke: 'var(--color-cyan)', fill: 'transparent', transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="score-number" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {completionPct}%
              </div>
            </div>
            <div className="score-details" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
              <div className="score-stat">
                <span className="stat-value text-xl font-bold">{completedCount}/{totalCount}</span>
              </div>
              <div className="score-stat">
                <span className="stat-value text-emerald text-xl font-bold">
                  {currentProfile === 'men' ? stats.menStreak : currentProfile === 'women' ? stats.womenStreak : stats.coupleStreak}🔥
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Discipline Core Principles Card */}
        <div className="principles-card glass-card hover-scale">
          <button 
            className="btn-secondary w-full" 
            onClick={() => setShowManifesto(!showManifesto)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span><Zap className="icon-sm text-cyan inline mr-2" /> Manifesto</span>
            {showManifesto ? <ChevronUp className="icon-sm" /> : <ChevronDown className="icon-sm" />}
          </button>
          
          {showManifesto && (
            <ul className="principles-list mt-4 animate-fade-in">
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Zap className="icon-bullet text-amber" /> <span>Consistency &gt; Adrenaline</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award className="icon-bullet text-emerald" /> <span>Identity First</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock className="icon-bullet text-indigo" /> <span>Mastery over Rush</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Routine Checklist Section */}
      <div className="routine-section mt-4">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title m-0">Checklist</h2>
          <button className="btn-icon bg-cyan rounded-full p-2" onClick={() => setShowAddModal(true)}>
            <Plus className="icon-sm text-black" />
          </button>
        </div>

        <div className="routine-list mt-4">
          {filteredRoutines.map((item, index) => (
            <div
              key={item.id}
              className={`routine-card glass-card card-stagger hover-scale ${item.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${index * 0.08}s`, display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }}
              onClick={() => setExpandedRoutineId(expandedRoutineId === item.id ? null : item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="toggle-btn btn-icon" 
                  aria-label="Toggle completed"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRoutine(item.id);
                  }}
                >
                  {item.completed ? (
                    <CheckCircle2 className="icon-check text-emerald pulse-glow" />
                  ) : (
                    <Circle className="icon-check text-muted" />
                  )}
                </button>

                <div className="routine-icon-box">{getCategoryIcon(item.category)}</div>

                <div className="routine-info" style={{ flex: 1 }}>
                  <h4 className="routine-title m-0" style={{ fontSize: '1.1rem' }}>{item.title}</h4>
                </div>
                
                <div className="routine-time">
                  <span className="badge-pill bg-dark"><Clock className="icon-xs inline mr-1" />{item.timeOfDay}</span>
                </div>
              </div>
              
              {expandedRoutineId === item.id && (
                <div className="routine-details animate-fade-in" style={{ paddingLeft: '3rem', paddingTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                  <span className="badge-tag bg-cyan/20 text-cyan">{item.durationMinutes}m</span>
                  <span className="badge-tag bg-indigo/20 text-indigo">{item.assignedTo.toUpperCase()}</span>
                </div>
              )}
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
      
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-stagger {
          opacity: 0;
          animation: fadeInUp 0.4s ease forwards;
        }
        .hover-scale {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .pulse-glow {
          animation: pulseGlow 2s infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4)); }
          50% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8)); }
        }
      `}</style>
    </div>
  );
};
