import type {
  RoutineItem,
  MotivationalQuote,
  CalisthenicsExercise,
  FootballDrill,
  CarnaticYouTubeItem,
  InstrumentSong,
  VedaSukta,
  UserStats,
  StravaActivityPost
} from '../types';

const KEYS = {
  ROUTINES: 'everything_app_routines',
  QUOTES: 'everything_app_quotes',
  CALISTHENICS: 'everything_app_calisthenics',
  WORKOUT_LOGS: 'everything_app_workout_logs',
  FOOTBALL_DRILLS: 'everything_app_football',
  NUTRITION: 'everything_app_nutrition',
  CARNATIC: 'everything_app_carnatic',
  INSTRUMENTS: 'everything_app_instruments',
  VEDAS: 'everything_app_vedas',
  STATS: 'everything_app_stats',
  PERIOD_LOGS: 'everything_app_period_logs',
  PERIOD_SETTINGS: 'everything_app_period_settings',
  GPS_ACTIVITIES: 'everything_app_gps_activities',
  PERSONAL_MILESTONES: 'everything_app_personal_milestones',
  MAPS_API_KEY: 'everything_app_maps_api_key',
  STRAVA_POSTS: 'everything_app_strava_posts',
  COMPILED_BUFFER: 'everything_app_compiled_activities_buffer'
};

// Initial Pre-loaded Data
export const initialRoutines: RoutineItem[] = [
  {
    id: 'r1',
    title: 'Morning Veda Chanting & Mindful Breathing',
    category: 'morning',
    timeOfDay: '06:30 AM',
    durationMinutes: 20,
    completed: false,
    assignedTo: 'men',
    icon: 'BookOpen'
  },
  {
    id: 'r2',
    title: 'Joint Morning Hydration & Intentions',
    category: 'morning',
    timeOfDay: '07:00 AM',
    durationMinutes: 10,
    completed: false,
    assignedTo: 'both',
    icon: 'Sun'
  },
  {
    id: 'r3',
    title: 'Beginner Calisthenics Routine (Push, Pull, Core)',
    category: 'fitness',
    timeOfDay: '07:30 AM',
    durationMinutes: 45,
    completed: false,
    assignedTo: 'men',
    icon: 'Dumbbell'
  },
  {
    id: 'r4',
    title: 'Carnatic Classical Abhyasa (Raga/Kriti Practice)',
    category: 'music_veda',
    timeOfDay: '06:00 PM',
    durationMinutes: 45,
    completed: false,
    assignedTo: 'men',
    icon: 'Music'
  },
  {
    id: 'r5',
    title: 'Ukulele / Guitar Casual Sing-Along Session',
    category: 'music_veda',
    timeOfDay: '07:30 PM',
    durationMinutes: 30,
    completed: false,
    assignedTo: 'both',
    icon: 'Guitar'
  },
  {
    id: 'r6',
    title: 'Evening Full-Body Stretch & Sleep Preparation',
    category: 'evening',
    timeOfDay: '10:00 PM',
    durationMinutes: 15,
    completed: false,
    assignedTo: 'both',
    icon: 'Moon'
  }
];

export const initialQuotes: MotivationalQuote[] = [
  {
    id: 'q1',
    text: 'Consistency beats intensity when intensity is only once a week. Master the daily routine.',
    author: 'Self-Discipline Principles',
    category: 'discipline',
    addedBy: 'system'
  },
  {
    id: 'q2',
    text: 'A forward winger wins the match with explosive acceleration in the 85th minute, built on disciplined morning workouts.',
    author: 'Football Mindset',
    category: 'football',
    addedBy: 'men'
  },
  {
    id: 'q3',
    text: 'Form before reps. Clean movements build real body control, flexibility, and lean strength.',
    author: 'Calisthenics Mastery',
    category: 'calisthenics',
    addedBy: 'system'
  },
  {
    id: 'q4',
    text: 'True freedom comes from deep self-discipline. When you master your daily habits, everything is possible.',
    author: 'Performance Motto',
    category: 'consistency',
    addedBy: 'women'
  }
];

export const initialCalisthenics: CalisthenicsExercise[] = [
  {
    id: 'c1',
    name: 'Knee / Incline Push-Ups',
    category: 'push',
    progressionLevel: 'beginner',
    description: 'Foundational chest and tricep builder. Keep elbows tucked at 45 degrees and body in a straight plank line.',
    keyCues: ['Tuck elbows at 45°', 'Squeeze glutes & core', 'Touch chest to floor smoothly'],
    targetMuscles: ['Chest', 'Anterior Deltoids', 'Triceps'],
    recommendedSets: 3,
    recommendedReps: '8 - 12 reps',
    restSeconds: 60,
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c2',
    name: 'Standard Bodyweight Push-Ups',
    category: 'push',
    progressionLevel: 'beginner',
    description: 'Full plank push-up. Essential upper body press for athletic shoulder stability.',
    keyCues: ['Straight line from head to heels', 'Full range of motion', 'Exhale on push upward'],
    targetMuscles: ['Chest', 'Triceps', 'Core'],
    recommendedSets: 3,
    recommendedReps: '6 - 10 reps',
    restSeconds: 60,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c3',
    name: 'Inverted Door/Table Rows',
    category: 'pull',
    progressionLevel: 'beginner',
    description: 'Pulls the body weight upward using back muscles. Essential for pull-up strength and posture.',
    keyCues: ['Pull chest to hands', 'Squeeze shoulder blades together', 'Maintain neutral spine'],
    targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
    recommendedSets: 3,
    recommendedReps: '8 - 12 reps',
    restSeconds: 60,
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c4',
    name: 'Air Squats & Reverse Lunges',
    category: 'legs',
    progressionLevel: 'beginner',
    description: 'Builds lower body endurance and knee stability without adding bulky mass.',
    keyCues: ['Knees track inline with toes', 'Chest up', 'Drive through heels'],
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    recommendedSets: 3,
    recommendedReps: '12 - 15 reps',
    restSeconds: 60,
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c5',
    name: 'Bench / Chair Dips',
    category: 'dip',
    progressionLevel: 'beginner',
    description: 'Targets triceps and shoulder extension strength.',
    keyCues: ['Keep back close to bench', 'Lower until elbows reach 90°', 'Press up firmly'],
    targetMuscles: ['Triceps', 'Lower Chest'],
    recommendedSets: 3,
    recommendedReps: '8 - 12 reps',
    restSeconds: 60
  },
  {
    id: 'c6',
    name: 'Hollow Body Hold & Planks',
    category: 'core',
    progressionLevel: 'beginner',
    description: 'Core stability foundation for sprint power and gymnastics control.',
    keyCues: ['Lower back pressed flat against floor', 'Point toes', 'Breathe steadily'],
    targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    recommendedSets: 3,
    recommendedReps: '30 - 45 sec hold',
    restSeconds: 45
  }
];

export const initialFootballDrills: FootballDrill[] = [
  {
    id: 'f1',
    title: '5-10-5 Pro Agility Shuttle',
    category: 'agility',
    positionFocus: 'Forward / Winger',
    intensity: 'High',
    durationMinutes: 15,
    instructions: [
      'Set 3 cones 5 yards apart in a line (Cones A, B, C).',
      'Start at center Cone B in low athletic stance.',
      'Explode right to Cone A (5yd), touch line with right hand.',
      'Slightly turn and sprint left to Cone C (10yd), touch line.',
      'Burst back sprint through center Cone B (5yd).'
    ],
    coneSetup: 'Line of 3 cones (5 yards apart)',
    keyBenefits: ['Rapid deceleration', 'Sharp directional cuts on wing', 'Ankle stability']
  },
  {
    id: 'f2',
    title: 'Explosive 15m Acceleration Sprint Bursts',
    category: 'acceleration',
    positionFocus: 'Forward / Winger',
    intensity: 'Extreme',
    durationMinutes: 20,
    instructions: [
      'Set start line and finish cone at 15 meters.',
      'Perform 6 max effort sprints with 90s full recovery walk-backs between reps.',
      'Drive arms aggressively and stay low for first 5 meters.'
    ],
    coneSetup: 'Start line + 15m finish marker',
    keyBenefits: ['Beating fullbacks off the line', 'Fast-twitch muscle activation', 'Top acceleration']
  },
  {
    id: 'f3',
    title: 'Wide Touchline Cut-Inside & Finish',
    category: 'finishing',
    positionFocus: 'Forward / Winger',
    intensity: 'High',
    durationMinutes: 25,
    instructions: [
      'Dribble at high speed along the wide flank cone.',
      'Execute sharp chop / stepover to cut inside onto dominant foot.',
      'Take 1 touch into space and curl shot into far side goal corner.'
    ],
    coneSetup: 'Flank dribble line + defender cone + Goal target',
    keyBenefits: ['Winger signature move', 'Curling shots', 'High speed ball control']
  }
];

export const initialCarnaticItems: CarnaticYouTubeItem[] = [
  {
    id: 'm1',
    raga: 'Hamsadhwani',
    kritiName: 'Vatapi Ganapatim',
    composer: 'Muthuswami Dikshitar',
    status: 'Practice',
    notes: 'Focusing on clean Gamakas in Swaras. Preparing audio setup for YouTube cover video.'
  },
  {
    id: 'm2',
    raga: 'Mayamalavagowla',
    kritiName: 'Tulasi Bilva',
    composer: 'Tyagaraja',
    status: 'Learning',
    notes: 'Working on Sahitya pronunciation and steady Talam.'
  }
];

export const initialInstrumentSongs: InstrumentSong[] = [
  {
    id: 'i1',
    title: 'Riptide',
    instrument: 'Ukulele',
    genre: 'Pop',
    difficulty: 'Easy',
    status: 'Restaurant Ready',
    chords: ['Am', 'G', 'C']
  },
  {
    id: 'i2',
    title: 'Perfect',
    instrument: 'Guitar',
    genre: 'Acoustic',
    difficulty: 'Medium',
    status: 'Learning',
    chords: ['G', 'Em', 'C', 'D']
  }
];

export const initialVedaSuktas: VedaSukta[] = [
  {
    id: 'v1',
    name: 'Purusha Suktam',
    transliteration: 'Sahasra Śīrṣā Puruṣaḥ...',
    totalVerses: 24,
    memorizedVerses: 16,
    notes: 'Focusing on correct Svara accents (Udatta / Anudatta).'
  },
  {
    id: 'v2',
    name: 'Shri Suktam',
    transliteration: 'Hiraṇyavarṇāṁ Hariṇīṁ...',
    totalVerses: 15,
    memorizedVerses: 10,
    notes: 'Daily morning recitation.'
  }
];

export const initialStravaPosts: StravaActivityPost[] = [
  {
    id: 'sp_1',
    date: 'Aug 21, 2026',
    timestamp: Date.now() - 3600000 * 3,
    userId: 'men',
    title: 'Morning 5.2 km Aerobic Tempo Run 🏃💨',
    description: 'Crisp morning intervals through the park. Felt super light on the feet with Nike Pegasus 40s! Closed the last 1km in 4:40.',
    sportType: 'run',
    rpe: 8,
    totalDistanceKm: 5.24,
    totalMoveMinutes: 26,
    avgPaceMinKm: '4:58 /km',
    avgSpeedKmh: 12.1,
    elevationGainMeters: 48,
    totalCalories: 420,
    totalHeartPoints: 34,
    sufferScore: 78,
    likesCount: 14,
    isLiked: true,
    backgroundTheme: 'strava_sunset',
    motivationalQuote: 'Consistency beats intensity when intensity is only once a week.',
    quoteAuthor: 'Self-Discipline Principles',
    activities: [
      {
        id: 'a1',
        category: 'gps_run',
        title: '5.2 km Morning Tempo Run',
        details: '26:14 • Avg Pace 4:58/km • +48m Elevation',
        includedInPost: true
      }
    ],
    splits: [
      { splitNumber: 1, distanceLabel: '1.0 km', distanceMeters: 1000, durationSeconds: 305, paceMinKm: '5:05 /km', elevationDeltaMeters: +8, speedKmh: 11.8 },
      { splitNumber: 2, distanceLabel: '2.0 km', distanceMeters: 1000, durationSeconds: 298, paceMinKm: '4:58 /km', elevationDeltaMeters: -4, speedKmh: 12.1 },
      { splitNumber: 3, distanceLabel: '3.0 km', distanceMeters: 1000, durationSeconds: 292, paceMinKm: '4:52 /km', elevationDeltaMeters: +12, speedKmh: 12.3 },
      { splitNumber: 4, distanceLabel: '4.0 km', distanceMeters: 1000, durationSeconds: 300, paceMinKm: '5:00 /km', elevationDeltaMeters: +5, speedKmh: 12.0 },
      { splitNumber: 5, distanceLabel: '5.0 km', distanceMeters: 1000, durationSeconds: 280, paceMinKm: '4:40 /km', elevationDeltaMeters: -7, speedKmh: 12.9 }
    ],
    comments: [
      {
        id: 'c1',
        userId: 'women',
        userName: 'Shreya Dixit',
        avatar: '👩',
        text: 'Insane 5th split pace! Keep flying! 🔥',
        timestamp: Date.now() - 3600000 * 2
      }
    ]
  },
  {
    id: 'sp_2',
    date: 'Aug 20, 2026',
    timestamp: Date.now() - 3600000 * 26,
    userId: 'men',
    title: 'Explosive Upper Body Calisthenics Routine 💪⚡',
    description: 'Diamond push-ups, weighted dips, and strict deadhang pull-ups. Total volume: 16 sets across 180 clean reps.',
    sportType: 'calisthenics',
    rpe: 9,
    totalDistanceKm: 0,
    totalMoveMinutes: 45,
    totalSets: 16,
    totalReps: 180,
    elevationGainMeters: 0,
    totalCalories: 510,
    totalHeartPoints: 40,
    sufferScore: 85,
    likesCount: 19,
    isLiked: false,
    backgroundTheme: 'cyber_neon',
    motivationalQuote: 'The body achieves what the mind believes.',
    quoteAuthor: 'Napoleon Hill',
    activities: [
      {
        id: 'a2',
        category: 'calisthenics',
        title: 'Calisthenics Power Circuit',
        details: 'Diamond Push-ups (4x20) • Pull-ups (4x10) • Dips (4x15) • Plank (4x60s)',
        includedInPost: true
      }
    ],
    comments: [
      {
        id: 'c2',
        userId: 'women',
        userName: 'Shreya Dixit',
        avatar: '👩',
        text: 'Beast mode consistency! 👏',
        timestamp: Date.now() - 3600000 * 24
      }
    ]
  },
  {
    id: 'sp_3',
    date: 'Aug 19, 2026',
    timestamp: Date.now() - 3600000 * 50,
    userId: 'men',
    title: 'Football Winger Technical Drills & Sprints ⚽⚡',
    description: '1v1 cut-inside agility cones and 30m maximum acceleration sprints. Winger sharpness is peaking.',
    sportType: 'football',
    rpe: 8,
    totalDistanceKm: 4.1,
    totalMoveMinutes: 40,
    avgPaceMinKm: '5:20 /km',
    avgSpeedKmh: 14.8,
    elevationGainMeters: 22,
    totalCalories: 460,
    totalHeartPoints: 36,
    sufferScore: 80,
    likesCount: 11,
    isLiked: false,
    backgroundTheme: 'electric_aurora',
    motivationalQuote: 'Football is played with the head. Your feet are just the tools.',
    quoteAuthor: 'Andrea Pirlo',
    activities: [
      {
        id: 'a3',
        category: 'football',
        title: 'Winger Speed & Cone Mastery',
        details: 'Cone Slalom • 1v1 Cut-ins • 10x30m Acceleration Sprints',
        includedInPost: true
      }
    ]
  }
];

export const initialStats: UserStats = {
  menStreak: 5,
  womenStreak: 7,
  coupleStreak: 5,
  menDisciplineScore: 85,
  womenDisciplineScore: 92
};

// Helper Storage Getters & Setters
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export { KEYS };
