import React, { useState } from 'react';
import type { FootballDrill } from '../types';
import { Zap, Compass, CheckCircle, Target, Activity, Clock } from 'lucide-react';

interface FootballTabProps {
  drills: FootballDrill[];
  onOpenCreatePost?: () => void;
}

export const FootballTab: React.FC<FootballTabProps> = ({ drills, onOpenCreatePost }) => {
  const [selectedDrill, setSelectedDrill] = useState<FootballDrill | null>(null);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);

  const toggleDrillCompleted = (id: string) => {
    setCompletedDrills((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero Header */}
      <div className="football-hero glass-card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <Zap className="icon-lg text-cyan pulse-glow" />
        <div>
          <div className="hero-badge badge-pill bg-cyan/20 text-cyan mb-1">FORWARD / WINGER</div>
          <h2 className="m-0" style={{ fontSize: '1.25rem' }}>Speed & Finishing</h2>
        </div>
      </div>

      {/* Pitch vs Calisthenics Schedule Balance Guidance */}
      <div className="schedule-guide glass-card mt-4 hover-scale">
        <div className="week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
          {[
            { day: 'M', color: 'text-cyan', dot: 'bg-cyan' },
            { day: 'T', color: 'text-emerald', dot: 'bg-emerald', highlight: true },
            { day: 'W', color: 'text-indigo', dot: 'bg-indigo' },
            { day: 'T', color: 'text-cyan', dot: 'bg-cyan' },
            { day: 'F', color: 'text-amber', dot: 'bg-amber', highlight: true },
            { day: 'S', color: 'text-rose', dot: 'bg-rose', match: true },
            { day: 'S', color: 'text-green', dot: 'bg-green' }
          ].map((d, i) => (
            <div key={i} className={`day-box ${d.highlight ? 'highlight' : ''} ${d.match ? 'match' : ''}`} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
              <div className="font-bold">{d.day}</div>
              <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${d.dot}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Drills List */}
      <div className="drills-section mt-4">
        <div className="drills-grid">
          {drills.map((drill, index) => {
            const isDone = completedDrills.includes(drill.id);
            return (
              <div 
                key={drill.id} 
                className={`drill-card glass-card card-stagger hover-scale ${isDone ? 'completed' : ''}`}
                style={{ animationDelay: `${index * 0.08}s`, padding: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 className="drill-title m-0" style={{ fontSize: '1.1rem', flex: 1 }}>{drill.title}</h3>
                  <button
                    className={`btn-icon ${isDone ? 'text-emerald pulse-glow' : 'text-muted'}`}
                    onClick={() => toggleDrillCompleted(drill.id)}
                  >
                    <CheckCircle className="icon-sm" />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span className="badge-pill bg-rose/20 text-rose" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Activity className="icon-xs" /> {drill.intensity}
                  </span>
                  <span className="badge-pill bg-cyan/20 text-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock className="icon-xs" /> {drill.durationMinutes}m
                  </span>
                  <span className="badge-pill bg-indigo/20 text-indigo" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Target className="icon-xs" /> {drill.category.toUpperCase()}
                  </span>
                </div>

                <div className="drill-actions mt-2 flex gap-2">
                  <button className="btn-secondary flex-1" onClick={() => setSelectedDrill(drill)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap className="icon-xs text-amber" />
                    <span>Instructions</span>
                  </button>
                  {onOpenCreatePost && (
                    <button
                      className="btn-google-tonal text-xs py-1.5 px-3"
                      onClick={onOpenCreatePost}
                      title="Add this drill to today's compiled post"
                    >
                      ➕ Post
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill Instructions Modal */}
      {selectedDrill && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-scale-up">
            <div className="modal-header">
              <h3>{selectedDrill.title}</h3>
              <button className="btn-close" onClick={() => setSelectedDrill(null)}>&times;</button>
            </div>

            <div className="drill-detail">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                 <span className="badge-pill bg-cyan/20 text-cyan">{selectedDrill.category.toUpperCase()}</span>
                 <span className="badge-pill bg-amber/20 text-amber"><Clock className="icon-xs inline mr-1" />{selectedDrill.durationMinutes}m</span>
              </div>
              
              <div className="glass-card mb-4" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-amber)', marginBottom: '0.5rem' }}>
                  <Compass className="icon-sm" /> <strong>Cone Setup</strong>
                </div>
                <div>{selectedDrill.coneSetup}</div>
              </div>

              <h4 className="mt-3 text-cyan">Steps:</h4>
              <ol className="instructions-list pl-4">
                {selectedDrill.instructions.map((step, idx) => (
                  <li key={idx} className="mb-2">{step}</li>
                ))}
              </ol>

              <div className="modal-actions mt-4">
                <button className="btn-primary w-full" onClick={() => setSelectedDrill(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
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
          0%, 100% { filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.5)); }
          50% { filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)); }
        }
      `}</style>
    </div>
  );
};
