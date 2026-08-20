export type UserProfile = 'men' | 'women' | 'couple';

export type GenderType = 'male' | 'female';

export interface UserFitnessProfile {
  gender: GenderType;
  heightCm: number;
  weightKg: number;
  pushupBaseline: number; // Max pushups (e.g. 5)
  pullupBaseline: number; // Max pullups (e.g. 0)
  primaryGoal: 'football_winger' | 'calisthenics_mastery' | 'breath_stamina' | 'tone_definition';
  caloricTarget: number;
  proteinTargetGrams: number;
}

export interface RoutineItem {
  id: string;
  title: string;
  category: 'morning' | 'fitness' | 'music_veda' | 'evening';
  timeOfDay: string;
  durationMinutes: number;
  completed: boolean;
  assignedTo: 'men' | 'women' | 'both';
  icon: string;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: 'discipline' | 'calisthenics' | 'football' | 'consistency' | 'mindset';
  addedBy: 'system' | 'men' | 'women';
}

export interface CalisthenicsExercise {
  id: string;
  name: string;
  category: 'push' | 'pull' | 'legs' | 'dip' | 'core' | 'mobility';
  progressionLevel: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  keyCues: string[];
  targetMuscles: string[];
  recommendedSets: number;
  recommendedReps: string;
  restSeconds: number;
  imageUrl?: string;
  videoUrl?: string;
}

export interface CalisthenicsDayPlan {
  dayNumber: number; // Day 1 to 30
  dateString: string; // e.g. "Aug 12, 2026"
  dayTitle: string;
  focusCategory: 'Upper Push/Pull' | 'Football & Cardio' | 'Core & Recovery' | 'Match Day';
  isRestDay: boolean;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
    notes: string;
  }[];
  hybridCues: string;
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  userId: 'men' | 'women';
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number[];
  videoNote?: string;
  videoFileUrl?: string;
  perceivedExertion: number; // 1-10 RPE
  notes?: string;
}

export interface FootballDrill {
  id: string;
  title: string;
  category: 'acceleration' | 'agility' | 'dribbling' | 'finishing' | 'stamina';
  positionFocus: 'Forward / Winger';
  intensity: 'Low' | 'Medium' | 'High' | 'Extreme';
  durationMinutes: number;
  instructions: string[];
  coneSetup: string;
  keyBenefits: string[];
}

export interface NutritionLog {
  date: string;
  userId: 'men' | 'women';
  waterLiters: number;
  proteinGrams: number;
  calories: number;
  targetProtein: number;
  targetCalories: number;
  sleepHours: number;
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Optimal';
  notes: string;
}

// -----------------------------------------------------------------------------
// Period / Menstruation & Ovulation Tracker Types
// -----------------------------------------------------------------------------
export type CycleFlowType = 'none' | 'light' | 'medium' | 'heavy';

export interface CycleLogEntry {
  flow: CycleFlowType;
  symptoms: string[];
  moods: string[];
  notes: string;
}

export type CycleLogsMap = Record<string, CycleLogEntry>;

export interface CycleSettings {
  cycleLength: number;
  periodLength: number;
}

export interface PeriodGroup {
  startDateStr: string;
  endDateStr: string;
  startDate: Date;
  endDate: Date;
  length: number;
  daysStr: string[];
}

export interface CyclePrediction {
  periods: { startStr: string; endStr: string; start: Date; end: Date }[];
  ovulations: string[];
  fertileWindows: string[][];
}

export interface CycleMetrics {
  groups: PeriodGroup[];
  avgCycleLength: number;
  avgPeriodLength: number;
  predictions: CyclePrediction;
}

export type CyclePhaseName = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';

export interface CurrentPhaseInfo {
  phaseName: CyclePhaseName;
  cycleDay: number;
  pregnancyChance: 'High Chance' | 'Medium Chance' | 'Low Chance';
  safetyLabel: string;
  phaseDescription: string;
}

export interface CarnaticYouTubeItem {
  id: string;
  raga: string;
  kritiName: string;
  composer: string;
  status: 'Learning' | 'Practice' | 'Recording' | 'Editing' | 'Published';
  targetDate?: string;
  youtubeUrl?: string;
  notes: string;
}

export interface InstrumentSong {
  id: string;
  title: string;
  instrument: 'Ukulele' | 'Guitar' | 'Both';
  genre: 'Pop' | 'Acoustic' | 'Devotional' | 'Classic';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  status: 'Learning' | 'Restaurant Ready' | 'Mastered';
  chords: string[];
}

export interface VedaSukta {
  id: string;
  name: string;
  transliteration: string;
  totalVerses: number;
  memorizedVerses: number;
  audioGuideUrl?: string;
  notes: string;
}

export interface UserStats {
  menStreak: number;
  womenStreak: number;
  coupleStreak: number;
  menDisciplineScore: number;
  womenDisciplineScore: number;
}
