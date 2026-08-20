/**
 * Yellow Dude Calisthenics Playbook Data & Progressions
 * Extracted and curated directly from "Calisthenics Playbook for Push Pull Squat.pdf".
 * Features authentic Yellow Dude illustrations, key form cues, benefits,
 * progressions, and combo routines.
 */

export interface PlaybookExercise {
  id: string;
  name: string;
  category: 'push' | 'pull' | 'squat' | 'warmup' | 'core';
  progressionLevel: number;
  levelName: string;
  recommendedSets: number;
  recommendedReps: string;
  restSeconds: number;
  image: string;
  pageNumber: number;
  description: string;
  instructions: string;
  keyCues: string[];
  keyBenefits: string[];
  commonMistakes: string[];
  audioVoiceScript: string;
}

export interface WarmupStep {
  id: string;
  title: string;
  durationSeconds: number;
  image: string;
  instructions: string;
  cues: string[];
  audioScript: string;
}

export interface ComboWorkoutRoutine {
  id: string;
  title: string;
  focus: string;
  targetCategory: 'push' | 'pull' | 'squat' | 'fullbody';
  description: string;
  badge: string;
  warmupDurationMinutes: number;
  transitionRestSeconds: number;
  exercises: PlaybookExercise[];
}

// 6 Structured Warm-Up Steps (30s each = 3 mins)
export const yellowDudeWarmupSteps: WarmupStep[] = [
  {
    id: 'w1',
    title: 'Wrist & Forearm Rotations',
    durationSeconds: 30,
    image: '/playbook/crops/crop_048.png',
    instructions: 'Interlock your fingers and rotate wrists in continuous circles. Switch clockwise and counter-clockwise.',
    cues: ['Keep shoulders down', 'Rotate through full range of motion', 'Gentle pulsing'],
    audioScript: 'First warm-up step: Wrist and forearm rotations. Roll your wrists in continuous circles to lubricate tendons before loading weight.'
  },
  {
    id: 'w2',
    title: 'Arm Circles & Shoulder Windmills',
    durationSeconds: 30,
    image: '/playbook/crops/crop_048.png',
    instructions: 'Extend arms straight out to the sides at shoulder height. Make small controlled circles, gradually widening the radius.',
    cues: ['Keep elbows locked straight', 'Maintain neck neutral', 'Switch directions after 15 seconds'],
    audioScript: 'Second warm-up step: Arm circles and shoulder windmills. Make wide fluid circles to pump blood into deltoids and rotator cuffs.'
  },
  {
    id: 'w3',
    title: 'Scapular Shrugs & Torso Twists',
    durationSeconds: 30,
    image: '/playbook/crops/crop_050.png',
    instructions: 'Pull shoulder blades together, depress downward, then roll forward. Add torso twists to warm up the spine.',
    cues: ['Active scapular retraction', 'Engage core during twists', 'Smooth breathing rhythm'],
    audioScript: 'Third step: Scapular shrugs and torso twists. Squeeze your shoulder blades together and rotate your spine gently.'
  },
  {
    id: 'w4',
    title: 'Cat-Cow & Spine Waves',
    durationSeconds: 30,
    image: '/playbook/crops/crop_052.png',
    instructions: 'On hands and knees, arch spine upward like a cat while exhaling, then drop belly and lift chest on inhale.',
    cues: ['Sync motion with deep breaths', 'Articulate each vertebra', 'Keep hands firmly planted'],
    audioScript: 'Fourth step: Cat-Cow spine waves. Inhale to arch, exhale to round your back, waking up thoracic mobility.'
  },
  {
    id: 'w5',
    title: 'Deep Squat Pry & Hip Opener',
    durationSeconds: 30,
    image: '/playbook/crops/crop_080.png',
    instructions: 'Lower into a deep bodyweight squat. Use elbows inside knees to gently pry open hips and shift weight side to side.',
    cues: ['Keep heels flat on ground', 'Chest upright', 'Shift ankles gently'],
    audioScript: 'Fifth step: Deep squat pry and hip opener. Drop into a deep squat, keeping heels down and opening up groin and ankles.'
  },
  {
    id: 'w6',
    title: 'High Knees & Dynamic Jacks',
    durationSeconds: 30,
    image: '/playbook/crops/crop_032.png',
    instructions: 'Light bouncy high knees or jumping jacks to elevate core body temperature and heart rate.',
    cues: ['Land softly on balls of feet', 'Rhythmic arm swings', 'Deep nasal breathing'],
    audioScript: 'Final warm-up step: High knees and dynamic jacks. Pick up the tempo to elevate heart rate and prime your nervous system!'
  }
];

// Curated Playbook Exercise Library
export const yellowDudeExercises: PlaybookExercise[] = [
  // --- PUSH PROGRESSIONS ---
  {
    id: 'push_plank',
    name: 'Plank Hold',
    category: 'push',
    progressionLevel: 1,
    levelName: 'Level 1: Core Foundation',
    recommendedSets: 3,
    recommendedReps: '30-45s Hold',
    restSeconds: 45,
    image: '/playbook/crops/crop_014.png',
    pageNumber: 14,
    description: 'Foundational isometric exercise that builds endurance across anterior core, shoulders, and glutes.',
    instructions: 'Forearms on the ground, elbows under shoulders. Keep body in a rigid straight plank line from head to heels.',
    keyCues: ['Do not let lower back sag or pike', 'Squeeze glutes & brace abs', 'Push floor away actively'],
    keyBenefits: ['Solid core stability', 'Protects lower spine', 'Builds base for all push-ups'],
    commonMistakes: ['Dropping hips towards floor', 'Lifting hips too high (piking)', 'Holding breath'],
    audioVoiceScript: 'Plank Hold. Keep your body in a rigid line, squeeze your glutes, and push the floor away actively without letting your lower back sag.'
  },
  {
    id: 'push_scapula',
    name: 'Scapula Push-Ups',
    category: 'push',
    progressionLevel: 2,
    levelName: 'Level 2: Scapular Mobility',
    recommendedSets: 3,
    recommendedReps: '10-12 Reps',
    restSeconds: 45,
    image: '/playbook/crops/crop_016.png',
    pageNumber: 16,
    description: 'Focuses entirely on scapular protraction and retraction, bulletproofing shoulder joints and serratus anterior.',
    instructions: 'In push-up plank position with arms straight. Lower chest by pinching shoulder blades together, then push floor away to protract.',
    keyCues: ['Keep arms locked straight at elbows', 'Only move shoulder blades', 'Pause 1s at peak protraction'],
    keyBenefits: ['Strengthens serratus anterior', 'Eliminates winging scapula', 'Shoulder injury prevention'],
    commonMistakes: ['Bending elbows', 'Sagging hips', 'Rushing reps'],
    audioVoiceScript: 'Scapula Push-Ups. Keep your arms locked straight at the elbows. Pinch shoulder blades together on descent, then push the ground away to protract.'
  },
  {
    id: 'push_negative',
    name: 'Negative Push-Ups',
    category: 'push',
    progressionLevel: 3,
    levelName: 'Level 3: Eccentric Strength',
    recommendedSets: 3,
    recommendedReps: '6-8 Reps (4s Lower)',
    restSeconds: 60,
    image: '/playbook/crops/crop_018.png',
    pageNumber: 18,
    description: 'Focuses on the lowering phase under high tension, rapidly building muscle memory and chest strength.',
    instructions: 'Start in top plank position. Take 4 slow seconds to lower chest to floor in rigid form. Reset at top using knees.',
    keyCues: ['Strict 4-second controlled descent', 'Elbows tucked at 45 degrees', 'Chest touches floor softly'],
    keyBenefits: ['Fastest bridge to full push-ups', 'High eccentric muscle hypertrophy', 'Tendon strengthening'],
    commonMistakes: ['Dropping fast in bottom half', 'Flaring elbows out to 90 degrees', 'Arching back'],
    audioVoiceScript: 'Negative Push-Ups. Take four slow seconds to lower your chest to the floor with full control, keeping your elbows tucked at 45 degrees.'
  },
  {
    id: 'push_standard',
    name: 'Standard Push-Ups',
    category: 'push',
    progressionLevel: 4,
    levelName: 'Level 4: Calisthenics Benchmark',
    recommendedSets: 3,
    recommendedReps: '10-15 Reps',
    restSeconds: 60,
    image: '/playbook/crops/crop_020.png',
    pageNumber: 20,
    description: 'The gold standard bodyweight movement for upper body power, chest hypertrophy, and tricep development.',
    instructions: 'Hands shoulder-width apart. Lower until chest is an inch from floor, then push explosively back to top lockout.',
    keyCues: ['Straight body line head to heels', '45-degree elbow angle', 'Full range of motion lockout'],
    keyBenefits: ['Pectoral mass & tricep power', 'Core tension coordination', 'No equipment needed'],
    commonMistakes: ['Half reps (shallow depth)', 'Flaring elbows 90 degrees', 'Craning neck forward'],
    audioVoiceScript: 'Standard Push-Ups. Lower your chest until it almost touches the floor, keeping elbows at 45 degrees, then press back up explosively.'
  },
  {
    id: 'push_wide',
    name: 'Wide Grip Push-Ups',
    category: 'push',
    progressionLevel: 5,
    levelName: 'Level 5: Outer Chest Focus',
    recommendedSets: 3,
    recommendedReps: '8-12 Reps',
    restSeconds: 60,
    image: '/playbook/crops/crop_026.png',
    pageNumber: 26,
    description: 'Placing hands wider increases the horizontal adduction load on outer pectorals and anterior delts.',
    instructions: 'Place hands 1.5 to 2 palms wider than shoulder width. Lower chest down slowly and press firmly through palms.',
    keyCues: ['Wrists turned slightly outward', 'Full chest stretch at bottom', 'Brace core firmly'],
    keyBenefits: ['Outer chest sweep', 'Enhanced horizontal pushing width', 'Increased pec recruitment'],
    commonMistakes: ['Excessive shoulder shrugging', 'Flaring elbows straight out', 'Restricted depth'],
    audioVoiceScript: 'Wide Grip Push-Ups. Hands two palms wider than shoulder width. Feel the stretch across your outer chest, lower with control and press.'
  },
  {
    id: 'push_diamond',
    name: 'Diamond Push-Ups & Tricep Extensions',
    category: 'push',
    progressionLevel: 6,
    levelName: 'Level 6: Tricep Overload',
    recommendedSets: 3,
    recommendedReps: '8-10 Reps',
    restSeconds: 75,
    image: '/playbook/crops/crop_030.png',
    pageNumber: 30,
    description: 'Brings thumbs and index fingers together into a diamond shape, heavily shifting mechanical advantage to the triceps.',
    instructions: 'Hands under center chest forming a diamond shape. Lower chest to touch back of hands, press up focusing on triceps.',
    keyCues: ['Keep elbows tucked close to ribs', 'Control descent', 'Lock out triceps at apex'],
    keyBenefits: ['Massive tricep growth', 'Inner chest definition', 'Lockout strength for dips and dips'],
    commonMistakes: ['Elbows flaring excessively', 'Dropping head to hands instead of chest', 'Piking hips'],
    audioVoiceScript: 'Diamond Push-Ups. Thumbs and index fingers form a diamond under your chest. Keep elbows tucked tight to your ribs and lock out triceps at the top.'
  },
  {
    id: 'push_archer',
    name: 'Archer Push-Ups',
    category: 'push',
    progressionLevel: 7,
    levelName: 'Level 7: Unilateral Pushing',
    recommendedSets: 3,
    recommendedReps: '5 Reps / Side',
    restSeconds: 90,
    image: '/playbook/crops/crop_036.png',
    pageNumber: 36,
    description: 'Advanced progression towards the one-arm push-up where you lower towards one arm while extending the other straight out.',
    instructions: 'Wide hand stance. Shift body over to one side as you bend that arm, keeping the opposite assisting arm fully straight.',
    keyCues: ['Assisting arm stays locked straight', 'Chest close to working hand', 'Alternate smoothly'],
    keyBenefits: ['True unilateral single-arm strength', 'Incredible core rotational control', 'Gateway to One-Arm Push-Up'],
    commonMistakes: ['Bending the straight assisting arm', 'Twisting hips off balance', 'Shortening range of motion'],
    audioVoiceScript: 'Archer Push-Ups. Lower your body directly over one hand while keeping the other arm completely locked straight like an archer drawing a bow.'
  },

  // --- PULL PROGRESSIONS ---
  {
    id: 'pull_dead_hang',
    name: 'Passive Dead Hang',
    category: 'pull',
    progressionLevel: 1,
    levelName: 'Level 1: Grip & Shoulder Decompression',
    recommendedSets: 3,
    recommendedReps: '30-45s Hold',
    restSeconds: 60,
    image: '/playbook/crops/crop_059.png',
    pageNumber: 59,
    description: 'Decompresses the spine, strengthens grip tendons, and conditions shoulder joints for hanging.',
    instructions: 'Hang from pull-up bar with overhand grip slightly wider than shoulder width. Relax shoulders up near ears and breathe deep.',
    keyCues: ['Full finger wrap around bar', 'Relax spine and legs', 'Steady diaphragmatic breathing'],
    keyBenefits: ['Spinal decompression', 'Ironclad grip strength', 'Shoulder impingement relief'],
    commonMistakes: ['Shallow finger grip (slipping)', 'Swinging legs', 'Holding breath'],
    audioVoiceScript: 'Passive Dead Hang. Wrap all fingers firmly around the bar, relax your spine completely, and breathe deep into your belly.'
  },
  {
    id: 'pull_scapula',
    name: 'Scapula Pull-Ups',
    category: 'pull',
    progressionLevel: 2,
    levelName: 'Level 2: Scapular Depression',
    recommendedSets: 3,
    recommendedReps: '8-10 Reps',
    restSeconds: 60,
    image: '/playbook/crops/crop_062.png',
    pageNumber: 62,
    description: 'Builds the initial initiation strength of the pull-up by pulling shoulder blades down without bending arms.',
    instructions: 'From a dead hang, pull shoulder blades DOWN away from your ears to elevate chest. Hold 1s, then lower back to passive hang.',
    keyCues: ['Keep arms locked straight', 'Drive shoulder blades into back pockets', 'Pause at peak contraction'],
    keyBenefits: ['Unlocks the initial pull-up ascent', 'Lat activation mastery', 'Scapular stability'],
    commonMistakes: ['Bending elbows to cheat', 'Kicking legs', 'Zero pause at top'],
    audioVoiceScript: 'Scapula Pull-Ups. Keep arms completely straight. Pull your shoulder blades down and back to lift your chest, then return to a full hang.'
  },
  {
    id: 'pull_australian',
    name: 'Australian Incline Rows',
    category: 'pull',
    progressionLevel: 3,
    levelName: 'Level 3: Horizontal Pulling',
    recommendedSets: 3,
    recommendedReps: '8-12 Reps',
    restSeconds: 60,
    image: '/playbook/crops/crop_064.png',
    pageNumber: 64,
    description: 'Horizontal bodyweight row performed on a waist-height bar. Builds rhomboids, lats, and biceps.',
    instructions: 'Hold bar with body in an incline underneath. Pull chest up to touch the bar, squeezing shoulder blades together at top.',
    keyCues: ['Body stays in rigid plank', 'Lead with chest, not chin', 'Squeeze lats at top'],
    keyBenefits: ['Upper back thickness', 'Bicep & grip strength', 'Postural correction'],
    commonMistakes: ['Sagging hips', 'Jerking with momentum', 'Not touching chest to bar'],
    audioVoiceScript: 'Australian Incline Rows. Pull your chest straight to the bar, squeeze your shoulder blades firmly, and lower down under full control.'
  },
  {
    id: 'pull_negative',
    name: 'Negative Pull-Ups',
    category: 'pull',
    progressionLevel: 4,
    levelName: 'Level 4: Eccentric Overload',
    recommendedSets: 3,
    recommendedReps: '4-6 Reps (5s Lower)',
    restSeconds: 90,
    image: '/playbook/crops/crop_068.png',
    pageNumber: 68,
    description: 'Jump or step to the top of the bar, then resist gravity on a slow 5-second descent to build pulling power.',
    instructions: 'Jump chin over the bar. Hold for 1 second, then lower down across 5 strict seconds to a dead hang.',
    keyCues: ['5-second uniform descent speed', 'Do not drop at the bottom', 'Reset with a jump'],
    keyBenefits: ['Fastest way to unlock first clean pull-up', 'Massive lat hypertrophy', 'Forearm strength'],
    commonMistakes: ['Dropping quickly through the last 3 inches', 'Shrugging shoulders into neck', 'Rushing reps'],
    audioVoiceScript: 'Negative Pull-Ups. Jump your chin over the bar, hold, and resist gravity for five slow seconds all the way down to a complete hang.'
  },
  {
    id: 'pull_standard',
    name: 'Strict Pull-Ups',
    category: 'pull',
    progressionLevel: 5,
    levelName: 'Level 5: Master Calisthenic Pull',
    recommendedSets: 3,
    recommendedReps: '5-8 Clean Reps',
    restSeconds: 90,
    image: '/playbook/crops/crop_072.png',
    pageNumber: 72,
    description: 'The king of upper body pulling exercises. Full dead hang to chin over bar with zero momentum or kipping.',
    instructions: 'From dead hang, engage scapula, drive elbows down into ribs, pull chest to bar until chin clears bar. Lower under control.',
    keyCues: ['Dead hang at bottom of every rep', 'Chin cleanly over bar', 'Zero leg kicking or kipping'],
    keyBenefits: ['V-taper lat development', 'Bicep & forearm power', 'Ultimate relative upper body strength'],
    commonMistakes: ['Kicking legs (kipping)', 'Half reps (not extending arms at bottom)', 'Reaching chin up without chest height'],
    audioVoiceScript: 'Strict Pull-Ups. Start from a dead hang. Drive your elbows down to pull your chest to the bar, clear your chin cleanly, and lower with control.'
  },

  // --- SQUAT & LEG PROGRESSIONS ---
  {
    id: 'squat_bodyweight',
    name: 'Bodyweight Squats',
    category: 'squat',
    progressionLevel: 1,
    levelName: 'Level 1: Lower Body Base',
    recommendedSets: 3,
    recommendedReps: '15-20 Reps',
    restSeconds: 60,
    image: '/playbook/crops/crop_080.png',
    pageNumber: 80,
    description: 'The foundational knee-dominant movement building quad endurance, glute activation, and ankle mobility.',
    instructions: 'Feet shoulder-width apart, toes angled slightly out. Sit hips back and down until thighs are parallel or below knees.',
    keyCues: ['Heels stay glued to floor', 'Knees track over toes', 'Chest upright'],
    keyBenefits: ['Quad & glute endurance', 'Hip mobility', 'Knee joint resilience'],
    commonMistakes: ['Heels coming off ground', 'Knees caving inward (valgus)', 'Rounding lower back'],
    audioVoiceScript: 'Bodyweight Squats. Keep your heels glued down, send hips back and down, and ensure knees track directly in line with your toes.'
  },
  {
    id: 'squat_deep',
    name: 'Deep ATG Squats',
    category: 'squat',
    progressionLevel: 2,
    levelName: 'Level 2: Full Range Depth',
    recommendedSets: 3,
    recommendedReps: '12-15 Reps',
    restSeconds: 60,
    image: '/playbook/crops/crop_086.png',
    pageNumber: 86,
    description: 'Ass-to-grass full depth squat improving hip flexion, ankle dorsiflexion, and knee tendon longevity.',
    instructions: 'Descend below parallel into a deep comfortable squat. Pause 1s in the hole, then drive through mid-foot to stand.',
    keyCues: ['Full depth range of motion', '1s pause at bottom', 'Keep torso proud'],
    keyBenefits: ['Deep hip mobility', 'Patellar tendon bulletproofing', 'Full quad stretch'],
    commonMistakes: ['Bouncing out of bottom', 'Collapsing chest forward', 'Excessive butt wink'],
    audioVoiceScript: 'Deep ATG Squats. Descend below parallel for a full stretch, pause briefly at the bottom, and drive smoothly through your heels to stand.'
  },
  {
    id: 'squat_bulgarian',
    name: 'Bulgarian Split Squats',
    category: 'squat',
    progressionLevel: 3,
    levelName: 'Level 3: Unilateral Leg Power',
    recommendedSets: 3,
    recommendedReps: '8-10 Reps / Leg',
    restSeconds: 75,
    image: '/playbook/crops/crop_088.png',
    pageNumber: 88,
    description: 'Elevates rear foot on a chair or bench to isolate the front leg, fixing muscle imbalances and building athletic sprint power.',
    instructions: 'Rear foot on elevated bench/box. Lower back knee towards floor in a vertical motion, front knee at 90 degrees. Drive up.',
    keyCues: ['Vertical torso motion', 'Front knee stays aligned with foot', '90% weight on front leg'],
    keyBenefits: ['Explosive single-leg power', 'Hip flexor stretch on trailing leg', 'Fixes quad imbalances'],
    commonMistakes: ['Front foot too close to bench', 'Leaning heavily on rear leg', 'Knee collapsing inward'],
    audioVoiceScript: 'Bulgarian Split Squats. Elevate your rear foot, lower your back knee vertically towards the floor, and drive through the front heel.'
  },
  {
    id: 'squat_cossack',
    name: 'Cossack Squats',
    category: 'squat',
    progressionLevel: 4,
    levelName: 'Level 4: Frontal Plane Agility',
    recommendedSets: 3,
    recommendedReps: '6-8 Reps / Side',
    restSeconds: 75,
    image: '/playbook/crops/crop_092.png',
    pageNumber: 92,
    description: 'Lateral single-leg squat that trains the frontal plane, stretching the adductors while building deep single-leg mobility.',
    instructions: 'Wide stance. Squat deeply to one side while keeping the extended leg straight with toes rotated upward. Alternate sides.',
    keyCues: ['Squatting heel remains flat on floor', 'Straight leg toes point up', 'Keep spine straight'],
    keyBenefits: ['Groin & hamstring flexibility', 'Lateral agility for football', 'Pistol squat balance pre-requisite'],
    commonMistakes: ['Heel lifting on squatting leg', 'Rounding spine forward', 'Restricted side depth'],
    audioVoiceScript: 'Cossack Squats. Shift your weight into a deep lateral squat on one side, keeping that heel flat and rotating opposite toes toward the sky.'
  },
  {
    id: 'squat_pistol',
    name: 'Pistol Squats (Assisted / Full)',
    category: 'squat',
    progressionLevel: 5,
    levelName: 'Level 5: Master Single-Leg Squat',
    recommendedSets: 3,
    recommendedReps: '5 Reps / Leg',
    restSeconds: 90,
    image: '/playbook/crops/crop_098.png',
    pageNumber: 98,
    description: 'The ultimate calisthenics leg exercise requiring massive single-leg strength, ankle dorsiflexion, and balance.',
    instructions: 'Balance on one foot with opposite leg held straight forward. Lower into a deep one-leg squat, then press back up smoothly.',
    keyCues: ['Counterbalance with arms forward', 'Extended leg stays off ground', 'Drive through mid-foot'],
    keyBenefits: ['Elite single-leg strength', 'Complete quad & glute hypertrophy', 'Unrivaled athletic balance'],
    commonMistakes: ['Heel rising off ground', 'Letting knee cave inward', 'Dropping into bottom without control'],
    audioVoiceScript: 'Pistol Squats. Extend one leg forward, lower under strict control into a deep single-leg squat, and drive through your heel to stand tall.'
  }
];

// Presets for the 3-Stage Guided Combo Workouts
export const yellowDudeComboRoutines: ComboWorkoutRoutine[] = [
  {
    id: 'combo_push',
    title: 'Push Power Combo (Chest, Shoulders & Triceps)',
    focus: 'Push Hypertrophy & One-Arm Progression',
    targetCategory: 'push',
    description: 'Full guided session: 3-minute dynamic warm-up, 60s recovery pause, followed by the complete Yellow Dude Push progression.',
    badge: 'UPPER BODY PUSH',
    warmupDurationMinutes: 3,
    transitionRestSeconds: 60,
    exercises: [
      yellowDudeExercises.find((e) => e.id === 'push_scapula')!,
      yellowDudeExercises.find((e) => e.id === 'push_negative')!,
      yellowDudeExercises.find((e) => e.id === 'push_standard')!,
      yellowDudeExercises.find((e) => e.id === 'push_wide')!,
      yellowDudeExercises.find((e) => e.id === 'push_diamond')!
    ]
  },
  {
    id: 'combo_pull',
    title: 'Pull & Back Hypertrophy Combo (Lats & Biceps)',
    focus: 'Back Width, Scapular Control & Pull-Up Mastery',
    targetCategory: 'pull',
    description: 'Full guided session: 3-minute dynamic warm-up, 60s recovery pause, followed by the complete Yellow Dude Pull progression.',
    badge: 'UPPER BODY PULL',
    warmupDurationMinutes: 3,
    transitionRestSeconds: 60,
    exercises: [
      yellowDudeExercises.find((e) => e.id === 'pull_dead_hang')!,
      yellowDudeExercises.find((e) => e.id === 'pull_scapula')!,
      yellowDudeExercises.find((e) => e.id === 'pull_australian')!,
      yellowDudeExercises.find((e) => e.id === 'pull_negative')!,
      yellowDudeExercises.find((e) => e.id === 'pull_standard')!
    ]
  },
  {
    id: 'combo_squat',
    title: 'Leg Agility & Pistol Squat Combo (Quads, Glutes & Mobility)',
    focus: 'Explosive Single-Leg Power & Pistol Progression',
    targetCategory: 'squat',
    description: 'Full guided session: 3-minute dynamic warm-up, 60s recovery pause, followed by the complete Yellow Dude Leg & Pistol progression.',
    badge: 'LEGS & AGILITY',
    warmupDurationMinutes: 3,
    transitionRestSeconds: 60,
    exercises: [
      yellowDudeExercises.find((e) => e.id === 'squat_bodyweight')!,
      yellowDudeExercises.find((e) => e.id === 'squat_deep')!,
      yellowDudeExercises.find((e) => e.id === 'squat_bulgarian')!,
      yellowDudeExercises.find((e) => e.id === 'squat_cossack')!,
      yellowDudeExercises.find((e) => e.id === 'squat_pistol')!
    ]
  },
  {
    id: 'combo_fullbody',
    title: 'Full Body Athletic Triplet Combo',
    focus: 'Push + Pull + Squat Total Athletic Conditioning',
    targetCategory: 'fullbody',
    description: 'Complete 3-phase athletic combo: Dynamic Warmup, 60s rest, and a balanced triplet of standard Push, Pull, and Squat.',
    badge: 'TOTAL ATHLETE',
    warmupDurationMinutes: 3,
    transitionRestSeconds: 60,
    exercises: [
      yellowDudeExercises.find((e) => e.id === 'push_standard')!,
      yellowDudeExercises.find((e) => e.id === 'pull_standard')!,
      yellowDudeExercises.find((e) => e.id === 'squat_bulgarian')!,
      yellowDudeExercises.find((e) => e.id === 'push_plank')!
    ]
  }
];
