import type { CalisthenicsDayPlan } from '../types';

export const month1Calendar: CalisthenicsDayPlan[] = [
  // --- WEEK 1: FOUNDATION & FORM BUILDING ---
  {
    dayNumber: 1,
    dateString: 'Aug 12, 2026 (TODAY)',
    dayTitle: 'Upper Body Baseline & Form Check',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'No ego reps. 3 clean, controlled push-ups beat 5 saggy ones. Focus on full range of motion.',
    exercises: [
      { name: 'Incline Push-ups (Hands on couch/table)', sets: 3, reps: '8 - 10 reps', restSeconds: 60, notes: 'Warm up shoulders & chest' },
      { name: 'Strict Standard Floor Push-ups', sets: 3, reps: '3 clean reps', restSeconds: 90, notes: 'Keep body in a straight plank line' },
      { name: 'Pull-up Bar Dead Hang', sets: 3, reps: '20 - 30 sec hold', restSeconds: 60, notes: 'Builds grip strength & decompresses spine' },
      { name: 'Hollow Body Hold (Core)', sets: 3, reps: '20 sec hold', restSeconds: 45, notes: 'Press lower back into floor' }
    ]
  },
  {
    dayNumber: 2,
    dateString: 'Aug 13, 2026',
    dayTitle: 'Football Agility & Aerobic Running',
    focusCategory: 'Football & Cardio',
    isRestDay: false,
    hybridCues: 'Legs are strong from 15 yrs of football. Keep upper body fresh while sharpening foot speed.',
    exercises: [
      { name: '5-10-5 Pro Agility Shuttle', sets: 4, reps: '2 right / 2 left', restSeconds: 90, notes: 'Decelerate sharply and explode' },
      { name: '3km Easy Tempo Run or 20m Cycling', sets: 1, reps: '20 - 25 mins', restSeconds: 0, notes: 'Maintain steady aerobic heart rate' }
    ]
  },
  {
    dayNumber: 3,
    dateString: 'Aug 14, 2026',
    dayTitle: 'Upper Body Push-Pull Volume',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Use knee push-ups to accumulate high quality rep volume without frying your central nervous system.',
    exercises: [
      { name: 'Knee Push-ups', sets: 3, reps: '10 - 12 reps', restSeconds: 60, notes: 'Tuck elbows 45 degrees' },
      { name: 'Pull-up Bar Scapular Pulls / Shrugs', sets: 3, reps: '8 reps', restSeconds: 60, notes: 'Pull shoulder blades down and back' },
      { name: 'Bench / Chair Dips', sets: 3, reps: '8 - 10 reps', restSeconds: 60, notes: 'Keep chest open and up' },
      { name: 'Plank Hold', sets: 3, reps: '30 - 40 sec', restSeconds: 45, notes: 'Squeeze glutes & core' }
    ]
  },
  {
    dayNumber: 4,
    dateString: 'Aug 15, 2026',
    dayTitle: 'Winger Finishing & Acceleration Bursts',
    focusCategory: 'Football & Cardio',
    isRestDay: false,
    hybridCues: 'Explosive winger acceleration! Short 15m bursts simulate match-day wing sprints.',
    exercises: [
      { name: '15m Acceleration Sprint Bursts', sets: 6, reps: '15m max sprint', restSeconds: 90, notes: 'Walk back for full recovery' },
      { name: 'Wide Touchline Cut-Inside & Curling Finish', sets: 5, reps: '5 shots', restSeconds: 60, notes: 'Cut inside onto dominant foot' }
    ]
  },
  {
    dayNumber: 5,
    dateString: 'Aug 16, 2026',
    dayTitle: 'Active Recovery & Flexibility',
    focusCategory: 'Core & Recovery',
    isRestDay: true,
    hybridCues: 'Muscles rebuild during rest. Stretch your hip flexors, lats, and chant Veda suktas.',
    exercises: [
      { name: 'Doorway Pec & Lat Stretch', sets: 2, reps: '45 sec hold', restSeconds: 30, notes: 'Opens tight chest & shoulders' },
      { name: 'Ankle & Hip Flexor Mobility Routine', sets: 2, reps: '10 reps each', restSeconds: 30, notes: 'Protects Achilles & hamstrings' }
    ]
  },

  // --- WEEK 2: OVERLOAD & GREASE THE GROOVE ---
  {
    dayNumber: 6,
    dateString: 'Aug 17, 2026',
    dayTitle: 'Grease the Groove Push-up Activation',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Intra-day micro sets! Do 2 clean push-ups every 3 hours during your work day.',
    exercises: [
      { name: 'Intra-day Micro Push-up Sets', sets: 4, reps: '2 clean reps', restSeconds: 0, notes: 'Spread across morning and afternoon' },
      { name: 'Pull-up Bar Inverted Rows', sets: 3, reps: '8 - 10 reps', restSeconds: 60, notes: 'Pull chest to bar level' },
      { name: 'Decline Incline Push-ups', sets: 3, reps: '8 reps', restSeconds: 60, notes: 'Slight incline elevation' }
    ]
  },
  {
    dayNumber: 7,
    dateString: 'Aug 18, 2026',
    dayTitle: 'Cardio, Cycling & Agility',
    focusCategory: 'Football & Cardio',
    isRestDay: false,
    hybridCues: 'Combine cycling endurance with quick feet footwork.',
    exercises: [
      { name: '45 Mins Road/Stationary Cycling', sets: 1, reps: '45 mins', restSeconds: 0, notes: 'Moderate steady pace' },
      { name: 'Agility Ladder Footwork', sets: 4, reps: '5 patterns', restSeconds: 60, notes: 'Quick toes, high cadence' }
    ]
  },
  {
    dayNumber: 8,
    dateString: 'Aug 19, 2026',
    dayTitle: 'Push-Up Density & Core Stability',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Aiming to push your 5-rep max toward 7 clean reps!',
    exercises: [
      { name: 'Standard Push-ups', sets: 4, reps: '4 clean reps', restSeconds: 90, notes: 'Focused push tempo' },
      { name: 'Door Rows / Inverted Rows', sets: 3, reps: '10 reps', restSeconds: 60, notes: 'Full back contraction' },
      { name: 'Hollow Body Hold', sets: 3, reps: '30 sec', restSeconds: 45, notes: 'Keep lower back glued' }
    ]
  },
  {
    dayNumber: 9,
    dateString: 'Aug 20, 2026',
    dayTitle: 'Football HIIT Sprint Conditioning',
    focusCategory: 'Football & Cardio',
    isRestDay: false,
    hybridCues: '30s sprint / 30s jog intervals to mimic 90-minute winger demands.',
    exercises: [
      { name: 'Winger HIIT Sprint Intervals', sets: 8, reps: '30s sprint / 30s jog', restSeconds: 0, notes: 'High intensity cardiovascular output' }
    ]
  },
  {
    dayNumber: 10,
    dateString: 'Aug 21, 2026',
    dayTitle: 'Push-Up Bar Transition & Dips',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Using push-up bars saves wrists and allows deeper chest stretch!',
    exercises: [
      { name: 'Push-Up Bar Neutral Grip Push-ups', sets: 3, reps: '5 reps', restSeconds: 90, notes: 'Deeper stretch at bottom' },
      { name: 'Pull-up Bar Dead Hang & Leg Raises', sets: 3, reps: '6 leg raises', restSeconds: 60, notes: 'Control hip sway' }
    ]
  },
  {
    dayNumber: 11,
    dateString: 'Aug 22, 2026',
    dayTitle: 'MATCH DAY / High Intensity Game',
    focusCategory: 'Match Day',
    isRestDay: false,
    hybridCues: 'Unleash your winger speed on the pitch! Stay hydrated.',
    exercises: [
      { name: 'Full Football Match or 90-Min Game', sets: 1, reps: '90 Mins', restSeconds: 0, notes: 'Winger isolation runs & crosses' }
    ]
  },
  {
    dayNumber: 12,
    dateString: 'Aug 23, 2026',
    dayTitle: 'Post-Match Recovery & Rest',
    focusCategory: 'Core & Recovery',
    isRestDay: true,
    hybridCues: 'Foam rolling, deep breathing, Veda suktas & ukulele practice.',
    exercises: [
      { name: 'Hamstring & Calves Foam Rolling', sets: 1, reps: '15 mins', restSeconds: 0, notes: 'Flush out post-match lactic acid' }
    ]
  },

  // --- WEEK 3: PULL-UP NEGATIVES & PUSH DENSITY ---
  {
    dayNumber: 13,
    dateString: 'Aug 24, 2026',
    dayTitle: 'Pull-Up Negatives & Push-up Density',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Negative pull-ups build full pull-up strength faster than anything else!',
    exercises: [
      { name: 'Negative Pull-ups (Jump up, 5s descent)', sets: 3, reps: '3 slow reps', restSeconds: 90, notes: 'Resist gravity for 5 full seconds' },
      { name: 'Standard Push-ups', sets: 4, reps: '5 clean reps', restSeconds: 90, notes: 'Notice how 5 reps feels easier now!' },
      { name: 'Bench Dips', sets: 3, reps: '10 reps', restSeconds: 60, notes: 'Squeeze triceps at top' }
    ]
  },
  {
    dayNumber: 14,
    dateString: 'Aug 25, 2026',
    dayTitle: 'Tempo Running & Agility',
    focusCategory: 'Football & Cardio',
    isRestDay: false,
    hybridCues: '5km steady pace run to build aerobic engine for 90-minute stamina.',
    exercises: [
      { name: '5km Aerobic Tempo Run', sets: 1, reps: '25 - 30 mins', restSeconds: 0, notes: 'Nasal breathing focus' }
    ]
  },
  {
    dayNumber: 15,
    dateString: 'Aug 26, 2026',
    dayTitle: 'Upper Body Power & Core',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Focus on smooth explosive ascent on push-ups.',
    exercises: [
      { name: 'Push-Up Bar Explosive Push-ups', sets: 4, reps: '5 reps', restSeconds: 90, notes: 'Push off ground with speed' },
      { name: 'Negative Pull-ups', sets: 3, reps: '4 slow reps', restSeconds: 90, notes: 'Lower down under control' }
    ]
  },
  {
    dayNumber: 16,
    dateString: 'Aug 27, 2026',
    dayTitle: 'Winger Speed & Agility Drills',
    focusCategory: 'Football & Cardio',
    isRestDay: false,
    hybridCues: 'Sharp directional changes for beating defenders.',
    exercises: [
      { name: '5-10-5 Pro Agility Shuttle', sets: 5, reps: '5 rounds', restSeconds: 90, notes: 'Low center of gravity' }
    ]
  },
  {
    dayNumber: 17,
    dateString: 'Aug 28, 2026',
    dayTitle: 'Weighted Vest Intro / High Rep Push',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'If vest is ready, wear light 2kg-4kg vest OR do high rep knee pushups!',
    exercises: [
      { name: 'Standard Push-ups (Light Vest optional)', sets: 4, reps: '6 reps', restSeconds: 90, notes: 'Quality over quantity' },
      { name: 'Inverted Rows', sets: 3, reps: '12 reps', restSeconds: 60, notes: 'Touch chest to bar' }
    ]
  },
  {
    dayNumber: 18,
    dateString: 'Aug 29, 2026',
    dayTitle: 'MATCH DAY / Weekend Game',
    focusCategory: 'Match Day',
    isRestDay: false,
    hybridCues: 'Compete hard! Your upper body core stability will protect you in 1v1 shoulder clashes.',
    exercises: [
      { name: 'Full Football Match', sets: 1, reps: '90 Mins', restSeconds: 0, notes: 'Explosive wing play' }
    ]
  },
  {
    dayNumber: 19,
    dateString: 'Aug 30, 2026',
    dayTitle: 'Rest & Veda Chanting Recovery',
    focusCategory: 'Core & Recovery',
    isRestDay: true,
    hybridCues: 'Total recovery day. Walk, stretch, chant Shri Suktam.',
    exercises: [
      { name: 'Full Body Dynamic Stretch', sets: 1, reps: '20 mins', restSeconds: 0, notes: 'Relax joints' }
    ]
  },

  // --- WEEK 4: MONTH 1 BENCHMARK TEST & PROGRESSION ---
  {
    dayNumber: 20,
    dateString: 'Aug 31, 2026',
    dayTitle: 'MONTH 1 PUSH-UP MAX TEST DAY!',
    focusCategory: 'Upper Push/Pull',
    isRestDay: false,
    hybridCues: 'Today we test your new max push-up rep count! Target: 10-12 clean strict reps!',
    exercises: [
      { name: 'Warm-up Incline Push-ups', sets: 2, reps: '8 reps', restSeconds: 60, notes: 'Get blood flowing' },
      { name: 'MAX PUSH-UP TEST SET', sets: 1, reps: 'MAX REPS', restSeconds: 180, notes: 'Record your new unbroken max record!' },
      { name: 'First Strict Unassisted Pull-up Attempt', sets: 3, reps: '1 - 2 reps', restSeconds: 120, notes: 'Attempt full chin over bar' }
    ]
  }
];
