import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { Utensils, Droplet, Moon, HeartPulse, Flame, Check } from 'lucide-react';

interface NutritionTabProps {
  currentProfile: UserProfile;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({ currentProfile }) => {
  const [water, setWater] = useState<number>(2.5);
  const [protein, setProtein] = useState<number>(120);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Optimal' | 'Good' | 'Fair' | 'Poor'>('Optimal');
  const [savedToday, setSavedToday] = useState(false);

  const targetWater = 3.5;
  const targetProtein = 140;

  const handleSaveLogs = () => {
    setSavedToday(true);
    setTimeout(() => setSavedToday(false), 3000);
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Hero */}
      <div className="nutrition-hero glass-card">
        <div>
          <div className="badge-pill bg-emerald">{currentProfile.toUpperCase()} RECOVERY & FUEL</div>
          <h2>Lean Athletic Nutrition & Sleep Optimization</h2>
          <p>
            Muscles grow and tendons repair during rest. Proper protein timing and deep 7-8 hours
            of sleep power both your winger sprints and calisthenics progressions.
          </p>
        </div>
      </div>

      <div className="nutrition-grid">
        {/* Hydration Tracker */}
        <div className="track-card glass-card">
          <div className="card-header">
            <Droplet className="icon-sm text-cyan" />
            <h3>Hydration Log</h3>
          </div>
          <div className="metric-val">{water.toFixed(1)} L / {targetWater} L</div>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill bg-cyan"
              style={{ width: `${Math.min(100, (water / targetWater) * 100)}%` }}
            />
          </div>
          <div className="stepper-buttons mt-3">
            <button className="btn-secondary" onClick={() => setWater((w) => Math.max(0, w - 0.5))}>- 0.5L</button>
            <button className="btn-primary" onClick={() => setWater((w) => w + 0.5)}>+ 0.5L Water</button>
          </div>
        </div>

        {/* Protein Tracker */}
        <div className="track-card glass-card">
          <div className="card-header">
            <Utensils className="icon-sm text-amber" />
            <h3>Daily Protein Target</h3>
          </div>
          <div className="metric-val">{protein}g / {targetProtein}g</div>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill bg-amber"
              style={{ width: `${Math.min(100, (protein / targetProtein) * 100)}%` }}
            />
          </div>
          <div className="stepper-buttons mt-3">
            <button className="btn-secondary" onClick={() => setProtein((p) => Math.max(0, p - 10))}>- 10g</button>
            <button className="btn-primary" onClick={() => setProtein((p) => p + 15)}>+ 15g Protein</button>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="track-card glass-card">
          <div className="card-header">
            <Moon className="icon-sm text-indigo" />
            <h3>Sleep Quality</h3>
          </div>
          <div className="metric-val">{sleepHours} Hours</div>
          <div className="quality-selector mt-2">
            {(['Optimal', 'Good', 'Fair', 'Poor'] as const).map((q) => (
              <button
                key={q}
                className={`q-pill ${sleepQuality === q ? 'active' : ''}`}
                onClick={() => setSleepQuality(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="stepper-buttons mt-3">
            <button className="btn-secondary" onClick={() => setSleepHours((s) => Math.max(4, s - 0.5))}>- 0.5h</button>
            <button className="btn-primary" onClick={() => setSleepHours((s) => s + 0.5)}>+ 0.5h Sleep</button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center mt-4">
        <button className="btn-primary btn-large" onClick={handleSaveLogs}>
          {savedToday ? <Check className="icon-sm" /> : <HeartPulse className="icon-sm" />}
          <span>{savedToday ? 'Logs Saved!' : 'Save Today\'s Recovery Log'}</span>
        </button>
      </div>

      {/* Active Recovery & Mobility Checklist */}
      <div className="recovery-section mt-5 glass-card">
        <h3>Post-Workout Active Recovery Protocol</h3>
        <ul className="recovery-list">
          <li>
            <Flame className="icon-xs text-rose" />
            <span><strong>5 Mins Hip Flexor & Groin Stretch:</strong> Essential after football sprints to prevent tight hips.</span>
          </li>
          <li>
            <Flame className="icon-xs text-amber" />
            <span><strong>Doorway Pec & Lats Stretch:</strong> Opens up shoulders after push-ups and rows.</span>
          </li>
          <li>
            <Flame className="icon-xs text-cyan" />
            <span><strong>Ankle Dorsiflexion Mobility:</strong> Improves acceleration mechanics and protects achilles tendons.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
