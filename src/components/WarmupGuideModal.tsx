import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft } from 'lucide-react';

interface WarmupGuideModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export const WarmupGuideModal: React.FC<WarmupGuideModalProps> = ({ onClose, onComplete }) => {
  const warmupSteps = [
    {
      title: '1. Wrist & Forearm Circles',
      reps: '10 Inward + 10 Outward',
      durationSeconds: 20,
      description: 'Rotate wrists smoothly at a comfortable human tempo to lubricate joints before push-ups.',
      speech: 'Step 1: Wrist and Forearm Circles. Rotate 10 reps inward, then 10 reps outward. Move smoothly and comfortably.',
      type: 'wrist'
    },
    {
      title: '2. Arm Circles & Shoulder Dislocates',
      reps: '10 Forward + 10 Backward',
      durationSeconds: 25,
      description: 'Make big, comfortable arm circles to warm up rotator cuffs and shoulder joints.',
      speech: 'Step 2: Arm Circles. Make 10 big circles forward, then 10 circles backward. Keep chest open.',
      type: 'arms'
    },
    {
      title: '3. Chest Dynamic Hugs',
      reps: '10 Dynamic Reps',
      durationSeconds: 20,
      description: 'Open arms wide and cross them over chest to dynamically stretch pecs and upper lats.',
      speech: 'Step 3: Chest Dynamic Hugs. Open arms wide and hug across your chest for 10 reps.',
      type: 'chest'
    },
    {
      title: '4. Cat-Cow Spine Lubrication',
      reps: '10 Slow Reps',
      durationSeconds: 30,
      description: 'On hands and knees, arch and round your spine comfortably to wake up core stability.',
      speech: 'Step 4: Cat-Cow Spine Lubrication. Arch and round your back for 10 slow, controlled reps.',
      type: 'catcow'
    }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(warmupSteps[0].durationSeconds);

  const currentStep = warmupSteps[currentStepIndex];

  // Speech Helper
  const speakStep = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Humane, relaxed speed
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger speech when step changes
  useEffect(() => {
    speakStep(currentStep.speech);
    setSecondsLeft(currentStep.durationSeconds);
  }, [currentStepIndex]);

  // Humane Tempo Timer Interval
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Advance step
            if (currentStepIndex + 1 < warmupSteps.length) {
              setCurrentStepIndex((idx) => idx + 1);
            } else {
              setIsPlaying(false);
              speakStep('Warm-up protocol complete! Outstanding job Sughosh.');
              onComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, secondsLeft, currentStepIndex, warmupSteps.length, onComplete]);

  const handleTogglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if ('speechSynthesis' in window) window.speechSynthesis.pause();
    } else {
      setIsPlaying(true);
      if ('speechSynthesis' in window) window.speechSynthesis.resume();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card animated-guide-modal animate-scale-up">
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-3">
          <button className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1" onClick={onClose}>
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <div className="text-center">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">DYNAMIC WARM-UP</span>
            <h2 className="text-sm md:text-base font-black text-main mt-0.5">{currentStep.title}</h2>
          </div>
          <button className="btn-google-icon" onClick={onClose} aria-label="Close Warm-Up">
            &times;
          </button>
        </div>

        {/* Humane Animated Demonstration Box */}
        <div className="anim-demonstrator-box glass-card mb-3">
          <div className="anim-header">
            <span className="badge-pill bg-cyan">STEP {currentStepIndex + 1} OF {warmupSteps.length}</span>
            <span className="text-amber font-extrabold text-xl">{secondsLeft}s Remaining</span>
          </div>

          <div className="human-figure-stage">
            <svg className="anim-svg" viewBox="0 0 300 160">
              <circle cx="150" cy="50" r="14" fill="#06B6D4" />
              <line x1="150" y1="64" x2="150" y2="120" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />

              {/* Humane Animated Motion per type */}
              {currentStep.type === 'wrist' && (
                <g className="animate-pulse">
                  <line x1="150" y1="80" x2="110" y2="90" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
                  <line x1="150" y1="80" x2="190" y2="90" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="105" cy="90" r="6" fill="#10B981" />
                  <circle cx="195" cy="90" r="6" fill="#10B981" />
                </g>
              )}

              {currentStep.type === 'arms' && (
                <g className="animate-spin" style={{ transformOrigin: '150px 80px', animationDuration: '4s' }}>
                  <line x1="150" y1="80" x2="110" y2="50" stroke="#F59E0B" strokeWidth="6" />
                  <line x1="150" y1="80" x2="190" y2="110" stroke="#F59E0B" strokeWidth="6" />
                </g>
              )}

              {currentStep.type === 'chest' && (
                <g className="animate-pulse">
                  <line x1="150" y1="80" x2="100" y2="80" stroke="#10B981" strokeWidth="6" />
                  <line x1="150" y1="80" x2="200" y2="80" stroke="#10B981" strokeWidth="6" />
                </g>
              )}

              {currentStep.type === 'catcow' && (
                <path d="M 100 110 Q 150 80 200 110" fill="none" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
              )}
            </svg>
          </div>

          <p className="text-sub text-sm mt-2 text-center">&bull; {currentStep.description}</p>
        </div>

        {/* Play / Pause / Step Controls */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <button className="btn-primary w-full" onClick={handleTogglePlayPause}>
            {isPlaying ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
            <span>{isPlaying ? '⏸️ Pause Warm-Up & Voice' : '▶️ Resume Warm-Up'}</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              if (currentStepIndex + 1 < warmupSteps.length) setCurrentStepIndex((i) => i + 1);
            }}
          >
            Skip Step &gt;
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex gap-1 justify-center">
          {warmupSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full ${
                idx === currentStepIndex ? 'bg-cyan' : idx < currentStepIndex ? 'bg-emerald' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
