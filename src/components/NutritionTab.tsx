import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { Utensils, Droplet, Moon, HeartPulse, Flame, Check, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';

interface NutritionTabProps {
  currentProfile: UserProfile;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({ currentProfile }) => {
  const [water, setWater] = useState<number>(2.5);
  const [protein, setProtein] = useState<number>(120);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Optimal' | 'Good' | 'Fair' | 'Poor'>('Optimal');
  const [savedToday, setSavedToday] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const targetWater = 3.5;
  const targetProtein = 140;

  const handleSaveLogs = () => {
    setSavedToday(true);
    setTimeout(() => setSavedToday(false), 3000);
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero */}
      <div className="nutrition-hero glass-card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <HeartPulse className="icon-lg text-emerald pulse-glow" />
        <div>
          <div className="badge-pill bg-emerald/20 text-emerald mb-1">{currentProfile.toUpperCase()} RECOVERY</div>
          <h2 className="m-0" style={{ fontSize: '1.25rem' }}>Nutrition & Sleep</h2>
        </div>
      </div>

      <div className="nutrition-grid mt-4">
        {/* Hydration Tracker */}
        <div className="track-card glass-card card-stagger hover-scale" style={{ animationDelay: '0.08s' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplet className="icon-sm text-cyan" />
              <h3 className="m-0">Water</h3>
            </div>
            <div className="metric-val font-bold text-cyan">{water.toFixed(1)}/{targetWater}L</div>
          </div>
          <div className="progress-bar-wrap mt-2 mb-3 bg-dark" style={{ height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              className="progress-bar-fill bg-cyan"
              style={{ width: `${Math.min(100, (water / targetWater) * 100)}%`, height: '100%', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </div>
          <div className="stepper-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-icon bg-dark text-white rounded-full p-2 border border-glass" onClick={() => setWater((w) => Math.max(0, w - 0.5))}><Minus className="icon-sm" /></button>
            <button className="btn-icon bg-[#55198B] text-white rounded-full p-2 shadow-sm" onClick={() => setWater((w) => w + 0.5)}><Plus className="icon-sm" /></button>
          </div>
        </div>

        {/* Protein Tracker */}
        <div className="track-card glass-card card-stagger hover-scale" style={{ animationDelay: '0.16s' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils className="icon-sm text-amber" />
              <h3 className="m-0">Protein</h3>
            </div>
            <div className="metric-val font-bold text-amber">{protein}/{targetProtein}g</div>
          </div>
          <div className="progress-bar-wrap mt-2 mb-3 bg-dark" style={{ height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              className="progress-bar-fill bg-amber"
              style={{ width: `${Math.min(100, (protein / targetProtein) * 100)}%`, height: '100%', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </div>
          <div className="stepper-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-icon bg-dark text-white rounded-full p-2" onClick={() => setProtein((p) => Math.max(0, p - 10))}><Minus className="icon-sm" /></button>
            <button className="btn-icon bg-amber text-black rounded-full p-2" onClick={() => setProtein((p) => p + 15)}><Plus className="icon-sm" /></button>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="track-card glass-card card-stagger hover-scale" style={{ animationDelay: '0.24s' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Moon className="icon-sm text-indigo" />
              <h3 className="m-0">Sleep</h3>
            </div>
            <div className="metric-val font-bold text-indigo">{sleepHours}h</div>
          </div>
          <div className="quality-selector mt-2 mb-3" style={{ display: 'flex', gap: '0.25rem' }}>
            {(['Optimal', 'Good', 'Fair', 'Poor'] as const).map((q) => (
              <button
                key={q}
                className={`q-pill text-xs flex-1 py-1 rounded ${sleepQuality === q ? 'bg-indigo text-white font-bold' : 'bg-dark text-muted'}`}
                onClick={() => setSleepQuality(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="stepper-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-icon bg-dark text-white rounded-full p-2" onClick={() => setSleepHours((s) => Math.max(4, s - 0.5))}><Minus className="icon-sm" /></button>
            <button className="btn-icon bg-indigo text-white rounded-full p-2" onClick={() => setSleepHours((s) => s + 0.5)}><Plus className="icon-sm" /></button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center mt-4 card-stagger" style={{ animationDelay: '0.32s' }}>
        <button className={`btn-primary btn-large w-full ${savedToday ? 'bg-emerald text-black pulse-glow' : ''}`} onClick={handleSaveLogs} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          {savedToday ? <Check className="icon-sm" /> : <HeartPulse className="icon-sm" />}
          <span>{savedToday ? 'Saved!' : 'Save Log'}</span>
        </button>
      </div>

      {/* Active Recovery & Mobility Checklist */}
      <div className="recovery-section mt-4 glass-card card-stagger hover-scale" style={{ animationDelay: '0.40s' }}>
        <button 
          className="btn-secondary w-full" 
          onClick={() => setShowTips(!showTips)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'transparent' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <Flame className="icon-sm text-rose" /> 🧘 Recovery Tips
          </span>
          {showTips ? <ChevronUp className="icon-sm" /> : <ChevronDown className="icon-sm" />}
        </button>
        
        {showTips && (
          <ul className="recovery-list mt-3 animate-fade-in pl-0" style={{ listStyle: 'none' }}>
            <li className="mb-2" style={{ display: 'flex', gap: '0.5rem' }}>
              <Flame className="icon-xs text-rose flex-shrink-0 mt-1" />
              <span><strong>Hip Flexor:</strong> Prevent tight hips.</span>
            </li>
            <li className="mb-2" style={{ display: 'flex', gap: '0.5rem' }}>
              <Flame className="icon-xs text-amber flex-shrink-0 mt-1" />
              <span><strong>Doorway Pec:</strong> Open up shoulders.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <Flame className="icon-xs text-cyan flex-shrink-0 mt-1" />
              <span><strong>Ankle Mobility:</strong> Protect achilles.</span>
            </li>
          </ul>
        )}
      </div>

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
          0%, 100% { filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.4)); }
          50% { filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)); }
        }
      `}</style>
    </div>
  );
};
