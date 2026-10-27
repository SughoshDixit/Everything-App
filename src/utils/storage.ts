import type {
  RoutineItem,
  MotivationalQuote,
  CalisthenicsExercise,
  FootballDrill,
  CarnaticYouTubeItem,
  InstrumentSong,
  VedaSukta,
  UserStats,
  StravaActivityPost,
  GpsActivityLog
} from '../types';
import {
  CUBBON_PARK_POINTS,
  SOUTH_UNITED_PITCH_POINTS,
  NANDI_HILLS_POINTS,
  TURAHALLI_FOREST_POINTS
} from './routeGeometryGenerator';

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

const now = Date.now();
const todayDateStr = new Date(now).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const yesterdayDateStr = new Date(now - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const twoDaysAgoDateStr = new Date(now - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const threeDaysAgoDateStr = new Date(now - 86400000 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const initialGpsActivities: GpsActivityLog[] = [
  {
    id: 'gps_act_cubbon',
    title: 'Morning miles, clear mind.',
    activityType: 'run',
    date: todayDateStr,
    startTime: now - 3600000 * 4,
    endTime: now - 3600000 * 4 + 1452000,
    durationSeconds: 1452,
    distanceKm: 5.24,
    avgSpeedKmh: 13.0,
    topSpeedKmh: 15.8,
    maxSpeedKmh: 15.8,
    avgPaceMinKm: '4:37 /km',
    elevationGainMeters: 48,
    caloriesBurned: 425,
    heartPointsEarned: 36,
    stepsCount: 6120,
    userId: 'men',
    notes: 'Crisp morning intervals through Cubbon Park. High-cadence stride in Nike Pegasus. Closed split 5 in 4:21!',
    splits: [
      { splitNumber: 1, distanceLabel: '1.0 km', distanceMeters: 1000, durationSeconds: 285, paceMinKm: '4:45 /km', elevationDeltaMeters: 6, speedKmh: 12.6 },
      { splitNumber: 2, distanceLabel: '2.0 km', distanceMeters: 1000, durationSeconds: 280, paceMinKm: '4:40 /km', elevationDeltaMeters: -2, speedKmh: 12.9 },
      { splitNumber: 3, distanceLabel: '3.0 km', distanceMeters: 1000, durationSeconds: 275, paceMinKm: '4:35 /km', elevationDeltaMeters: 8, speedKmh: 13.1 },
      { splitNumber: 4, distanceLabel: '4.0 km', distanceMeters: 1000, durationSeconds: 272, paceMinKm: '4:32 /km', elevationDeltaMeters: 4, speedKmh: 13.2 },
      { splitNumber: 5, distanceLabel: '5.0 km', distanceMeters: 1000, durationSeconds: 261, paceMinKm: '4:21 /km', elevationDeltaMeters: -5, speedKmh: 13.8 }
    ],
    routePoints: CUBBON_PARK_POINTS,
    milestonesReached: ['ALL-TIME RECORD: FASTEST 1K (4:21)', 'SEASON BEST: 5K PACE (4:37 /km)'],
    recordBadges: [
      {
        id: 'rb_1',
        category: 'fastest',
        tier: 'all_time_record',
        title: 'ALL-TIME RECORD: FASTEST 1K',
        statLabel: '4:21 (13.8 km/h)',
        previousRecord: 'Previous: 4:32',
        icon: '⚡',
        color: 'amber'
      },
      {
        id: 'rb_2',
        category: 'fastest',
        tier: 'season_best',
        title: 'SEASON BEST: 5K PACE',
        statLabel: '4:37 /km (24m 12s)',
        previousRecord: 'Previous: 4:48',
        icon: '🏆',
        color: 'rose'
      }
    ]
  },
  {
    id: 'gps_act_south_united',
    title: 'Own the left wing.',
    activityType: 'football',
    date: yesterdayDateStr,
    startTime: now - 86400000 - 3600000 * 3,
    endTime: now - 86400000 - 3600000 * 3 + 4104000,
    durationSeconds: 4104,
    distanceKm: 7.82,
    avgSpeedKmh: 6.8,
    topSpeedKmh: 29.4,
    maxSpeedKmh: 29.4,
    avgPaceMinKm: '8:45 /km',
    elevationGainMeters: 15,
    caloriesBurned: 680,
    heartPointsEarned: 44,
    stepsCount: 9240,
    userId: 'men',
    notes: 'South United Football Club pitch battle. Full matchday intensity, explosive cut-backs, and 12 maximum sprints.',
    splits: [
      { splitNumber: 1, distanceLabel: 'First Half', distanceMeters: 3910, durationSeconds: 2052, paceMinKm: '8:45 /km', elevationDeltaMeters: 8, speedKmh: 6.8 },
      { splitNumber: 2, distanceLabel: 'Second Half', distanceMeters: 3910, durationSeconds: 2052, paceMinKm: '8:45 /km', elevationDeltaMeters: 7, speedKmh: 6.8 }
    ],
    routePoints: SOUTH_UNITED_PITCH_POINTS,
    milestonesReached: ['TOP SPRINT SPEED: 29.4 KM/H', 'TACTICAL MATCHDAY WARRIOR'],
    recordBadges: [
      {
        id: 'rb_fb',
        category: 'fastest',
        tier: 'all_time_record',
        title: 'TOP SPRINT SPEED: 29.4 KM/H',
        statLabel: '29.4 km/h Pitch Sprint',
        icon: '⚽',
        color: 'emerald'
      }
    ]
  },
  {
    id: 'gps_act_nandi_hills',
    title: 'The long way home.',
    activityType: 'cycle',
    date: twoDaysAgoDateStr,
    startTime: now - 86400000 * 2 - 3600000 * 5,
    endTime: now - 86400000 * 2 - 3600000 * 5 + 6128000,
    durationSeconds: 6128,
    distanceKm: 42.6,
    avgSpeedKmh: 25.0,
    topSpeedKmh: 48.2,
    maxSpeedKmh: 48.2,
    avgPaceMinKm: '2:24 /km',
    elevationGainMeters: 560,
    caloriesBurned: 940,
    heartPointsEarned: 52,
    stepsCount: 1200,
    userId: 'men',
    notes: 'Epic Nandi Hills endurance ride. Conquered 560m elevation climb with sustained cadence and explosive descent.',
    splits: [
      { splitNumber: 1, distanceLabel: '10.0 km', distanceMeters: 10000, durationSeconds: 1440, paceMinKm: '2:24 /km', elevationDeltaMeters: 120, speedKmh: 25.0 },
      { splitNumber: 2, distanceLabel: '20.0 km', distanceMeters: 10000, durationSeconds: 1560, paceMinKm: '2:36 /km', elevationDeltaMeters: 240, speedKmh: 23.1 },
      { splitNumber: 3, distanceLabel: '30.0 km', distanceMeters: 10000, durationSeconds: 1620, paceMinKm: '2:42 /km', elevationDeltaMeters: 180, speedKmh: 22.2 },
      { splitNumber: 4, distanceLabel: '42.6 km', distanceMeters: 12600, durationSeconds: 1508, paceMinKm: '2:00 /km', elevationDeltaMeters: 20, speedKmh: 30.1 }
    ],
    routePoints: NANDI_HILLS_POINTS,
    milestonesReached: ['LONGEST RIDE: 42.6 KM', 'ELEVATION CRUSHER: +560M'],
    recordBadges: [
      {
        id: 'rb_cycle',
        category: 'longest',
        tier: 'all_time_record',
        title: 'LONGEST RIDE: 42.6 KM',
        statLabel: '42.6 km in 1h 42m',
        icon: '🚴',
        color: 'cyan'
      }
    ]
  },
  {
    id: 'gps_act_turahalli',
    title: 'Chasing the elevation.',
    activityType: 'run',
    date: threeDaysAgoDateStr,
    startTime: now - 86400000 * 3 - 3600000 * 6,
    endTime: now - 86400000 * 3 - 3600000 * 6 + 2556000,
    durationSeconds: 2556,
    distanceKm: 8.12,
    avgSpeedKmh: 11.4,
    topSpeedKmh: 14.2,
    maxSpeedKmh: 14.2,
    avgPaceMinKm: '5:15 /km',
    elevationGainMeters: 140,
    caloriesBurned: 620,
    heartPointsEarned: 38,
    stepsCount: 8750,
    userId: 'men',
    notes: 'Turahalli Forest technical trail run. Rocky climbs and active balance control.',
    splits: [
      { splitNumber: 1, distanceLabel: '1.0 km', distanceMeters: 1000, durationSeconds: 315, paceMinKm: '5:15 /km', elevationDeltaMeters: 25, speedKmh: 11.4 }
    ],
    routePoints: TURAHALLI_FOREST_POINTS,
    milestonesReached: ['SEASON BEST: 8KM TRAIL']
  }
];

export const initialStravaPosts: StravaActivityPost[] = [
  {
    id: 'sp_1',
    date: todayDateStr,
    timestamp: now - 3600000 * 4,
    userId: 'men',
    title: 'Morning miles, clear mind. 🏃💨',
    description: 'Crisp morning intervals through Cubbon Park. Felt super light on the feet with Nike Pegasus 40s! Closed the last 1km in 4:21.',
    sportType: 'run',
    rpe: 8,
    totalDistanceKm: 5.24,
    totalMoveMinutes: 24,
    avgPaceMinKm: '4:37 /km',
    avgSpeedKmh: 13.0,
    elevationGainMeters: 48,
    totalCalories: 425,
    totalHeartPoints: 36,
    sufferScore: 82,
    likesCount: 18,
    isLiked: true,
    backgroundTheme: 'strava_sunset',
    motivationalQuote: 'Consistency beats intensity when intensity is only once a week.',
    quoteAuthor: 'Self-Discipline Principles',
    activities: [
      {
        id: 'a1',
        category: 'gps_run',
        title: '5.24 km Morning Tempo Run',
        details: '24:12 • Avg Pace 4:37/km • +48m Elevation',
        includedInPost: true
      }
    ],
    splits: [
      { splitNumber: 1, distanceLabel: '1.0 km', distanceMeters: 1000, durationSeconds: 285, paceMinKm: '4:45 /km', elevationDeltaMeters: 6, speedKmh: 12.6 },
      { splitNumber: 2, distanceLabel: '2.0 km', distanceMeters: 1000, durationSeconds: 280, paceMinKm: '4:40 /km', elevationDeltaMeters: -2, speedKmh: 12.9 },
      { splitNumber: 3, distanceLabel: '3.0 km', distanceMeters: 1000, durationSeconds: 275, paceMinKm: '4:35 /km', elevationDeltaMeters: 8, speedKmh: 13.1 },
      { splitNumber: 4, distanceLabel: '4.0 km', distanceMeters: 1000, durationSeconds: 272, paceMinKm: '4:32 /km', elevationDeltaMeters: 4, speedKmh: 13.2 },
      { splitNumber: 5, distanceLabel: '5.0 km', distanceMeters: 1000, durationSeconds: 261, paceMinKm: '4:21 /km', elevationDeltaMeters: -5, speedKmh: 13.8 }
    ],
    comments: [
      {
        id: 'c1',
        userId: 'women',
        userName: 'Shreya Dixit',
        avatar: '👩',
        text: 'Insane 5th split pace! Keep flying! 🔥',
        timestamp: now - 3600000 * 2
      }
    ],
    recordBadges: [
      {
        id: 'rb_1',
        category: 'fastest',
        tier: 'all_time_record',
        title: 'ALL-TIME RECORD: FASTEST 1K',
        statLabel: '4:21 (13.8 km/h)',
        previousRecord: 'Previous: 4:32',
        icon: '⚡',
        color: 'amber'
      }
    ]
  },
  {
    id: 'sp_2',
    date: yesterdayDateStr,
    timestamp: now - 86400000 - 3600000 * 3,
    userId: 'men',
    title: 'Own the left wing. ⚽⚡',
    description: 'South United Football Club matchday. Controlled the flank, created 3 big chances, and hit a peak sprint speed of 29.4 km/h!',
    sportType: 'football',
    rpe: 9,
    totalDistanceKm: 7.82,
    totalMoveMinutes: 68,
    avgPaceMinKm: '8:45 /km',
    avgSpeedKmh: 6.8,
    elevationGainMeters: 15,
    totalCalories: 680,
    totalHeartPoints: 44,
    sufferScore: 88,
    likesCount: 22,
    isLiked: false,
    backgroundTheme: 'electric_aurora',
    motivationalQuote: 'Football is played with the head. Your feet are just the tools.',
    quoteAuthor: 'Andrea Pirlo',
    activities: [
      {
        id: 'a2',
        category: 'football',
        title: 'Winger Dominance & Sprint Drills',
        details: '7.82 km • 68 mins • Top Speed 29.4 km/h',
        includedInPost: true
      }
    ],
    comments: [
      {
        id: 'c2',
        userId: 'women',
        userName: 'Shreya Dixit',
        avatar: '👩',
        text: 'Winger sharpness is unreal! Beast mode! ⚽🔥',
        timestamp: now - 86400000
      }
    ]
  },
  {
    id: 'sp_3',
    date: twoDaysAgoDateStr,
    timestamp: now - 86400000 * 2 - 3600000 * 5,
    userId: 'men',
    title: 'The long way home. 🚴🏔️',
    description: 'Conquered Nandi Hills on two wheels. 42.6 kilometers with 560 meters of climbing. Cold wind at the peak was worth every pedal stroke.',
    sportType: 'cycle',
    rpe: 8,
    totalDistanceKm: 42.6,
    totalMoveMinutes: 102,
    avgPaceMinKm: '2:24 /km',
    avgSpeedKmh: 25.0,
    elevationGainMeters: 560,
    totalCalories: 940,
    totalHeartPoints: 52,
    sufferScore: 94,
    likesCount: 27,
    isLiked: true,
    backgroundTheme: 'monochrome_titanium',
    motivationalQuote: 'It never gets easier, you just go faster.',
    quoteAuthor: 'Greg LeMond',
    activities: [
      {
        id: 'a3',
        category: 'gps_cycle',
        title: 'Nandi Hills Climb & Circuit',
        details: '42.6 km • 1h 42m • +560m Elevation',
        includedInPost: true
      }
    ]
  },
  {
    id: 'sp_4',
    date: threeDaysAgoDateStr,
    timestamp: now - 86400000 * 3 - 3600000 * 6,
    userId: 'men',
    title: 'Chasing the elevation. 🌲🏔️',
    description: 'Turahalli forest trail run. Tough technical ascents and natural rock obstacles. Strong cadence and mental focus throughout.',
    sportType: 'run',
    rpe: 8,
    totalDistanceKm: 8.12,
    totalMoveMinutes: 42,
    avgPaceMinKm: '5:15 /km',
    avgSpeedKmh: 11.4,
    elevationGainMeters: 140,
    totalCalories: 620,
    totalHeartPoints: 38,
    sufferScore: 79,
    likesCount: 15,
    isLiked: false,
    backgroundTheme: 'cyber_neon',
    motivationalQuote: 'The body achieves what the mind believes.',
    quoteAuthor: 'Napoleon Hill',
    activities: [
      {
        id: 'a4',
        category: 'gps_run',
        title: 'Turahalli Forest Trail',
        details: '8.12 km • 42:36 • +140m Elevation',
        includedInPost: true
      }
    ]
  }
];

export const initialStats: UserStats = {
  menStreak: 14,
  womenStreak: 12,
  coupleStreak: 14,
  menDisciplineScore: 94,
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

const saveTimeouts = new Map<string, number>();

export function saveToStorage<T>(key: string, value: T, debounceMs = 0): void {
  const doSave = () => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Storage quota exceeded or error saving key ${key}:`, err);
    }
  };

  if (debounceMs > 0 && typeof window !== 'undefined') {
    const existing = saveTimeouts.get(key);
    if (existing) window.clearTimeout(existing);
    const t = window.setTimeout(doSave, debounceMs);
    saveTimeouts.set(key, t);
  } else {
    doSave();
  }
}

export { KEYS };
