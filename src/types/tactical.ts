export type DefconLevel = 'DEFCON_1_REGEN' | 'DEFCON_2_MAINTENANCE' | 'DEFCON_3_COMBAT';

export interface RecoveryStep {
  title: string;
  durationSeconds: number;
  cue: string;
  targetArea: string;
  iconName: string;
}

export interface ActiveRecoveryProtocol {
  id: string;
  title: string;
  codename: string;
  durationMinutes: number;
  hydrationTargetLiters: number;
  description: string;
  steps: RecoveryStep[];
}

export interface TacticalMissionDirective {
  dayNumber: number;
  codename: string;
  title: string;
  defconLevel: DefconLevel;
  readinessScore: number;
  isRestDay: boolean;
  briefing: string;
  orders: string[];
  hydrationLiters: number;
  sleepTargetHours: number;
  lockoutActive: boolean;
  recoveryProtocol?: ActiveRecoveryProtocol;
  recommendedCadence: string;
}

export interface MilitaryRankInfo {
  rankCode: string;
  rankTitle: string;
  insignia: string;
  level: number;
  minPoints: number;
  nextRankPoints: number;
  perks: string;
}

export interface MusterStatus {
  musteredToday: boolean;
  musterTimestamp?: number;
  musterDateStr: string;
  demerits: number;
  statusText: string;
}

export interface TacticalAiResponse {
  headline: string;
  directive: string;
  orders: string[];
  toneRating: 'URGENT' | 'DISCIPLINE' | 'TACTICAL_PRAISE' | 'REPRIMAND';
  audioCadenceLine: string;
  footballBonusQuote?: {
    text: string;
    speaker: string;
    context: string;
  };
}

export type CaptionCategory =
  | 'anfield_spirit'
  | 'football_pitch'
  | 'military_discipline'
  | 'indian_army'
  | 'witty_banter'
  | 'calisthenics_humor'
  | 'day_speciality';

export interface AiCaptionSuggestion {
  id: string;
  category: CaptionCategory;
  badge: string;
  title: string;
  description: string;
  quoteText: string;
  quoteAuthor: string;
  hashtags: string[];
  wittyTagline?: string;
}

export interface FootballDayMilestone {
  dateKey: string;
  headline: string;
  eventDescription: string;
  hero: string;
  clubOrCompetition: string;
  tacticalLesson: string;
  dayTheme: string;
}

