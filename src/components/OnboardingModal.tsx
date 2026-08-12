import React, { useState } from 'react';
import type { UserFitnessProfile, GenderType } from '../types';
import { Sparkles, User, Dumbbell, Target } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile?: UserFitnessProfile;
  onSaveProfile: (profile: UserFitnessProfile) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onSaveProfile,
  onClose
}) => {
  const [gender, setGender] = useState<GenderType>(initialProfile?.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(initialProfile?.weightKg || 70);
  const [pushupBaseline, setPushupBaseline] = useState<number>(initialProfile?.pushupBaseline || 5);
  const [primaryGoal, setPrimaryGoal] = useState<UserFitnessProfile['primaryGoal']>(
    initialProfile?.primaryGoal || 'football_winger'
  );

  // Derived BMI & Tailored Targets Calculation
  const bmi = (weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1);

  // Gender-tailored calculations
  const calculateTargets = () => {
    const isMale = gender === 'male';
    const proteinTargetGrams = Math.round(weightKg * (isMale ? 1.8 : 1.5));
    const caloricTarget = Math.round(weightKg * 33 + (isMale ? 300 : 100));

    return { proteinTargetGrams, caloricTarget };
  };

  const handleSave = () => {
    const { proteinTargetGrams, caloricTarget } = calculateTargets();
    onSaveProfile({
      gender,
      heightCm,
      weightKg,
      pushupBaseline,
      pullupBaseline: 0,
      primaryGoal,
      caloricTarget,
      proteinTargetGrams
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card onboarding-modal animate-scale-up">
        <div className="modal-header">
          <div>
            <span className="badge-pill bg-cyan">PERSONALIZED FITNESS ASSESSMENT</span>
            <h2 className="mt-1">Tailor Your Fitness & Workout Plan</h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="onboarding-form">
          {/* 1. GENDER SELECTION */}
          <div className="form-group mb-4">
            <label className="text-amber font-bold flex items-center gap-1">
              <User className="icon-xs text-amber" />
              <span>1. Select Gender Profile:</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                className={`gender-card glass-card ${gender === 'male' ? 'active-male' : ''}`}
                onClick={() => {
                  setGender('male');
                  setPrimaryGoal('football_winger');
                }}
              >
                <div className="text-3xl mb-1">👨</div>
                <div className="font-bold text-white">Male Profile</div>
                <div className="text-xs text-sub">Focus: Hypertrophy, Explosive Speed & Upper Body Power</div>
              </button>

              <button
                type="button"
                className={`gender-card glass-card ${gender === 'female' ? 'active-female' : ''}`}
                onClick={() => {
                  setGender('female');
                  setPrimaryGoal('tone_definition');
                }}
              >
                <div className="text-3xl mb-1">👩</div>
                <div className="font-bold text-white">Female Profile</div>
                <div className="text-xs text-sub">Focus: Core, Athletic Toning, Glute-Hamstring & Stamina</div>
              </button>
            </div>
          </div>

          {/* 2. HEIGHT & WEIGHT INPUTS */}
          <div className="form-row mb-4">
            <div className="form-group">
              <label>Height (cm):</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                min="100"
                max="230"
              />
            </div>
            <div className="form-group">
              <label>Weight (kg):</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                min="30"
                max="180"
              />
            </div>
          </div>

          <div className="bmi-badge glass-card mb-4 text-center">
            <span className="text-xs text-sub">Calculated BMI Score:</span>
            <div className="text-xl font-bold text-cyan">{bmi} Body Mass Index</div>
          </div>

          {/* 3. BASELINE PUSH-UP TEST QUESTIONNAIRE */}
          <div className="form-group mb-4">
            <label className="text-cyan font-bold flex items-center gap-1">
              <Dumbbell className="icon-xs text-cyan" />
              <span>3. Test & Enter Max Floor Push-ups You Can Do Right Now:</span>
            </label>
            <div className="stepper mt-2">
              <button type="button" onClick={() => setPushupBaseline((r) => Math.max(0, r - 1))}>-</button>
              <input
                type="number"
                value={pushupBaseline}
                onChange={(e) => setPushupBaseline(Number(e.target.value))}
              />
              <button type="button" onClick={() => setPushupBaseline((r) => r + 1)}>+</button>
            </div>
            <p className="text-xs text-sub mt-1 text-center">
              {pushupBaseline <= 2 && "Scaling: Incline & Wall Push-ups focus"}
              {pushupBaseline >= 3 && pushupBaseline <= 5 && "Scaling: Knee & Strict Floor Push-ups (Your Current Baseline)"}
              {pushupBaseline >= 6 && "Scaling: Neutral Push-up Bars & Weighted Overload"}
            </p>
          </div>

          {/* 4. PRIMARY GOAL SELECTION */}
          <div className="form-group mb-4">
            <label className="text-amber font-bold flex items-center gap-1">
              <Target className="icon-xs text-amber" />
              <span>4. Select Primary Target Goal:</span>
            </label>
            <select
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value as UserFitnessProfile['primaryGoal'])}
              className="mt-1"
            >
              <option value="football_winger">Explosive Football Winger & Upper Body Power</option>
              <option value="calisthenics_mastery">Calisthenics Mastery & Pull-up Bar Unlocks</option>
              <option value="breath_stamina">Carnatic Vocal Breath Control & Diaphragm Stamina</option>
              <option value="tone_definition">Lean Toning, Core Stability & Athletic Endurance</option>
            </select>
          </div>

          {/* SAVE BUTTON */}
          <button className="btn-primary btn-large w-full mt-4" onClick={handleSave}>
            <Sparkles className="icon-sm" />
            <span>Save Profile & Tailor My 30-Day Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
