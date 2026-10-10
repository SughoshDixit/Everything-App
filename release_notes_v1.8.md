### Kuchh Bhii v1.8 — Notification Center, AI Recovery Coach, Voice Splits & Launcher Shortcuts

#### 🔔 Notification Center & Native Android Alarm Scheduler
- **Interactive Notification Center Drawer**: Replaced the static header popover with an interactive drawer featuring unread counter badges, categorized activity alerts (*Milestones, Streaks, Workouts, Media*), and one-tap navigation.
- **On-Device Alarm Clock Scheduling**: Integrated native Android `AlarmScheduler.kt` and `AlarmReceiver.kt` via `window.AndroidBridge`. Exact RTC wake alarms trigger reminders for:
  - Morning Calisthenics & Mobility (07:00)
  - Football Training & Pitch Prep (17:30)
  - Daily Streak Safeguard (20:30)
  - Vedic Chants & Rest (21:30)
- **Immediate Alert Testing**: Users can test system notifications and native audio tones directly from the in-app drawer.

#### 🤖 AI Daily Athletic & Recovery Coach ("Coach Dude")
- **Unified Readiness Engine**: Synthesizes Google Fit resting heart rate, sleep hours, Strava training volume, and discipline streaks into a real-time 0–100% athletic readiness score.
- **Contextual Morning Briefings**: Daily prescription cards advising on optimal training load, targeted hydration (e.g. 3.2L), and recovery protocols.
- **Interactive Coach Dialogue**: Pre-built tactical inquiry chips for post-match nutrition, calisthenics intensity, 5K pacing, and foam rolling protocols.

#### 🎙️ In-Run Voice Coaching & Haptic Split Cues
- **Kilometer Split Audio Announcements**: Automatically speaks split times and current pace (e.g., *"Kilometer 3 complete. Current pace 4:48."*) via native TTS or Web Speech API.
- **Vibration Feedback**: Delivers tactile haptic pulses on completing every 1.0 km interval.
- **Audio Coach Toggle**: Dedicated volume button in the GPS activity tracker modal allows muting or unmuting voice cues instantly.

#### 🎮 Athlete Skill Tree & Progression Gamification
- **The 4 Athletic Pillars**: Tracks XP across *Aerobic Endurance*, *Upper Body Strength*, *Pitch Explosiveness*, and *Vedic Mindfulness*.
- **Level & Tier Badges**: Displays current athlete level and tier (*Rookie Strider, Varsity Playmaker, Iron Spartan, Vedic Titan*) with milestone progress bars.

#### 📱 Android App Launcher Shortcuts
- **Static Android Launcher Quick Actions**: Long-pressing the app icon from your phone home screen provides instant access to:
  - 🏃 *Start Run*
  - ⚡ *Log Workout*
  - ⚽ *Match Log*
  - 🕉️ *Vedas Chants*

#### 📦 Release Asset
- **File**: `KuchhBhii-v1.8.apk` (~279 MB)
- **Target SDK**: Android 34 (compileSdk 36, minSdk 24)
- **Architecture**: Native Kotlin Jetpack Compose host + AndroidX `WebViewAssetLoader` with embedded Vite React 18 production bundle.
