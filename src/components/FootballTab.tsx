import React, { useState } from 'react';
import type { FootballDrill } from '../types';
import { Zap, Compass, CheckCircle, Calendar } from 'lucide-react';

interface FootballTabProps {
  drills: FootballDrill[];
}

export const FootballTab: React.FC<FootballTabProps> = ({ drills }) => {
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
      <div className="football-hero glass-card">
        <div className="hero-badge">FORWARD / WINGER CONDITIONING</div>
        <h2>Explosive Speed, Agility & Finishing</h2>
        <p>
          As a forward and winger, matches are won in short, explosive 5m–15m sprint bursts,
          sharp directional cuts, high speed 1v1 isolation dribbling, and curling shots.
        </p>
      </div>

      {/* Pitch vs Calisthenics Schedule Balance Guidance */}
      <div className="schedule-guide glass-card">
        <div className="guide-title">
          <Calendar className="icon-sm text-cyan" />
          <span>Weekly Pitch & Leg Recovery Balance</span>
        </div>
        <div className="week-grid">
          <div className="day-box">
            <span className="day-name">Mon</span>
            <span className="day-focus text-cyan">Calisthenics (Upper)</span>
          </div>
          <div className="day-box highlight">
            <span className="day-name">Tue</span>
            <span className="day-focus text-emerald">Pitch Agility & Speed</span>
          </div>
          <div className="day-box">
            <span className="day-name">Wed</span>
            <span className="day-focus text-indigo">Carnatic & Rest</span>
          </div>
          <div className="day-box">
            <span className="day-name">Thu</span>
            <span className="day-focus text-cyan">Calisthenics (Full Body)</span>
          </div>
          <div className="day-box highlight">
            <span className="day-name">Fri</span>
            <span className="day-focus text-amber">Winger Finishing Drills</span>
          </div>
          <div className="day-box match">
            <span className="day-name">Sat</span>
            <span className="day-focus text-rose">MATCH DAY</span>
          </div>
          <div className="day-box">
            <span className="day-name">Sun</span>
            <span className="day-focus text-green">Active Stretch & Veda</span>
          </div>
        </div>
      </div>

      {/* Drills List */}
      <div className="drills-section mt-4">
        <h3 className="section-title">Forward & Winger Drills Library</h3>
        <div className="drills-grid">
          {drills.map((drill) => {
            const isDone = completedDrills.includes(drill.id);
            return (
              <div key={drill.id} className={`drill-card glass-card ${isDone ? 'completed' : ''}`}>
                <div className="drill-header">
                  <span className="intensity-badge bg-rose">{drill.intensity} INTENSITY</span>
                  <span className="duration-tag">{drill.durationMinutes} Mins</span>
                </div>

                <h3 className="drill-title">{drill.title}</h3>
                <div className="drill-category">Focus: {drill.category.toUpperCase()}</div>

                <div className="cone-box">
                  <Compass className="icon-xs text-amber" />
                  <span>Cone Setup: {drill.coneSetup}</span>
                </div>

                <div className="benefits-box">
                  <div className="benefits-title">Key Winger Benefits:</div>
                  <div className="benefits-tags">
                    {drill.keyBenefits.map((benefit, idx) => (
                      <span key={idx} className="benefit-pill">
                        &bull; {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="drill-actions mt-3">
                  <button className="btn-secondary flex-1" onClick={() => setSelectedDrill(drill)}>
                    <Zap className="icon-xs" />
                    <span>View Instructions</span>
                  </button>
                  <button
                    className={`btn-check ${isDone ? 'done' : ''}`}
                    onClick={() => toggleDrillCompleted(drill.id)}
                  >
                    <CheckCircle className="icon-sm" />
                  </button>
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
              <div className="badge-pill bg-cyan mb-2">{selectedDrill.category.toUpperCase()} DRILL</div>
              <p><strong>Duration:</strong> {selectedDrill.durationMinutes} Minutes</p>
              <p><strong>Cone Layout:</strong> {selectedDrill.coneSetup}</p>

              <h4 className="mt-3 text-cyan">Step-by-Step Instructions:</h4>
              <ol className="instructions-list">
                {selectedDrill.instructions.map((step, idx) => (
                  <li key={idx}>
                    <span className="step-num">{idx + 1}.</span> {step}
                  </li>
                ))}
              </ol>

              <div className="modal-actions mt-4">
                <button className="btn-primary" onClick={() => setSelectedDrill(null)}>
                  Close Instructions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
