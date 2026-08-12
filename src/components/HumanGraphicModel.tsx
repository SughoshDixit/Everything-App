import React from 'react';

interface HumanGraphicModelProps {
  exerciseType: 'pushup' | 'incline' | 'hang' | 'hollow' | 'circles' | 'default';
  gender?: 'male' | 'female';
}

export const HumanGraphicModel: React.FC<HumanGraphicModelProps> = ({
  exerciseType,
  gender = 'male'
}) => {
  const shirtColor = gender === 'male' ? '#06B6D4' : '#8B5CF6';
  const shortsColor = '#1E293B';
  const hairColor = '#334155';

  return (
    <div className="human-graphic-container">
      <svg className="human-svg" viewBox="0 0 320 220">
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={shirtColor} />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. ARM CIRCLES (Sample1.mp4 Reference Human Character) */}
        {exerciseType === 'circles' && (
          <g className="circles-human-group" filter="url(#shadow)">
            {/* Mat floor shadow */}
            <ellipse cx="160" cy="205" rx="50" ry="6" fill="rgba(0,0,0,0.3)" />

            {/* Legs & Shoes */}
            <rect x="142" y="140" width="14" height="60" rx="6" fill={shortsColor} />
            <rect x="164" y="140" width="14" height="60" rx="6" fill={shortsColor} />
            <ellipse cx="149" cy="202" rx="10" ry="4" fill="#64748B" />
            <ellipse cx="171" cy="202" rx="10" ry="4" fill="#64748B" />

            {/* Torso & Tank Top */}
            <path d="M 136 75 L 184 75 L 176 142 L 144 142 Z" fill="url(#shirtGrad)" rx="6" />

            {/* Head & Hair */}
            <circle cx="160" cy="52" r="18" fill="url(#skinGrad)" />
            <path d="M 144 48 Q 160 32 176 48 Q 160 38 144 48 Z" fill={hairColor} />
            {/* Neck */}
            <rect x="154" y="66" width="12" height="10" fill="url(#skinGrad)" />

            {/* Animated Circular Arms */}
            <g className="anim-arm-left">
              <path d="M 136 80 L 70 80" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="65" cy="80" r="7" fill="url(#skinGrad)" />
              {/* Circular motion aura */}
              <ellipse cx="65" cy="80" rx="18" ry="18" fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4,4" className="animate-spin" />
            </g>

            <g className="anim-arm-right">
              <path d="M 184 80 L 250 80" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="255" cy="80" r="7" fill="url(#skinGrad)" />
              <ellipse cx="255" cy="80" rx="18" ry="18" fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4,4" className="animate-spin" />
            </g>
          </g>
        )}

        {/* 2. STRICT FLOOR PUSH-UP HUMAN CHARACTER */}
        {(exerciseType === 'pushup' || exerciseType === 'default') && (
          <g className="pushup-human-group" filter="url(#shadow)">
            {/* Floor Mat Line */}
            <line x1="30" y1="180" x2="290" y2="180" stroke="#475569" strokeWidth="6" strokeLinecap="round" />

            {/* Animated Body lowering and pushing */}
            <g className="pushup-body-anim">
              {/* Head */}
              <circle cx="85" cy="120" r="16" fill="url(#skinGrad)" />
              <path d="M 72 115 Q 85 102 98 115 Z" fill={hairColor} />

              {/* Torso / Shirt */}
              <rect x="95" y="112" width="90" height="34" rx="10" fill="url(#shirtGrad)" transform="rotate(5 95 112)" />

              {/* Legs / Shorts */}
              <rect x="180" y="122" width="75" height="24" rx="8" fill={shortsColor} transform="rotate(5 180 122)" />
              {/* Feet on toes */}
              <ellipse cx="255" cy="138" rx="8" ry="6" fill="#64748B" />

              {/* Bended Arms */}
              <path d="M 105 130 L 105 178" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" />
              <path d="M 115 130 L 115 178" stroke="url(#skinGrad)" strokeWidth="10" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 3. INCLINE PUSH-UP HUMAN CHARACTER */}
        {exerciseType === 'incline' && (
          <g className="incline-human-group" filter="url(#shadow)">
            {/* Elevated Bench/Couch Box */}
            <rect x="30" y="120" width="70" height="70" fill="#334155" rx="8" />
            <line x1="20" y1="190" x2="300" y2="190" stroke="#475569" strokeWidth="6" />

            {/* Incline Plank Body */}
            <g className="incline-body-anim">
              <circle cx="100" cy="95" r="16" fill="url(#skinGrad)" />
              <rect x="110" y="88" width="90" height="32" rx="10" fill="url(#shirtGrad)" transform="rotate(25 110 88)" />
              <rect x="190" y="125" width="80" height="22" rx="8" fill={shortsColor} transform="rotate(25 190 125)" />
              <path d="M 105 105 L 85 125" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 4. PULL-UP BAR DEAD HANG HUMAN CHARACTER */}
        {exerciseType === 'hang' && (
          <g className="hang-human-group" filter="url(#shadow)">
            {/* Pull Up Bar */}
            <line x1="60" y1="25" x2="260" y2="25" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" />
            <rect x="75" y="10" width="10" height="15" fill="#64748B" />
            <rect x="235" y="10" width="10" height="15" fill="#64748B" />

            {/* Hanging Human Body */}
            <g className="hang-body-anim">
              {/* Hands on bar */}
              <circle cx="125" cy="25" r="7" fill="url(#skinGrad)" />
              <circle cx="195" cy="25" r="7" fill="url(#skinGrad)" />
              {/* Arms */}
              <line x1="125" y1="25" x2="145" y2="65" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" />
              <line x1="195" y1="25" x2="175" y2="65" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" />
              {/* Head */}
              <circle cx="160" cy="72" r="16" fill="url(#skinGrad)" />
              {/* Torso */}
              <rect x="140" y="88" width="40" height="65" rx="8" fill="url(#shirtGrad)" />
              {/* Legs */}
              <rect x="144" y="152" width="14" height="55" rx="6" fill={shortsColor} />
              <rect x="162" y="152" width="14" height="55" rx="6" fill={shortsColor} />
            </g>
          </g>
        )}

        {/* 5. HOLLOW HOLD HUMAN CHARACTER */}
        {exerciseType === 'hollow' && (
          <g className="hollow-human-group" filter="url(#shadow)">
            <line x1="30" y1="170" x2="290" y2="170" stroke="#475569" strokeWidth="6" />

            {/* Curved Body */}
            <g className="hollow-body-anim">
              <path d="M 60 120 Q 160 175 260 120" fill="none" stroke="url(#shirtGrad)" strokeWidth="36" strokeLinecap="round" />
              <circle cx="50" cy="115" r="16" fill="url(#skinGrad)" />
              <path d="M 255 115 L 285 105" stroke="url(#skinGrad)" strokeWidth="14" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
