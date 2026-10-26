### Kuchh Bhii v1.9 — Tactical Routine AI, Missed Activity Auto-Detection & Animated Dynamic Trail Studio

#### 🎯 Passive Background Workout Auto-Detection (Missed Activity Recovery)
- **Low-Power Sensor Cadence Engine**: Integrated native Android `AutoActivityDetector.kt` utilizing hardware `Sensor.TYPE_STEP_DETECTOR` (with dynamic accelerometer peak fallback) and `LocationManager.PASSIVE_PROVIDER` for zero wake-lock battery drain.
- **Sliding-Window Movement Classification**: 
  - Classifies continuous movements in rolling 30-second windows:
    - **Running**: $\ge 125$ spm sustained for $\ge 3$ minutes (average stride $\approx 1.05$m).
    - **Walking**: $65 - 124$ spm sustained for $\ge 4$ minutes (average stride $\approx 0.76$m).
    - **Cycling**: Ground speed $12 - 45$ km/h with low step cadence ($< 40$ spm).
    - **Football Match**: Burst acceleration variance ($> 3.5\text{ m/s}^2$) with cadence $> 135$ spm.
- **Instant System Alerts & Deep Linking**: Automatically fires a high-priority Android notification upon workout completion (*"🎯 Missed Workout Detected! We noticed an unlogged 28-min Run (4.1 km) while the app was closed. Tap to add to your streak!"*) with direct deep link into the review modal.
- **Recovery Modal & In-App Banner**: Surfaced prominently at the top of the Dashboard and Activities tab. Supports 1-tap confirmation, distance fine-tuning, and immediate inclusion in daily streaks and recap posts. Includes 1-tap simulation buttons for instant testing.

#### 🏃 Animated Dynamic Runner & Athlete Marker in Video Exports
- **Canvas-Rendered Athlete Avatar**: Replaced the static puck in downloaded videos with a dynamic runner avatar featuring:
  - Street-level directional illumination beam oriented along the athlete's heading vector.
  - Expanding radar pulse ring animating with elapsed time.
  - Trigonometric running stride cadence bounce (`Math.sin(elapsed * 0.014) * 3.5`) and natural forward lean.
  - Activity-specific emoji icons (`🏃`, `🚴`, `🚶`, `⚽`, `🏸`, `🚗`) rendering at 60 FPS across both preview and exported 9:16 vertical videos.
- **Updated Renderers**: Fully integrated in `activityExportService.ts`, `SocialWorkoutShareModal.tsx`, and `StravaRouteFlybyPlayer.tsx`.

#### 🎖️ Tactical Routine & Army Mindset Motivation Engine
- **Military Cadence & Discipline System**: Enforces balanced workout and active recovery routines inspired by Indian Army training ethos.
- **Voice Cues & Audio Metronomes**: Provides audible countdowns, drill beeps, and military cadence chants during high-intensity intervals and morning discipline routines.

#### ⚽ Creative Sports AI & Contextual Football Wit (Liverpool FC & Tactical Quotes)
- **Creative Caption Engine**: Generates witty, humorous, and high-octane social captions linking daily workout metrics to Liverpool FC triumphs (e.g. Anfield comebacks, Arne Slot high-press tactics) and iconic Indian Army warrior quotes.
- **Adaptive Daily History Prompts**: Automatically suggests captions tailored to the day's athletic focus.

#### 📝 Manual Multi-Sport Activity Logger & End-of-Day Consolidation
- **Manual Logging for Matches & Calisthenics**: Quick entry modals to document football matches, badminton games, and calisthenics reps (e.g., 15 diamond push-ups, strict pull-ups).
- **Consolidated Daily Recap**: 1-tap compilation tool that aggregates all fragmented activities into a single shareable story/post for Instagram, WhatsApp, and Strava.

#### 🗺️ Route Intelligence & World-Class Export Fixes
- **Interactive Map Previews**: Fixed Leaflet and Google Maps route previews and restored 4K poster generation in the Activities tab.
- **Native Android Sharing**: Restored `shareBase64Media` bridge to share videos and posters directly via system share sheets.

#### 📦 Release Asset
- **File**: `KuchhBhii-v1.9.apk`
- **Target SDK**: Android 34 (compileSdk 36, minSdk 24)
- **Permissions Added**: `android.permission.ACTIVITY_RECOGNITION`
