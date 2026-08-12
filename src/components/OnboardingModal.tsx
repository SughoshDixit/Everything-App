import React, { useState } from 'react';
import type { UserFitnessProfile, GenderType } from '../types';
import { Sparkles, User, Dumbbell, Target, Info } from 'lucide-react';

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
  
  const [showMaleInfo, setShowMaleInfo] = useState(false);
  const [showFemaleInfo, setShowFemaleInfo] = useState(false);

  // Derived BMI & Tailored Targets Calculation
  const bmi = (weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1);
  const bmiNum = Number(bmi);
  let bmiColor = 'bg-green-500';
  if (bmiNum < 18.5) bmiColor = 'bg-yellow-500';
  else if (bmiNum > 25) bmiColor = 'bg-red-500';

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
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .stagger-1 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.5s; opacity: 0; }
        .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-4px); }
      `}</style>
      <div className="modal-backdrop">
        <div className="modal-content glass-card onboarding-modal" style={{ animation: 'scaleIn 0.3s ease-out' }}>
          <div className="modal-header">
            <div>
              <span className="badge-pill bg-cyan">🎯 FITNESS PROFILE</span>
            </div>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>

          <div className="onboarding-form">
            {/* 1. GENDER SELECTION */}
            <div className="form-group mb-4 stagger-1">
              <label className="text-amber font-bold flex items-center gap-1">
                <User className="icon-xs text-amber" />
                <span>1. Gender</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="relative">
                  <button
                    type="button"
                    className={`gender-card glass-card hover-lift w-full h-full ${gender === 'male' ? 'active-male' : ''}`}
                    onClick={() => {
                      setGender('male');
                      setPrimaryGoal('football_winger');
                    }}
                  >
                    <div className="text-3xl mb-1">👨</div>
                    <div className="font-bold text-white">MALE</div>
                  </button>
                  <button 
                    type="button"
                    className="absolute top-2 right-2 text-sub hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setShowMaleInfo(!showMaleInfo); setShowFemaleInfo(false); }}
                  >
                    <Info size={16} />
                  </button>
                  {showMaleInfo && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-gray-800 text-xs text-white rounded z-10 w-full text-center shadow-lg" style={{animation: 'fadeInUp 0.2s ease-out'}}>
                      Focus: Hypertrophy, Explosive Speed & Upper Body Power
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className={`gender-card glass-card hover-lift w-full h-full ${gender === 'female' ? 'active-female' : ''}`}
                    onClick={() => {
                      setGender('female');
                      setPrimaryGoal('tone_definition');
                    }}
                  >
                    <div className="text-3xl mb-1">👩</div>
                    <div className="font-bold text-white">FEMALE</div>
                  </button>
                  <button 
                    type="button"
                    className="absolute top-2 right-2 text-sub hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setShowFemaleInfo(!showFemaleInfo); setShowMaleInfo(false); }}
                  >
                    <Info size={16} />
                  </button>
                  {showFemaleInfo && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-gray-800 text-xs text-white rounded z-10 w-full text-center shadow-lg" style={{animation: 'fadeInUp 0.2s ease-out'}}>
                      Focus: Core, Athletic Toning, Glute-Hamstring & Stamina
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. HEIGHT & WEIGHT INPUTS */}
            <div className="form-row mb-4 stagger-2">
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

            <div className="bmi-badge glass-card mb-4 flex items-center justify-center gap-2 stagger-3 hover-lift">
              <div className={`w-3 h-3 rounded-full ${bmiColor}`}></div>
              <div className="text-xl font-bold text-cyan">{bmi} BMI</div>
            </div>

            {/* 3. BASELINE PUSH-UP TEST QUESTIONNAIRE */}
            <div className="form-group mb-4 stagger-4">
              <label className="text-cyan font-bold flex items-center gap-1">
                <Dumbbell className="icon-xs text-cyan" />
                <span>3. Max Reps</span>
              </label>
              <div className="stepper mt-2 hover-lift">
                <button type="button" onClick={() => setPushupBaseline((r) => Math.max(0, r - 1))}>-</button>
                <input
                  type="number"
                  value={pushupBaseline}
                  onChange={(e) => setPushupBaseline(Number(e.target.value))}
                />
                <button type="button" onClick={() => setPushupBaseline((r) => r + 1)}>+</button>
              </div>
            </div>

            {/* 4. PRIMARY GOAL SELECTION */}
            <div className="form-group mb-4 stagger-5">
              <label className="text-amber font-bold flex items-center gap-1">
                <Target className="icon-xs text-amber" />
                <span>4. Primary Goal</span>
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as UserFitnessProfile['primaryGoal'])}
                className="mt-1 hover-lift"
              >
                <option value="football_winger">Football Winger</option>
                <option value="calisthenics_mastery">Calisthenics</option>
                <option value="breath_stamina">Stamina</option>
                <option value="tone_definition">Toning</option>
              </select>
            </div>

            {/* SAVE BUTTON */}
            <button className="btn-primary btn-large w-full mt-4 stagger-5 hover-lift" onClick={handleSave}>
              <Sparkles className="icon-sm" />
              <span>Save & Start</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
