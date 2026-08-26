import React, { useState } from 'react';
import type { WorkoutSessionLog, UserProfile, UserFitnessProfile } from '../types';
import { month1Calendar } from '../utils/calisthenicsCalendar';
import {
  yellowDudeExercises,
  yellowDudeComboRoutines
} from '../utils/yellowDudePlaybook';
import type { ComboWorkoutRoutine, PlaybookExercise } from '../utils/yellowDudePlaybook';
import { ComboWorkoutPlayer } from './ComboWorkoutPlayer';
import { OnboardingModal } from './OnboardingModal';
import { ZoomableImageModal } from './ZoomableImageModal';
import { speakExerciseIntro } from '../utils/audioCoach';
import {
  Play,
  Layers,
  Flame,
  Volume2,
  Calendar,
  Zap,
  SlidersHorizontal,
  Info,
  BookOpen,
  Award,
  CheckCircle2,
  ZoomIn
} from 'lucide-react';

interface CalisthenicsTabProps {
  logs: WorkoutSessionLog[];
  currentProfile: UserProfile;
  onLogWorkout: (log: Omit<WorkoutSessionLog, 'id' | 'date'>) => void;
  onOpenCreatePost?: () => void;
}

export const CalisthenicsTab: React.FC<CalisthenicsTabProps> = ({
  logs,
  currentProfile,
  onLogWorkout,
  onOpenCreatePost
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'combos' | 'calendar' | 'library' | 'history'>('combos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1); // Day 1

  // Active Combo Workout Session State
  const [activeComboRoutine, setActiveComboRoutine] = useState<ComboWorkoutRoutine | null>(null);

  // Info Modal States (For User to Peruse upon clicking 'i' icon)
  const [infoRoutine, setInfoRoutine] = useState<ComboWorkoutRoutine | null>(null);
  const [infoExercise, setInfoExercise] = useState<PlaybookExercise | null>(null);

  // Zoomable Image Modal State
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string; page?: number } | null>(null);

  // User Fitness Profile
  const [fitnessProfile, setFitnessProfile] = useState<UserFitnessProfile>({
    gender: 'male',
    heightCm: 175,
    weightKg: 70,
    pushupBaseline: 5,
    pullupBaseline: 0,
    primaryGoal: 'football_winger',
    caloricTarget: 2600,
    proteinTargetGrams: 130
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  const categories = [
    { id: 'all', name: 'All Progressions' },
    { id: 'push', name: 'Push (Chest & Triceps)' },
    { id: 'pull', name: 'Pull (Lats & Biceps)' },
    { id: 'squat', name: 'Squats & Legs' }
  ];

  const filteredExercises = selectedCategory === 'all'
    ? yellowDudeExercises
    : yellowDudeExercises.filter((ex) => ex.category === selectedCategory);

  const selectedDayPlan = month1Calendar.find((d) => d.dayNumber === selectedDayNum) || month1Calendar[0];

  // 1-Click Launch Combo from Calendar Day
  const handleLaunchCalendarDayCombo = (dayPlan: typeof selectedDayPlan) => {
    let matchedRoutine = yellowDudeComboRoutines[0];
    if (dayPlan.focusCategory.includes('Pull')) {
      matchedRoutine = yellowDudeComboRoutines[1];
    } else if (dayPlan.focusCategory.includes('Football') || dayPlan.focusCategory.includes('Core')) {
      matchedRoutine = yellowDudeComboRoutines[2];
    } else if (dayPlan.focusCategory.includes('Match')) {
      matchedRoutine = yellowDudeComboRoutines[3];
    }
    setActiveComboRoutine(matchedRoutine);
  };

  return (
    <div className="tab-container animate-fade-in">
      {/* Clean Minimalist Header */}
      <div className="calisthenics-hero glass-card flex justify-between items-center flex-wrap gap-2 p-3">
        <div>
          <div className="badge-pill bg-cyan flex items-center gap-1 inline-flex text-[10px]">
            <Zap className="icon-xs text-cyan fill-current" />
            <span>YELLOW DUDE PLAYBOOK</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white mt-0.5">Calisthenics Combos</h2>
        </div>

        <button
          className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-2.5"
          onClick={() => setShowOnboardingModal(true)}
        >
          <SlidersHorizontal className="icon-xs" />
          <span>Baseline: {fitnessProfile.pushupBaseline} Reps</span>
        </button>
      </div>

      {/* Compact Subtab Navigation */}
      <div className="subtab-bar overflow-x-auto flex-nowrap flex gap-1 py-1">
        <button
          className={`subtab-btn whitespace-nowrap text-xs ${activeSubTab === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('combos')}
        >
          <Flame className="icon-xs inline mr-1" />
          <span>⚡ Combos</span>
        </button>
        <button
          className={`subtab-btn whitespace-nowrap text-xs ${activeSubTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('calendar')}
        >
          <Calendar className="icon-xs inline mr-1" />
          <span>📅 30-Day</span>
        </button>
        <button
          className={`subtab-btn whitespace-nowrap text-xs ${activeSubTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('library')}
        >
          <BookOpen className="icon-xs inline mr-1" />
          <span>📖 Library</span>
        </button>
        <button
          className={`subtab-btn whitespace-nowrap text-xs ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <Layers className="icon-xs inline mr-1" />
          <span>📜 History</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. GUIDED COMBOS SUBTAB (MINIMALIST VISUAL-FIRST CARDS) */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'combos' && (
        <div className="subtab-content grid grid-cols-1 md:grid-cols-2 gap-3">
          {yellowDudeComboRoutines.map((routine, idx) => (
            <div
              key={routine.id}
              className="glass-card card-stagger card-hover-lift flex flex-col justify-between p-4"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div>
                {/* Top Row: Badge & Info Icon */}
                <div className="flex justify-between items-start">
                  <span className="badge-pill bg-cyan text-[10px] font-bold tracking-wider uppercase">
                    {routine.badge}
                  </span>
                  
                  {/* Info Icon Button (Opens detailed breakdown) */}
                  <button
                    className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all cursor-pointer"
                    onClick={() => setInfoRoutine(routine)}
                    title="View Workout Details & Exercise Breakdown"
                  >
                    <Info size={16} />
                  </button>
                </div>

                <h3 className="text-base md:text-lg font-black text-main mt-1.5 mb-1">{routine.title}</h3>
                
                {/* Short Clean Metrics Tag */}
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-['Montserrat',sans-serif] font-medium leading-relaxed tracking-normal flex items-center gap-1.5">
                    <span className="opacity-90">⏱️</span>
                    <span>3m Warmup + 60s Rest + {routine.exercises.length} Drills</span>
                  </p>
                </div>
              </div>

              {/* Prominent Launch Action */}
              <button
                className="btn-primary w-full btn-large flex items-center justify-center gap-2 pulse-glow bg-lime-400 text-black hover:bg-lime-300 font-black uppercase tracking-wider text-xs py-3"
                onClick={() => setActiveComboRoutine(routine)}
              >
                <Play size={16} fill="#000" />
                <span>Launch Combo Workout</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. 30-DAY CALENDAR PLAN */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'calendar' && (
        <div className="subtab-content flex flex-col gap-3">
          {/* Day Selector Pills */}
          <div className="category-bar overflow-x-auto flex-nowrap flex gap-1 py-1">
            {month1Calendar.map((d) => (
              <button
                key={d.dayNumber}
                className={`cat-pill text-xs whitespace-nowrap ${selectedDayNum === d.dayNumber ? 'active' : ''}`}
                onClick={() => setSelectedDayNum(d.dayNumber)}
              >
                Day {d.dayNumber} {d.dayNumber === 1 ? '(TODAY)' : ''}
              </button>
            ))}
          </div>

          {/* Selected Day Details Card */}
          <div className="glass-card card-stagger p-4">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <div>
                <span className="badge-pill bg-cyan text-[10px]">{selectedDayPlan.focusCategory}</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedDayPlan.dayTitle}</h3>
                <div className="text-xs text-sub mt-0.5">
                  <Calendar className="icon-xs inline mr-1" />
                  {selectedDayPlan.dateString}
                </div>
              </div>

              <button
                className="btn-primary btn-large bg-lime-400 text-black hover:bg-lime-300 font-black uppercase tracking-wider text-xs flex items-center gap-1 py-2.5 px-4"
                onClick={() => handleLaunchCalendarDayCombo(selectedDayPlan)}
              >
                <Play size={16} fill="#000" />
                <span>Start Day {selectedDayNum} Combo</span>
              </button>
            </div>

            {/* Exercise List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {selectedDayPlan.exercises.map((ex, i) => (
                <div key={i} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{ex.name}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                    {ex.sets} &times; {ex.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. YELLOW DUDE PLAYBOOK LIBRARY (READABLE, ZOOMABLE & FIT-TO-SCREEN) */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'library' && (
        <div className="subtab-content flex flex-col gap-3">
          {/* Category Filter */}
          <div className="category-bar overflow-x-auto flex-nowrap flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill text-xs whitespace-nowrap ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Clean Exercise Grid with Centered Bounded Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="glass-card card-stagger card-hover-lift flex flex-col justify-between p-3 overflow-hidden"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div>
                  {/* Clean Bounded Character Image Stage (100% Fit, Tap / Pinch to Zoom & Read) */}
                  <div
                    className="playbook-img-card mb-2.5 group cursor-zoom-in relative"
                    onClick={() => setZoomImage({ src: ex.image, title: ex.name, page: ex.pageNumber })}
                    onTouchStart={(e) => {
                      if (e.touches.length >= 2) {
                        setZoomImage({ src: ex.image, title: ex.name, page: ex.pageNumber });
                      }
                    }}
                    title="Pinch with 2 fingers or Tap to Zoom & Read"
                  >
                    <img
                      src={ex.image}
                      alt={ex.name}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-zinc-700 shadow-md opacity-95 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={12} className="text-cyan-400" />
                      <span>Pinch / Tap Zoom</span>
                    </div>
                  </div>

                  {/* Title & Level */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-cyan tracking-wider uppercase">
                        {ex.levelName}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{ex.name}</h4>
                    </div>
                    <span className="badge-pill bg-emerald text-[10px]">
                      {ex.recommendedSets} &times; {ex.recommendedReps}
                    </span>
                  </div>
                </div>

                {/* Primary Audio Coaching Button & Info Icon */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5 py-1.5"
                    onClick={() => speakExerciseIntro(ex)}
                    title="Listen to Audio Voice Coach Instructions & Benefits"
                  >
                    <Volume2 size={14} className="text-lime-400" />
                    <span className="font-bold">Hear Voice Coach</span>
                  </button>

                  <button
                    className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all cursor-pointer"
                    onClick={() => setInfoExercise(ex)}
                    title="Read Written Details, Cues & Benefits"
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. WORKOUT HISTORY */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'history' && (
        <div className="subtab-content glass-card card-stagger p-4">
          <h3 className="text-base font-bold text-white mb-3">Workout History</h3>

          {logs.length === 0 ? (
            <p className="text-xs text-sub py-6 text-center">
              No workout sessions logged yet. Launch a Combo Workout above to start your training record!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-pill bg-cyan text-[10px]">{log.date}</span>
                      <h4 className="font-bold text-white text-sm">{log.exerciseName}</h4>
                    </div>
                    <div className="text-xs text-sub mt-1">
                      Sets Completed: <strong>{log.setsCompleted} sets</strong> ({log.repsCompleted.join(', ')} reps)
                    </div>
                  </div>
                  <span className="badge-pill bg-amber text-xs">RPE {log.perceivedExertion}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* INFO MODAL FOR COMBOS ('ℹ️' ICON CLICK) */}
      {/* ------------------------------------------------------------------- */}
      {infoRoutine && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-scale-up max-w-lg w-full max-h-[85vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <div>
                <span className="badge-pill bg-cyan text-[10px]">{infoRoutine.badge}</span>
                <h3 className="text-base font-bold text-white mt-1">{infoRoutine.title}</h3>
              </div>
              <button className="btn-close" onClick={() => setInfoRoutine(null)}>&times;</button>
            </div>

            <p className="text-xs text-sub mb-3 leading-relaxed">{infoRoutine.description}</p>

            <h4 className="text-xs font-bold text-lime-400 uppercase tracking-wider mb-2">Exercise Sequence:</h4>
            <div className="flex flex-col gap-2 mb-4">
              {infoRoutine.exercises.map((ex, i) => (
                <div key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{ex.name}</div>
                      <div className="text-[10px] text-sub">{ex.levelName}</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">
                    {ex.recommendedSets} &times; {ex.recommendedReps}
                  </span>
                </div>
              ))}
            </div>

            <button
              className="btn-primary w-full bg-lime-400 text-black hover:bg-lime-300 font-black uppercase tracking-wider text-xs py-2.5"
              onClick={() => {
                setActiveComboRoutine(infoRoutine);
                setInfoRoutine(null);
              }}
            >
              <Play size={14} fill="#000" className="inline mr-1" />
              <span>Launch This Workout Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* INFO MODAL FOR EXERCISES ('ℹ️' ICON CLICK) */}
      {/* ------------------------------------------------------------------- */}
      {infoExercise && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-scale-up max-w-md w-full max-h-[85vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
              <div>
                <span className="text-[10px] font-bold text-cyan uppercase">{infoExercise.levelName}</span>
                <h3 className="text-base font-bold text-white">{infoExercise.name}</h3>
              </div>
              <button className="btn-close" onClick={() => setInfoExercise(null)}>&times;</button>
            </div>

            {/* Clean Bounded Image (Tap to Zoom) */}
            <div
              className="playbook-img-card my-2 group cursor-zoom-in"
              onClick={() => setZoomImage({ src: infoExercise.image, title: infoExercise.name, page: infoExercise.pageNumber })}
              title="Tap to Zoom & Read Full Page"
            >
              <img
                src={infoExercise.image}
                alt={infoExercise.name}
              />
              <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-zinc-700">
                <ZoomIn size={11} className="text-cyan-400" />
                <span>Tap to Zoom</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs mt-2">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="font-bold text-white mb-1">Target Protocol:</div>
                <div className="text-emerald-400 font-bold">{infoExercise.recommendedSets} Sets &times; {infoExercise.recommendedReps} ({infoExercise.restSeconds}s Rest)</div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="font-bold text-lime-400 mb-1 flex items-center gap-1">
                  <Zap size={13} />
                  <span>Key Form Cues:</span>
                </div>
                <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
                  {infoExercise.keyCues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <Award size={13} />
                  <span>Key Benefits:</span>
                </div>
                <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
                  {infoExercise.keyBenefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="font-bold text-rose-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Instructions:</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{infoExercise.instructions}</p>
              </div>
            </div>

            <button
              className="btn-secondary w-full text-xs mt-3"
              onClick={() => setInfoExercise(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ZOOMABLE IMAGE MODAL (PINCH-TO-ZOOM & PAN) */}
      {zoomImage && (
        <ZoomableImageModal
          imageSrc={zoomImage.src}
          title={zoomImage.title}
          pageNumber={zoomImage.page}
          onClose={() => setZoomImage(null)}
        />
      )}

      {/* ONBOARDING QUESTIONNAIRE MODAL */}
      {showOnboardingModal && (
        <OnboardingModal
          initialProfile={fitnessProfile}
          onSaveProfile={(updated) => setFitnessProfile(updated)}
          onClose={() => setShowOnboardingModal(false)}
        />
      )}

      {/* ACTIVE COMBO WORKOUT PLAYER */}
      {activeComboRoutine && (
        <ComboWorkoutPlayer
          routine={activeComboRoutine}
          onFinishWorkout={(log) => {
            onLogWorkout({
              userId: currentProfile === 'women' ? 'women' : 'men',
              exerciseId: activeComboRoutine.id,
              exerciseName: log.exerciseName,
              setsCompleted: log.setsCompleted,
              repsCompleted: log.repsCompleted,
              perceivedExertion: 8,
              notes: log.notes
            });
            setActiveComboRoutine(null);
            if (onOpenCreatePost) onOpenCreatePost();
          }}
          onClose={() => setActiveComboRoutine(null)}
        />
      )}
    </div>
  );
};
