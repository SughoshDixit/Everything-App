import React, { useState } from 'react';
import { X, Volume2, VolumeX, CheckCircle2, ChevronLeft } from 'lucide-react';
import { HumanGraphicModel } from './HumanGraphicModel';

interface AnimatedExerciseGuideModalProps {
  exerciseName: string;
  targetReps: string;
  targetSets: number;
  restSeconds: number;
  notes: string;
  onCompleteWorkout: () => void;
  onClose: () => void;
}

export const AnimatedExerciseGuideModal: React.FC<AnimatedExerciseGuideModalProps> = ({
  exerciseName,
  targetReps,
  targetSets,
  restSeconds,
  notes,
  onCompleteWorkout,
  onClose
}) => {
  // Leap Fitness 3 Main Tabs: 'video' | 'muscle' | 'how_to_do'
  const [activeTab, setActiveTab] = useState<'video' | 'muscle' | 'how_to_do'>('video');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Map exercise name to HumanGraphicModel pose type
  const getExerciseType = (name: string): 'pushup' | 'incline' | 'hang' | 'hollow' | 'circles' | 'default' => {
    const lower = name.toLowerCase();
    if (lower.includes('circle') || lower.includes('arm')) return 'circles';
    if (lower.includes('incline')) return 'incline';
    if (lower.includes('push')) return 'pushup';
    if (lower.includes('hang') || lower.includes('pull')) return 'hang';
    if (lower.includes('hollow') || lower.includes('plank')) return 'hollow';
    return 'default';
  };

  const exerciseType = getExerciseType(exerciseName);

  // Exercise YouTube Video Embed URL mapping (Leap Fitness style)
  const getYoutubeEmbedUrl = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('circle') || lower.includes('arm')) {
      return 'https://www.youtube-nocookie.com/embed/140RTy50fBw?autoplay=0&rel=0';
    } else if (lower.includes('incline')) {
      return 'https://www.youtube-nocookie.com/embed/Z0bRiVhnO8Q?autoplay=0&rel=0';
    } else if (lower.includes('push')) {
      return 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=0&rel=0';
    } else if (lower.includes('hang') || lower.includes('pull')) {
      return 'https://www.youtube-nocookie.com/embed/eGo4IYlbE5g?autoplay=0&rel=0';
    } else if (lower.includes('hollow') || lower.includes('plank')) {
      return 'https://www.youtube-nocookie.com/embed/406l70hXv_c?autoplay=0&rel=0';
    } else {
      return 'https://www.youtube-nocookie.com/embed/iodgr9d4n_o?autoplay=0&rel=0';
    }
  };

  const youtubeUrl = getYoutubeEmbedUrl(exerciseName);

  // Speech Helper
  const handleToggleVoice = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const text = `
          Instructions for ${exerciseName}.
          Target is ${targetSets} sets of ${targetReps}.
          Stand in position, control your breathwork by inhaling as you lower and exhaling as you push.
        `;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Exercise Details per tab (Leap Fitness design)
  const getExerciseDetails = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('push')) {
      return {
        focusAreas: ['Chest', 'Triceps', 'Deltoids', 'Core'],
        instructions: 'Lower your body until your chest almost touches the floor, keeping your body in a rigid plank line. Push up explosively.',
        commonMistakes: [
          'Shallow range of motion (not lowering fully to ground)',
          'Flaring elbows out to 90 degrees (causes shoulder pain)',
          'Sagging lower back and dropping hips',
          'Fast or jerky un-controlled reps'
        ],
        breathingTips: [
          'Inhale on the way down (2 seconds eccentric phase).',
          'Exhale powerfully on the way up (1 second concentric phase).',
          'Do not hold your breath during reps.'
        ]
      };
    } else if (lower.includes('hang') || lower.includes('pull')) {
      return {
        focusAreas: ['Lats', 'Biceps', 'Rhomboids', 'Grip'],
        instructions: 'Grip pull-up bar slightly wider than shoulder width. Engage scapula by pulling shoulder blades DOWN away from ears.',
        commonMistakes: [
          'Shrugging shoulders into neck passively',
          'Swinging or kicking legs for momentum',
          'Holding breath while hanging'
        ],
        breathingTips: [
          'Breathe deeply into your abdomen while holding.',
          'Keep throat relaxed and jaw unclenched.'
        ]
      };
    } else {
      return {
        focusAreas: ['Shoulders', 'Triceps', 'Upper Back'],
        instructions: 'Stand on the floor with your arms extended straight out at shoulder height. Rotate in small controlled circles.',
        commonMistakes: [
          'Shallow or jerky motion',
          'Dropping elbows below shoulder level',
          'Not engaging core posture'
        ],
        breathingTips: [
          'Inhale and exhale in a steady, relaxed rhythm.',
          'Keep shoulders depressed away from ears.'
        ]
      };
    }
  };

  const details = getExerciseDetails(exerciseName);

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card leap-fitness-modal animate-scale-up">
        {/* Top Title & Standardized Back Header */}
        <div className="leap-header">
          <button className="btn-secondary text-xs flex items-center gap-1" onClick={onClose}>
            <ChevronLeft className="icon-xs" />
            <span>Back to Menu</span>
          </button>
          <h2 className="leap-title">{exerciseName.toUpperCase()}</h2>
          <button className="btn-close" onClick={onClose} title="Close Guide">
            <X className="icon-sm" />
          </button>
        </div>

        {/* REALISTIC HUMAN CHARACTER ANIMATION STAGE (Sample1.mp4 Reference) */}
        <div className="leap-human-stage glass-card mb-3">
          <HumanGraphicModel exerciseType={exerciseType} />
        </div>

        {/* Leap Fitness Segmented Control Tabs */}
        <div className="leap-tab-bar">
          <button
            className={`leap-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Video
          </button>
          <button
            className={`leap-tab-btn ${activeTab === 'muscle' ? 'active' : ''}`}
            onClick={() => setActiveTab('muscle')}
          >
            Muscle
          </button>
          <button
            className={`leap-tab-btn ${activeTab === 'how_to_do' ? 'active' : ''}`}
            onClick={() => setActiveTab('how_to_do')}
          >
            How to do
          </button>
        </div>

        {/* TAB 1: VIDEO EMBED (LEAP FITNESS YOUTUBE STYLE) */}
        {activeTab === 'video' && (
          <div className="leap-tab-content animate-fade-in">
            <div className="video-player-frame">
              <iframe
                src={youtubeUrl}
                title={exerciseName}
                className="leap-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Voice Audio Narrator Button */}
            <button className="btn-secondary w-full my-2 text-xs" onClick={handleToggleVoice}>
              {isSpeaking ? <VolumeX className="icon-xs mr-1 inline" /> : <Volume2 className="icon-xs mr-1 inline" />}
              <span>{isSpeaking ? 'Pause Voice Instructions' : '🔊 Listen to Voice Instructions'}</span>
            </button>

            {/* Duration Stepper */}
            <div className="leap-duration-row glass-card my-2">
              <span className="text-xs font-bold text-white">DURATION / TARGET</span>
              <div className="duration-pill">
                <span className="num-val">{targetSets} Sets &times; {targetReps} ({restSeconds}s Rest)</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="leap-section">
              <h4 className="leap-subheading">INSTRUCTIONS</h4>
              <p className="leap-text">{details.instructions}</p>
            </div>

            {/* Focus Area Badges */}
            <div className="leap-section mt-3">
              <h4 className="leap-subheading">FOCUS AREA</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {details.focusAreas.map((area, idx) => (
                  <span key={idx} className="focus-badge">
                    &bull; {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MUSCLE ANATOMICAL 3D HIGHLIGHT MAP */}
        {activeTab === 'muscle' && (
          <div className="leap-tab-content animate-fade-in text-center">
            <div className="muscle-anatomy-stage glass-card py-4">
              <div className="anatomy-graphic mx-auto">
                <svg viewBox="0 0 200 300" className="anatomy-svg">
                  {/* Head */}
                  <circle cx="100" cy="35" r="18" fill="#334155" />
                  {/* Neck */}
                  <rect x="94" y="53" width="12" height="12" fill="#334155" />
                  {/* Chest & Shoulders (Highlighted in Leap Cyan/Red) */}
                  <path d="M 60 65 Q 100 60 140 65 L 145 110 L 55 110 Z" fill="#06B6D4" opacity="0.85" />
                  {/* Abs / Core */}
                  <rect x="65" y="112" width="70" height="50" fill="#F59E0B" opacity="0.8" rx="4" />
                  {/* Arms */}
                  <rect x="40" y="65" width="16" height="70" fill="#06B6D4" opacity="0.9" rx="6" />
                  <rect x="144" y="65" width="16" height="70" fill="#06B6D4" opacity="0.9" rx="6" />
                  {/* Legs */}
                  <rect x="65" y="165" width="30" height="100" fill="#334155" rx="8" />
                  <rect x="105" y="165" width="30" height="100" fill="#334155" rx="8" />
                </svg>
              </div>
              <div className="mt-3 font-bold text-cyan text-sm">
                Target Muscles Highlighted: {details.focusAreas.join(' • ')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOW TO DO (COMMON MISTAKES & BREATHING TIPS) */}
        {activeTab === 'how_to_do' && (
          <div className="leap-tab-content animate-fade-in">
            {/* Common Mistakes */}
            <div className="leap-section">
              <h4 className="leap-subheading text-rose">COMMON MISTAKES</h4>
              <ol className="mistakes-list mt-2">
                {details.commonMistakes.map((m, idx) => (
                  <li key={idx} className="mistake-item">
                    <span className="mistake-num">{idx + 1}</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Breathing Tips */}
            <div className="leap-section mt-4">
              <h4 className="leap-subheading text-cyan">BREATHING TIPS</h4>
              <ul className="breathing-list mt-2">
                {details.breathingTips.map((b, idx) => (
                  <li key={idx} className="breathing-item">
                    &bull; {b}
                  </li>
                ))}
              </ul>
            </div>

            {notes && (
              <div className="note-footer glass-card mt-3">
                <span><strong>Coach Note:</strong> {notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Leap Fitness Bottom Footer Action */}
        <div className="leap-footer mt-4">
          <div className="flex gap-2 w-full">
            <button className="btn-secondary flex-1 btn-large flex items-center justify-center gap-1" onClick={onClose}>
              <ChevronLeft className="icon-sm" />
              <span>Back to Menu</span>
            </button>
            <button className="btn-primary flex-1 btn-large bg-emerald flex items-center justify-center gap-1" onClick={onCompleteWorkout}>
              <CheckCircle2 className="icon-sm" />
              <span>Mark Workout Completed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
