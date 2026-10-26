/**
 * Embedded Tactical Mini-AI Engine ("Commander Iron" + "The Anfield Tactical Room")
 * Zero-latency on-device athletic intelligence with military discipline reasoning,
 * situation evaluation, excuse dismantling, Liverpool FC banter & motivation,
 * Indian Army valour quotes, calisthenics humor, and dynamic on-the-go social caption generation.
 */

import type {
  TacticalAiResponse,
  DefconLevel,
  AiCaptionSuggestion,
  FootballDayMilestone
} from '../types/tactical';

export interface TacticalContext {
  athleteName: string;
  streakCount: number;
  recentPace?: string;
  weeklyDistanceKm?: number;
  defconLevel: DefconLevel;
  isRestDay: boolean;
  dayNumber?: number;
}

export interface LiverpoolQuote {
  text: string;
  speaker: string;
  context: string;
  category: 'mentality' | 'perseverance' | 'tactics' | 'legacy';
}

export interface IndianArmyQuote {
  text: string;
  speaker: string;
  regimentOrRank: string;
  context: string;
  battleCry: string;
}

export const LIVERPOOL_FC_QUOTES: LiverpoolQuote[] = [
  {
    text: "We have to change from doubters to believers. Now.",
    speaker: "Jürgen Klopp",
    context: "First press conference at Anfield, transforming the entire club psyche.",
    category: "mentality",
  },
  {
    text: "Mentality Monsters. We don't complain about what's missing, we fight with what we have.",
    speaker: "Jürgen Klopp",
    context: "Defining the relentless work ethic of the Champions League and Premier League champions.",
    category: "mentality",
  },
  {
    text: "Some people believe football is a matter of life and death, I am very sure it is much more serious than that.",
    speaker: "Bill Shankly",
    context: "The immortal Shankly doctrine establishing Liverpool as an obsession and way of life.",
    category: "legacy",
  },
  {
    text: "A lot of football success is in the mind. You must believe that you are the best and then make sure that you are.",
    speaker: "Bill Shankly",
    context: "Psychological conditioning that built the Anfield dynasty.",
    category: "mentality",
  },
  {
    text: "Cut my veins open and I bleed Liverpool red. You don't let up for a single second.",
    speaker: "Steven Gerrard",
    context: "The legendary skipper on commitment and leading by relentless personal example.",
    category: "perseverance",
  },
  {
    text: "Corner taken quickly... ORIGI! Pure presence of mind when the world was watching.",
    speaker: "Anfield Folklore (Trent & Origi)",
    context: "May 7, 2019: 4-0 comeback vs Barcelona to reach the UCL final.",
    category: "tactics",
  },
  {
    text: "If you want to be the best, you have to be relentless every single day in the gym and on the grass.",
    speaker: "Mohamed Salah",
    context: "The Egyptian King's elite conditioning routine and physical discipline.",
    category: "perseverance",
  },
  {
    text: "The badge on the front of the shirt is always bigger than the name on the back.",
    speaker: "Sir Kenny Dalglish",
    context: "The King of Anfield on humility, team duty, and selfless work rate.",
    category: "legacy",
  },
  {
    text: "No playmaker in the world can be as good as a good counter-pressing situation.",
    speaker: "Jürgen Klopp",
    context: "The foundational principle of Gegenpressing: work rate creates opportunity.",
    category: "tactics",
  },
  {
    text: "High intensity without tactical structure is just chaos. Control the tempo with ruthless precision.",
    speaker: "Arne Slot",
    context: "The modern Anfield tactical era: relentless pressing paired with clinical game management.",
    category: "tactics",
  },
  {
    text: "At half-time in Istanbul, we had 45 minutes to save our pride. We walked back out and conquered Europe.",
    speaker: "Steven Gerrard",
    context: "May 25, 2005: 3-0 down vs AC Milan, inspiring the greatest comeback in football history.",
    category: "perseverance",
  },
  {
    text: "Walk on through the wind, walk on through the rain, though your dreams be tossed and blown. You'll Never Walk Alone.",
    speaker: "The Kop Anthem",
    context: "Sung before every Anfield battle: solidarity, perseverance, and unbreakable spirit.",
    category: "legacy",
  },
];

export const INDIAN_ARMY_QUOTES: IndianArmyQuote[] = [
  {
    text: "Yeh Dil Mange More! Either I will come back after hoisting the Tricolour, or I will come back wrapped in it, but I will be back for sure.",
    speaker: "Captain Vikram Batra, PVC",
    regimentOrRank: "13 JAK RIF (Kargil War 1999)",
    context: "Capture of Point 5140 under impossible vertical cliff conditions.",
    battleCry: "Durge Mata Ki Jai!",
  },
  {
    text: "You surrender or we wipe you out.",
    speaker: "Field Marshal Sam Manekshaw",
    regimentOrRank: "Chief of Army Staff (1971)",
    context: "Historic ultimatum leading to the liberation of Bangladesh and surrender of 93,000 enemy troops.",
    battleCry: "Jai Mahakali, Ayo Gorkhali!",
  },
  {
    text: "If a man says he is not afraid of dying, he is either lying or he is a Gorkha.",
    speaker: "Field Marshal Sam Manekshaw",
    regimentOrRank: "8 Gorkha Rifles",
    context: "Immortal salute to fearless valour and battlefield discipline.",
    battleCry: "Ayo Gorkhali!",
  },
  {
    text: "The safety, honour and welfare of your country come first, always and every time. The honour, welfare and comfort of the men you command come next. Your own ease, comfort and safety come last, always and every time.",
    speaker: "The Chetwode Motto",
    regimentOrRank: "Indian Military Academy, Dehradun",
    context: "The sacred code of honour for every Indian Army officer.",
    battleCry: "Veerta Aur Vivek!",
  },
  {
    text: "The enemy are only 50 yards from us. We are heavily outnumbered. We are under devastating fire. I shall not withdraw an inch but will fight to our last man and our last round.",
    speaker: "Major Somnath Sharma, PVC",
    regimentOrRank: "4 Kumaon (Battle of Badgam 1947)",
    context: "First recipient of the Param Vir Chakra, saving the Srinagar airfield.",
    battleCry: "Kalika Mata Ki Jai!",
  },
  {
    text: "If death strikes before I prove my blood, I promise, I will kill death!",
    speaker: "Captain Manoj Kumar Pandey, PVC",
    regimentOrRank: "1/11 Gorkha Rifles (Operation Vijay)",
    context: "Heroic assault clearing enemy bunkers atop Khalubar ridge.",
    battleCry: "Jai Mahakali!",
  },
  {
    text: "Men apart, every man an emperor.",
    speaker: "Indian Para Special Forces",
    regimentOrRank: "Parachute Regiment (Special Forces)",
    context: "The elite brotherhood operating with lethal discipline behind enemy lines.",
    battleCry: "Balidaan Param Dharma!",
  },
  {
    text: "I am defending the soil of my motherland. We will never let the enemy cross this ridge.",
    speaker: "Brigadier Mohammad Usman",
    regimentOrRank: "50 Parachute Brigade ('The Lion of Naushera')",
    context: "Heroic defense of Naushera and Jhangar in 1948.",
    battleCry: "Bharat Mata Ki Jai!",
  },
];

export const WITTY_MATCH_BANTERS = [
  {
    club: 'Liverpool vs Manchester United',
    headline: '🔴 Old Trafford Silence: 3-0 Tactical Lesson',
    caption: 'Pressed through this workout harder than Luis Díaz and Mo Salah running riot at Old Trafford. 3-0 clean sheet on the pitch, zero missed reps in the gym. Casemiro was looking for answers at half-time, and my quads were begging for mercy, but the scoreboard doesn\'t lie! 🔴☕⚽',
    quote: 'High intensity without structure is chaos. Dictate the tempo.',
    speaker: 'Arne Slot',
    hashtags: ['#LFC', '#OldTraffordMasterclass', '#SlotBall', '#3Nil', '#MentalityMonsters'],
  },
  {
    club: 'Liverpool 7-0 Manchester United Banter',
    headline: '🔴 7-0 Mentality: Relentless Scoring Form',
    caption: '7-0 mindset: Knocked down reps faster than United\'s defensive shape collapsed at Anfield. My legs currently feel like overcooked Maggi noodles, but YNWA is blasting at maximum volume! 😂🔴⚽',
    quote: 'We have to change from doubters to believers. Now.',
    speaker: 'Jürgen Klopp',
    hashtags: ['#7Nil', '#AnfieldDemolition', '#YNWA', '#KloppHeavyMetal', '#NoMercy'],
  },
  {
    club: 'Virgil van Dijk Aura',
    headline: '🛡️ Virgil van Dijk Clean Sheet Protocol',
    caption: 'Van Dijk energy today: Untouched, composed, and zero excuses allowed inside my penalty box. Not even delayed onset muscle soreness (DOMS) could dribble past me today! 100% ground and aerial duels won. 🛡️🔥',
    quote: 'The badge on the front is always bigger than the name on the back.',
    speaker: 'Sir Kenny Dalglish',
    hashtags: ['#VVD', '#CleanSheet', '#UntouchedAura', '#AnfieldWall', '#KuchhBhii'],
  },
  {
    club: 'Corner Taken Quickly... Origi!',
    headline: '⚡ Pure Presence of Mind: Quick Corner',
    caption: 'Corner taken quickly... ORIGI! Seized this workout while everyone else was blinking and complaining about being tired. Presence of mind separates the champions from the spectators! ⚡🔴',
    quote: 'Pure presence of mind when the world was watching.',
    speaker: 'Anfield Folklore',
    hashtags: ['#CornerTakenQuickly', '#OrigiLegend', '#PresenceOfMind', '#EuropeanNights'],
  },
];

export const CALISTHENICS_HUMOR_QUOTES = [
  {
    title: 'Gravity Filed a Formal Complaint',
    caption: 'Nose to the deck, core locked like titanium. Knocked out strict chest-to-deck reps; gravity has officially lodged an FIR against my pecs and deltoids. Overcooked Maggi arms, but unbreakable discipline! 😂💪',
    quote: 'Discipline equals freedom. The only easy day was yesterday.',
    speaker: 'Commander Iron',
    hashtags: ['#ChestToDeck', '#GravityIsAnOpinion', '#MaggiArms', '#CalisthenicsGrit'],
  },
  {
    title: 'The Floor & I Are Now Best Friends',
    caption: 'The floor and I spent 45 minutes together today. We met 60 times. No half-reps, no flailing, no cheating. Calisthenics is honest: you cannot bribe gravity! 🫡💪',
    quote: 'Ten flawless reps command more respect than fifty sloppy flails.',
    speaker: 'Tactical Cadence Drill',
    hashtags: ['#StrictForm', '#NoEgoReps', '#BodyweightMastery', '#IronWill'],
  },
];

export const GENERAL_SPORTS_WIT = [
  {
    title: '🏏 Virat Kohli Chase Masterclass Energy',
    caption: 'Approached the final interval like Virat Kohli chasing 180 under floodlights at the MCG: pulse racing, calculated aggression, and fierce intent between the wickets. Never panic, just execute! 🏏🔥',
    quote: 'Self-belief and hard work will always earn you success.',
    speaker: 'Virat Kohli',
    hashtags: ['#ChaseMaster', '#KohliMentality', '#IceInTheVeins', '#ClutchPerformer'],
  },
  {
    title: '🏸 400 km/h Cross-Court Jump Smash',
    caption: 'Smashing through mental sluggishness like an angled 400 km/h jump smash down the tramlines. Court covered, sweat earned, zero excuses entertained. 🏸⚡',
    quote: 'You have to believe in yourself when no one else does.',
    speaker: 'Matchday Court Wisdom',
    hashtags: ['#SmashPower', '#CourtAgility', '#FastFeet', '#MatchReady'],
  },
];

export const POPULAR_CURRENT_EVENTS = [
  'Liverpool demolished Manchester United 3-0 at Old Trafford',
  'Captain Vikram Batra: Yeh Dil Mange More!',
  'Field Marshal Sam Manekshaw: You surrender or we wipe you out',
  'Arne Slot Gegenpress masterclass',
  'Noodles arms after 100 chest-to-deck push-ups',
  'Virat Kohli MCG 82* chase mentality',
  'Virgil van Dijk pocketing strikers with zero fouls',
];

const COMMON_EXCUSES: Record<string, { rebuttal: string; action: string; footballAnalogy: string }> = {
  tired: {
    rebuttal: 'Fatigue is mental before it is physical. Your body can operate 40% beyond where your brain wants to quit.',
    action: 'Execute your 3-minute dynamic warmup. If still exhausted after 3 minutes, scale volume by 20%, but you DO NOT quit.',
    footballAnalogy: 'Think of Jordan Henderson and Andy Robertson pressing in the 93rd minute of a Champions League tie. Dig deep.',
  },
  busy: {
    rebuttal: 'Lack of time is a lack of priorities. Leaders make time; slackers make excuses.',
    action: 'Execute a 15-minute high-density grease-the-groove block. 4 sets of 5 push-ups spread through your work day.',
    footballAnalogy: 'Mo Salah trains at 5:00 AM before media and match duties. 15 minutes is all it takes to keep momentum.',
  },
  sore: {
    rebuttal: 'Differentiate muscle soreness (DOMS) from joint injury. Soreness is biological adaptation in progress.',
    action: 'Engage Active Recovery Protocol: 10 minutes foam rolling and 2 minutes dead hangs to flush metabolic waste.',
    footballAnalogy: 'Post-match recovery protocol at the AXA Training Centre: ice baths, mobility, and hydration over excuses.',
  },
  lazy: {
    rebuttal: 'Feelings are irrelevant. Amateurs wait for motivation; professionals rely on ruthless discipline.',
    action: 'Drop and give me 10 clean push-ups right now. Action produces emotion, not the other way around.',
    footballAnalogy: 'Klopp called them Mentality Monsters because they won games even when they felt dead tired.',
  },
};

const DAY_THEMES: Record<number, { theme: string; tag: string; lfcInspiration: string }> = {
  0: {
    theme: "Anfield Fortress Sunday",
    tag: "Super Sunday",
    lfcInspiration: "Defend your streak like Virgil van Dijk patrolling the penalty box. Total aerial and ground dominance.",
  },
  1: {
    theme: "Heavy Metal Monday",
    tag: "Gegenpress Week",
    lfcInspiration: "Shankly Monday rule: Set the high-tempo pressing standard in the first minute. Dictate the entire week's pace.",
  },
  2: {
    theme: "Tactical European Tuesday",
    tag: "Champions League Night",
    lfcInspiration: "European nights under the floodlights. Fast transitions, quick one-twos, and explosive interval pace.",
  },
  3: {
    theme: "Midfield Engine Wednesday",
    tag: "Relentless Work Rate",
    lfcInspiration: "The box-to-box grit of Gerrard and Szoboszlai. Winning 50/50 duels when legs get heavy.",
  },
  4: {
    theme: "Calisthenics & Pitch Shielding Thursday",
    tag: "Core & Physicality",
    lfcInspiration: "Upper-body shield and core tension to hold off physical center-backs on the touchline.",
  },
  5: {
    theme: "Matchday -1 Preparation Friday",
    tag: "Sharpen the Blade",
    lfcInspiration: "Deceleration cuts, first-touch precision, and explosive sprint intervals before weekend battles.",
  },
  6: {
    theme: "Premier League Game Day Saturday",
    tag: "Full 90 Minutes",
    lfcInspiration: "Leave everything on the grass. You'll Never Walk Alone. Finish every set with absolute authority.",
  },
};

// Curated Football & Liverpool Historical Milestones (by month 0-indexed and day)
const FOOTBALL_HISTORY_DATABASE: Record<string, { event: string; hero: string; lesson: string }> = {
  "9-26": {
    event: "Mo Salah scored his landmark 100th Premier League goal for Liverpool, proving world-class consistency across seasons.",
    hero: "Mohamed Salah",
    lesson: "Elite strikers repeat simple, clinical fundamentals hundreds of times until they become lethal instinct.",
  },
  "9-27": {
    event: "Liverpool showcased tactical masterclass in Europe, dominating possession and counter-pressing opponents into surrender.",
    hero: "Jürgen Klopp",
    lesson: "When opponents sit deep, patience and ruthless ball movement will inevitably crack the backline.",
  },
  "9-28": {
    event: "Steven Gerrard hammered home a 30-yard screamer at the Kop end, lifting the team from the brink of elimination.",
    hero: "Steven Gerrard",
    lesson: "When the team needs a breakthrough, leaders step forward and take the shot without hesitation.",
  },
  "4-25": {
    event: "The Miracle of Istanbul: 3-0 down against AC Milan at half-time, Liverpool clawed back to 3-3 and lifted Champions League trophy #5.",
    hero: "Steven Gerrard & Jerzy Dudek",
    lesson: "Never surrender. As long as there is time on the clock, a disciplined comeback is always possible.",
  },
  "4-7": {
    event: "The Greatest Anfield Comeback: 3-0 down on aggregate to Messi's Barcelona, Liverpool won 4-0 without Salah or Firmino.",
    hero: "Divock Origi & Gini Wijnaldum",
    lesson: "Belief over odds. When the Anfield Kop roars and you press relentlessly, giants crumble.",
  },
  "3-14": {
    event: "Europa League quarter-final thriller: Dejan Lovren heads in the 91st-minute winner to beat Dortmund 4-3 in European folklore.",
    hero: "Dejan Lovren & Jürgen Klopp",
    lesson: "The match is never over until the final whistle. Fight for the dying seconds.",
  },
  "5-1": {
    event: "Liverpool secured European Cup #6 in Madrid with relentless defensive structure and ice-cold game management.",
    hero: "Jordan Henderson & Virgil van Dijk",
    lesson: "Championships are won in the trenches of defensive discipline and structured composure.",
  },
};

export class TacticalAiEngine {
  /**
   * Evaluates user query with on-device tactical intelligence + Liverpool FC mindset
   */
  public static evaluateInquiry(userQuestion: string, context: TacticalContext): TacticalAiResponse {
    const q = userQuestion.toLowerCase().trim();

    // 1. Liverpool FC / Anfield / Football Culture Specific Queries
    if (
      q.includes('liverpool') ||
      q.includes('anfield') ||
      q.includes('klopp') ||
      q.includes('ynwa') ||
      q.includes('shankly') ||
      q.includes('gerrard') ||
      q.includes('salah') ||
      q.includes('united') ||
      q.includes('mentality monster')
    ) {
      const randomQuote = LIVERPOOL_FC_QUOTES[Math.floor(Math.random() * LIVERPOOL_FC_QUOTES.length)];
      return {
        headline: '🔴 ANFIELD TACTICAL ROOM: MENTALITY MONSTER PROTOCOL',
        directive: `Soldier and fellow Red, you are tapping into the greatest fighting spirit in world football. "${randomQuote.text}" — ${randomQuote.speaker}. At Anfield, we do not surrender leads and we never bow to fatigue. Whether celebrating a 3-0 masterclass over Manchester United or conquering the calisthenics pit, you embody the Kop roar!`,
        orders: [
          'Execute today’s athletic block with the intensity of an Anfield European night.',
          'Counter-press mental sluggishness immediately: 15 chest-to-deck push-ups or high-knees.',
          `Safeguard your ${context.streakCount}-day streak. Remember: You'll Never Walk Alone!`,
        ],
        toneRating: 'TACTICAL_PRAISE',
        audioCadenceLine: `Hold your head up high and fear no fatigue! Doubters into believers! YNWA!`,
        footballBonusQuote: {
          text: randomQuote.text,
          speaker: randomQuote.speaker,
          context: randomQuote.context,
        },
      };
    }

    // 2. Indian Army / Valour Queries
    if (
      q.includes('army') ||
      q.includes('batra') ||
      q.includes('manekshaw') ||
      q.includes('kargil') ||
      q.includes('mange more') ||
      q.includes('indian army') ||
      q.includes('chetwode')
    ) {
      const randomArmy = INDIAN_ARMY_QUOTES[Math.floor(Math.random() * INDIAN_ARMY_QUOTES.length)];
      return {
        headline: `🇮🇳 INDIAN ARMY TACTICAL DIRECTIVE: ${randomArmy.battleCry.toUpperCase()}`,
        directive: `Soldier, you are powered by the greatest warriors to walk the earth. "${randomArmy.text}" — ${randomArmy.speaker} (${randomArmy.regimentOrRank}). In battle and in training, pain is temporary, honour is permanent. Execute with absolute dedication!`,
        orders: [
          'Chest to deck on every repetition. Zero compromise on form.',
          `Adopt the Chetwode standard: your duty and discipline come first.`,
          `Battle cry: "${randomArmy.battleCry}" — knock out your sets!`,
        ],
        toneRating: 'DISCIPLINE',
        audioCadenceLine: `${randomArmy.battleCry} Move forward with courage, soldier!`,
        footballBonusQuote: {
          text: randomArmy.text,
          speaker: randomArmy.speaker,
          context: randomArmy.context,
        },
      };
    }

    // 3. Soreness / Recovery Queries
    if (q.includes('sore') || q.includes('pain') || q.includes('recover') || q.includes('rest')) {
      if (context.isRestDay || context.defconLevel === 'DEFCON_1_REGEN') {
        return {
          headline: 'SITREP: ACTIVE REGENERATION MANDATED',
          directive: `Soldier, soreness is an indicator of microtrauma from recent load. Today is marked for active recovery. Forcing max reps today will compromise your shoulder labrum and sap neuromuscular speed. Even the fiercest Premier League wingers prioritize recovery between high-intensity fixtures.`,
          orders: [
            'Execute 2 minutes of spinal dead hangs to relieve compressive spinal load.',
            'Target your pecs, lats, and quads with 10 minutes myofascial foam rolling.',
            'Drink 3.5L of water with sodium/potassium electrolytes before 2000 hours.',
          ],
          toneRating: 'URGENT',
          audioCadenceLine: 'Stand down from heavy pushing today, soldier! Execute the active recovery protocol.',
        };
      } else {
        return {
          headline: 'SITREP: DELAYED ONSET MUSCLE SORENESS',
          directive: `General muscle stiffness is normal biological adaptation. Perform your 3-minute mobility warmup. Differentiate muscle tightness from sharp tendon pain. If soreness subsides after the dynamic warmup, attack today's push ladder with controlled eccentric tempos.`,
          orders: [
            'Warm up shoulders thoroughly with arm circles and band pull-aparts.',
            'Focus on slow 3-second eccentric descents instead of frantic speed.',
            'Hydrate aggressively and stretch hip flexors post-session.',
          ],
          toneRating: 'DISCIPLINE',
          audioCadenceLine: 'Warm up thoroughly, recruit! Test your form on the floor and push through stiffness!',
        };
      }
    }

    // 4. Excuse / Demotivation Queries
    if (q.includes('tired') || q.includes('lazy') || q.includes("don't feel like") || q.includes('busy') || q.includes('excuse') || q.includes('skip')) {
      const matched = Object.keys(COMMON_EXCUSES).find((k) => q.includes(k));
      const excuse = matched ? COMMON_EXCUSES[matched] : COMMON_EXCUSES.lazy;

      return {
        headline: 'EXCUSE REJECTED: DISCIPLINE OVER MOOD',
        directive: `${excuse.rebuttal} ${excuse.footballAnalogy} You have built a ${context.streakCount}-day discipline streak. Are you going to forfeit your operational momentum because of temporary weakness? Negative, soldier.`,
        orders: [
          excuse.action,
          'Lace up your training shoes immediately without negotiating with your brain.',
          'Log your completed discipline block before evening SITREP.',
        ],
        toneRating: 'REPRIMAND',
        audioCadenceLine: 'Excuses are lies told by weakness! Stand up, lace your shoes, and fall in!',
      };
    }

    // 5. Football / Winger Agility Queries
    if (q.includes('football') || q.includes('winger') || q.includes('agility') || q.includes('sprint') || q.includes('speed') || q.includes('match')) {
      return {
        headline: 'TACTICAL DIRECTIVE: PITCH EXPLOSIVENESS & WINGER MOTOR',
        directive: `Elite modern wingers combine sudden decelerations with explosive first-step acceleration. Keep upper-body muscle density high without accumulating bulky mass that slows top-end sprint velocity. Build the engine to counter-press for 90 full minutes.`,
        orders: [
          'Perform 6 sets of 15-meter acceleration sprints with full walk-back recovery.',
          'Sharpen cutting angles: Lower your center of gravity during plant-and-turn transitions.',
          'Fuel with fast-digesting carbohydrates 2.5 hours prior to kickoff.',
        ],
        toneRating: 'TACTICAL_PRAISE',
        audioCadenceLine: 'Explode off the mark! Fast feet, sharp cuts, full commitment!',
      };
    }

    // 6. Calisthenics / Push-Up / Pull-Up Queries
    if (q.includes('push') || q.includes('pull') || q.includes('calisthenic') || q.includes('rep') || q.includes('chest')) {
      return {
        headline: 'TACTICAL DIRECTIVE: FORM SUPREMACY & DENSITY',
        directive: `Ten flawless, chest-to-deck push-ups command infinite more respect than twenty sloppy, half-rep flails. Keep your core braced into an unbreakable plank, scapulae retracted at the bottom, and lock out with authority at the apex.`,
        orders: [
          'Elbows tucked at 45 degrees—protect the rotator cuff.',
          'Full lockout at top with active protraction of the scapula.',
          'Control the descent: 2 seconds down, explosive 1 second up.',
        ],
        toneRating: 'DISCIPLINE',
        audioCadenceLine: 'No ego reps in this unit! Lock out each rep with full authority!',
      };
    }

    // General Fallback Query Evaluation
    const fallbackQuote = LIVERPOOL_FC_QUOTES[0];
    return {
      headline: 'TACTICAL DIRECTIVE: UNWAVERING EXECUTION',
      directive: `Acknowledged, soldier. Maintain focus on the primary objective. Consistency compounds; sporadic bursts of motivation fail. As Jürgen Klopp taught us: Doubters into believers through relentless daily work. Execute your daily discipline blocks with zero hesitation.`,
      orders: [
        'Complete today’s designated training or active recovery protocol.',
        `Safeguard your ${context.streakCount}-day discipline flame.`,
        'Check in at 2030 hours for the evening situation report.',
      ],
      toneRating: 'DISCIPLINE',
      audioCadenceLine: 'Stay mission-oriented, soldier! Discipline equals freedom! YNWA!',
      footballBonusQuote: {
        text: fallbackQuote.text,
        speaker: fallbackQuote.speaker,
        context: fallbackQuote.context,
      },
    };
  }

  /**
   * Retrieves today's football & Liverpool FC milestone
   */
  public static getTodayFootballMilestone(date: Date = new Date()): FootballDayMilestone {
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const key = `${month}-${day}`;

    const dayMeta = DAY_THEMES[dayOfWeek] || DAY_THEMES[1];
    const specificHistory = FOOTBALL_HISTORY_DATABASE[key];

    const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (specificHistory) {
      return {
        dateKey: dateFormatted,
        headline: `🔴 On This Day in Football History: ${specificHistory.hero}`,
        eventDescription: specificHistory.event,
        hero: specificHistory.hero,
        clubOrCompetition: "Liverpool FC / European Football",
        tacticalLesson: specificHistory.lesson,
        dayTheme: dayMeta.theme,
      };
    }

    // Dynamic rotation if specific date not in static table
    const quote = LIVERPOOL_FC_QUOTES[(day + month) % LIVERPOOL_FC_QUOTES.length];
    return {
      dateKey: dateFormatted,
      headline: `🔴 Anfield Matchday Mindset: ${dayMeta.theme}`,
      eventDescription: `Anfield folklore teaches us that consistency creates dynasties. ${dayMeta.lfcInspiration}`,
      hero: quote.speaker,
      clubOrCompetition: "Liverpool FC",
      tacticalLesson: quote.text,
      dayTheme: dayMeta.theme,
    };
  }

  /**
   * Generates AI-crafted social captions tailored to the workout, current events,
   * Liverpool FC triumphs, Indian Army battle cries, and witty banter on the go.
   */
  public static generateSocialCaptions(params: {
    sport: string;
    distanceOrReps?: string;
    activities?: string[];
    durationMinutes?: number;
    streakCount?: number;
    persona?: string;
    date?: Date;
    customContext?: string;
    randomEventMode?: boolean;
  }): AiCaptionSuggestion[] {
    const date = params.date || new Date();
    const milestone = this.getTodayFootballMilestone(date);
    const streak = params.streakCount || 14;
    const distanceOrReps = params.distanceOrReps || '5.2 km / 15 Push-ups';
    const ctx = (params.customContext || '').toLowerCase().trim();

    // -------------------------------------------------------------------------
    // 1. ANFIELD & WITTY FOOTBALL BANTER CAPTION
    // -------------------------------------------------------------------------
    let anfieldCaption: AiCaptionSuggestion;
    const isUnitedBanter = ctx.includes('united') || ctx.includes('manchester') || ctx.includes('old trafford') || ctx.includes('3-0') || ctx.includes('7-0');
    const isSlotBanter = ctx.includes('slot') || ctx.includes('arne') || ctx.includes('gegenpress') || ctx.includes('tempo');

    if (isUnitedBanter) {
      const banter = WITTY_MATCH_BANTERS[0];
      anfieldCaption = {
        id: 'anfield_spirit',
        category: 'anfield_spirit',
        badge: '🔴 Old Trafford 3-0 Banter',
        title: `3-0 Mentality: Out-Pressing Man United & Fatigue`,
        description: `Pressed through ${distanceOrReps} harder than Luis Díaz and Mo Salah running riot at Old Trafford. 3-0 clean sheet on the pitch, zero missed reps in the session. Casemiro was looking for answers at half-time, and my quads were begging for oxygen, but the scoreboard doesn't lie! Still humming YNWA with jelly legs! 🔴☕⚽`,
        quoteText: banter.quote,
        quoteAuthor: banter.speaker,
        hashtags: ['#LFC', '#OldTraffordMasterclass', '#SlotBall', '#3Nil', '#MentalityMonsters'],
        wittyTagline: '3-0 clean sheet on the pitch, clean reps in the gym.',
      };
    } else if (isSlotBanter) {
      anfieldCaption = {
        id: 'anfield_spirit',
        category: 'anfield_spirit',
        badge: '🔴 Arne Slot Masterclass',
        title: `Slot-Ball Efficiency: Relentless High Press`,
        description: `High tempo, structured pressing, and ruthless game management. Controlled this ${distanceOrReps} block like Liverpool dictating possession at Anfield. No chaotic flailing—pure tactical precision. 🔴⚡`,
        quoteText: "High intensity without tactical structure is just chaos. Control the tempo with ruthless precision.",
        quoteAuthor: "Arne Slot",
        hashtags: ['#SlotBall', '#TacticalDiscipline', '#AnfieldEngine', '#LFC', '#Gegenpress'],
        wittyTagline: 'Control the pitch, conquer the workout.',
      };
    } else {
      const anfieldQuotes = LIVERPOOL_FC_QUOTES.filter(q => q.category === 'mentality' || q.category === 'perseverance');
      const lfcQuote = anfieldQuotes[Math.floor(Math.random() * anfieldQuotes.length)];
      const extraBanter = ctx ? `Context note: "${params.customContext}". ` : '';

      anfieldCaption = {
        id: 'anfield_spirit',
        category: 'anfield_spirit',
        badge: '🔴 Anfield Mentality Monster',
        title: `Mentality Monsters: ${params.sport.toUpperCase()} Locked Down`,
        description: `${extraBanter}"${lfcQuote.text}" — ${lfcQuote.speaker}.\n\nNo shortcuts, no excuses. Put in the graft when nobody is watching, whether counter-pressing on the grass or in the gym. Pushed through the wall and locked down ${distanceOrReps}. Doubters into believers! 🔴🔥`,
        quoteText: lfcQuote.text,
        quoteAuthor: lfcQuote.speaker,
        hashtags: ['#LFC', '#MentalityMonsters', '#YNWA', '#AnfieldSpirit', '#KloppDiscipline'],
        wittyTagline: 'Doubters into believers through relentless work.',
      };
    }

    // -------------------------------------------------------------------------
    // 2. INDIAN ARMY VALOUR & BATTLE CRY CAPTION
    // -------------------------------------------------------------------------
    let armyCaption: AiCaptionSuggestion;
    const isManekshaw = ctx.includes('manekshaw') || ctx.includes('surrender') || ctx.includes('gorkha');
    const isBatra = ctx.includes('batra') || ctx.includes('mange more') || ctx.includes('kargil') || ctx.includes('5140');

    if (isManekshaw) {
      const manekshaw = INDIAN_ARMY_QUOTES[1];
      armyCaption = {
        id: 'indian_army',
        category: 'indian_army',
        badge: '🇮🇳 Field Marshal Manekshaw Protocol',
        title: `You Surrender or We Wipe You Out: Day ${streak}`,
        description: `As Field Marshal Sam Manekshaw famously declared: "You surrender or we wipe you out." Looked weakness dead in the eye during today's ${distanceOrReps} block. Zero negotiation, zero demerits. Ayo Gorkhali! 🇮🇳🫡`,
        quoteText: manekshaw.text,
        quoteAuthor: manekshaw.speaker,
        hashtags: ['#SamManekshaw', '#IndianArmy', '#YouSurrenderOrWeWipeYouOut', '#AyoGorkhali', '#IronWill'],
        wittyTagline: 'You surrender or we wipe you out.',
      };
    } else if (isBatra || ctx.includes('army') || ctx.includes('valour')) {
      const batra = INDIAN_ARMY_QUOTES[0];
      armyCaption = {
        id: 'indian_army',
        category: 'indian_army',
        badge: '🇮🇳 Capt Vikram Batra (PVC)',
        title: `Yeh Dil Mange More: Conquering Today's Objective`,
        description: `Channeled Captain Vikram Batra's indomitable courage on Point 5140. When my muscles screamed for a ceasefire on the final set, the soul roared "Yeh Dil Mange More!" Finished ${distanceOrReps} with full honours. Durge Mata Ki Jai! 🇮🇳🔥`,
        quoteText: batra.text,
        quoteAuthor: batra.speaker,
        hashtags: ['#YehDilMangeMore', '#VikramBatra', '#KargilHero', '#ParamVirChakra', '#IndianArmy'],
        wittyTagline: 'Yeh Dil Mange More!',
      };
    } else {
      const randomArmy = INDIAN_ARMY_QUOTES[Math.floor(Math.random() * INDIAN_ARMY_QUOTES.length)];
      armyCaption = {
        id: 'indian_army',
        category: 'indian_army',
        badge: `🇮🇳 ${randomArmy.speaker.split(',')[0]} Standard`,
        title: `Mission Accomplished: Day ${streak} In The Trenches`,
        description: `"${randomArmy.text}" — ${randomArmy.speaker} (${randomArmy.regimentOrRank}).\n\nDiscipline is not a mood; it is an iron code. Locked in ${distanceOrReps} with surgical precision. Battle cry: ${randomArmy.battleCry} 🫡🇮🇳`,
        quoteText: randomArmy.text,
        quoteAuthor: randomArmy.speaker,
        hashtags: ['#IndianArmy', '#ChetwodeMotto', '#DisciplineEqualsFreedom', '#Valour', '#KuchhBhii'],
        wittyTagline: randomArmy.battleCry,
      };
    }

    // -------------------------------------------------------------------------
    // 3. CALISTHENICS & IRON HUMOR CAPTION
    // -------------------------------------------------------------------------
    const humor = CALISTHENICS_HUMOR_QUOTES[Math.floor(Math.random() * CALISTHENICS_HUMOR_QUOTES.length)];
    const isCalisthenics = ctx.includes('pushup') || ctx.includes('pullup') || ctx.includes('calisthenic') || ctx.includes('arms') || ctx.includes('reps');

    const calisthenicsCaption: AiCaptionSuggestion = {
      id: 'calisthenics_humor',
      category: 'calisthenics_humor',
      badge: '💪 Maggi Arms & Iron Wit',
      title: isCalisthenics
        ? 'Gravity Officially Lodged an FIR Against My Pecs'
        : `${humor.title}: ${params.sport.toUpperCase()}`,
      description: isCalisthenics
        ? `Nose to the deck, core braced like reinforced concrete. Knocked out strict chest-to-deck reps; gravity has officially lodged an FIR against my pecs and deltoids. My arms currently feel like overcooked Maggi noodles, but the streak flame burns hot! 😂💪`
        : `${humor.caption} Pushed through ${distanceOrReps} with clean form throughout.`,
      quoteText: humor.quote,
      quoteAuthor: humor.speaker,
      hashtags: humor.hashtags,
      wittyTagline: 'Gravity is just an opinion.',
    };

    // -------------------------------------------------------------------------
    // 4. SPORTS GRIT & GENERAL BANTER (KOHLI / BADMINTON / WINGER)
    // -------------------------------------------------------------------------
    const sportsWit = GENERAL_SPORTS_WIT[Math.floor(Math.random() * GENERAL_SPORTS_WIT.length)];
    const isKohli = ctx.includes('kohli') || ctx.includes('cricket') || ctx.includes('chase');
    const isBadminton = ctx.includes('badminton') || ctx.includes('smash') || ctx.includes('shuttle');

    let sportsCaption: AiCaptionSuggestion;
    if (isKohli) {
      sportsCaption = {
        id: 'witty_banter',
        category: 'witty_banter',
        badge: '🏏 Kohli Chase Masterclass',
        title: `MCG 82* Mentality: Ice in the Veins`,
        description: `Approached the final interval like Virat Kohli chasing 180 under floodlights at the MCG: pulse elevated, laser focus, and fierce commitment between the wickets. Never panic, trust the prep, and finish with a flourish! 🏏🔥`,
        quoteText: "Self-belief and hard work will always earn you success.",
        quoteAuthor: "Virat Kohli",
        hashtags: ['#KohliMentality', '#ChaseMaster', '#ClutchPerformer', '#IceInTheVeins', '#MatchFit'],
        wittyTagline: 'Never panic, just execute.',
      };
    } else if (isBadminton) {
      sportsCaption = {
        id: 'witty_banter',
        category: 'witty_banter',
        badge: '🏸 400 km/h Jump Smash',
        title: `Cross-Court Agility & Court Domination`,
        description: `Smashing through mental sluggishness like an angled 400 km/h jump smash down the tramlines. Footwork crisp, court covered, sweat earned. 🏸⚡`,
        quoteText: "You have to believe in yourself when no one else does.",
        quoteAuthor: "Matchday Court Wisdom",
        hashtags: ['#SmashPower', '#CourtAgility', '#FastFeet', '#BadmintonLife'],
        wittyTagline: 'Cover every inch of the court.',
      };
    } else {
      sportsCaption = {
        id: 'witty_banter',
        category: 'witty_banter',
        badge: sportsWit.title,
        title: `${milestone.dayTheme}: Winger Sharpness`,
        description: `${sportsWit.caption}\n\nOn this day: ${milestone.eventDescription}. Pushed through ${distanceOrReps} with explosive cutting angles and relentless drive. ⚡🏆`,
        quoteText: sportsWit.quote,
        quoteAuthor: sportsWit.speaker,
        hashtags: sportsWit.hashtags,
        wittyTagline: milestone.dayTheme,
      };
    }

    return [anfieldCaption, armyCaption, calisthenicsCaption, sportsCaption];
  }

  /**
   * Generates a random surprise motivation alert for midday notifications
   */
  public static getRandomMotivationAlert(): {
    title: string;
    message: string;
    targetAction: string;
    quote: string;
    speaker: string;
  } {
    const prompts = [
      {
        title: '🔴 Anfield Pulse: Drop & Give 10',
        message: 'Klopp once said: "Mentality Monsters fight with what they have." 10 clean push-ups right now!',
        targetAction: 'manual_calisthenics',
        quote: 'We have to change from doubters to believers.',
        speaker: 'Jürgen Klopp',
      },
      {
        title: '🇮🇳 Yeh Dil Mange More!',
        message: 'Captain Vikram Batra scaled Point 5140 against all odds. Drop and give 15 chest-to-deck push-ups right now!',
        targetAction: 'manual_calisthenics',
        quote: 'Yeh Dil Mange More! Either I will hoist the Tricolour or come back wrapped in it.',
        speaker: 'Capt Vikram Batra, PVC',
      },
      {
        title: '🇮🇳 Field Marshal Manekshaw Directive',
        message: 'Field Marshal Manekshaw: "You surrender or we wipe you out." Do not negotiate with your laziness. Move!',
        targetAction: 'daily_recap',
        quote: 'You surrender or we wipe you out.',
        speaker: 'Field Marshal Sam Manekshaw',
      },
      {
        title: '🔴 3-0 Old Trafford Banter Pulse',
        message: 'Pressed harder than Liverpool against Manchester United! Keep that winning tempo alive today.',
        targetAction: 'manual_football',
        quote: 'High intensity without structure is chaos. Dictate the tempo.',
        speaker: 'Arne Slot',
      },
      {
        title: '⚡ Football Agility Check',
        message: 'A winger’s sharpness is built off the pitch! Log your match stats or complete your agility ladder.',
        targetAction: 'manual_football',
        quote: 'No playmaker in the world is as good as a counter-pressing situation.',
        speaker: 'Jürgen Klopp',
      },
      {
        title: '🏏 Virat Kohli 18th Over Mentality',
        message: 'Chase down your daily fitness goal like Kohli at the MCG. Zero panic, maximum intent!',
        targetAction: 'manual_calisthenics',
        quote: 'Self-belief and hard work will always earn you success.',
        speaker: 'Virat Kohli',
      },
      {
        title: '🔴 Shankly Standard Alert',
        message: 'Shankly said: Believing you are the best means nothing without the reps. Don’t break your streak!',
        targetAction: 'daily_recap',
        quote: 'A lot of football success is in the mind. You must believe that you are the best.',
        speaker: 'Bill Shankly',
      },
      {
        title: '🎖️ Commander Iron: Random Drill',
        message: 'Discipline check, soldier! Drop to the floor for a 60-second plank or 15 chest-to-deck push-ups.',
        targetAction: 'manual_calisthenics',
        quote: 'Discipline equals freedom.',
        speaker: 'Commander Iron',
      },
      {
        title: '🔴 Corner Taken Quickly... Origi!',
        message: 'Stay sharp and opportunistic! Seize the remaining daylight hours for your daily aerobic or gym block.',
        targetAction: 'daily_recap',
        quote: 'Pure presence of mind when the world was watching.',
        speaker: 'Anfield Folklore',
      },
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Dismantles an excuse submitted by the user
   */
  public static dismantleExcuse(excuseText: string): { rebuttal: string; battleCry: string } {
    const q = excuseText.toLowerCase();
    if (q.includes('tired') || q.includes('sleep') || q.includes('exhausted')) {
      return {
        rebuttal: 'Fatigue is an obstacle to conquer, not valid discharge papers! Think of Captain Vikram Batra scaling Point 5140, or Jordan Henderson pressing in the 94th minute. Stand up, splash cold water, and knock out your first set!',
        battleCry: 'Yeh Dil Mange More! YNWA!',
      };
    }
    if (q.includes('time') || q.includes('busy') || q.includes('work')) {
      return {
        rebuttal: 'You have the exact same 24 hours as Mohamed Salah, Field Marshal Manekshaw, and history’s greatest leaders. Cut 15 minutes of scrolling and execute your calisthenics block!',
        battleCry: 'Discipline equals freedom!',
      };
    }
    return {
      rebuttal: 'Your excuse has been inspected and categorically denied by Indian Army headquarters and the Anfield tactical room. Action cures fear and lethargy. Execute now!',
      battleCry: 'No excuses, soldier! Ayo Gorkhali!',
    };
  }
}
