# ⚡ Kuchh Bhii (Everything App) — Flagship Athletic OS

[![Release](https://img.shields.io/badge/Release-v2.1.0-brightgreen.svg)](https://github.com/SughoshDixit/Everything-App/releases/tag/v2.1.0)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-blue.svg)](https://github.com/SughoshDixit/Everything-App/releases/latest)
[![Build](https://img.shields.io/badge/Build-Passing-success.svg)]()
[![Dataset](https://img.shields.io/badge/Data-100%25%20Authentic%20Google%20Fit%20%26%20Strava-orange.svg)]()

> **"Transforming data into discipline, discipline into legacy."**  
> Kuchh Bhii is a bespoke athletic operating system and high-performance training companion designed for elite endurance, football tactics, daily discipline tracking, and AI-driven coaching.

---

## 📲 Latest Official Release: v2.1.0 (World-Class UI/UX & Ambient AI Edition)

Download the production-ready Android APK directly from GitHub Releases:

👉 [**Download KuchhBhii-v2.1.0.apk (Direct Download)**](https://github.com/SughoshDixit/Everything-App/releases/download/v2.1.0/KuchhBhii-v2.1.0.apk)  
👉 [**View Official Release v2.1.0 Page**](https://github.com/SughoshDixit/Everything-App/releases/tag/v2.1.0)

---

## 🌟 What's New in v2.1.0

### 🧭 1. 4-Pillar Mobile Cockpit & Central Action FAB
Consolidating 11 fragmented tabs into an intuitive, world-class mobile architecture:
* **Today Cockpit** (`/playbook`): Daily status, ambient copilot, athletic battery gauge, and today's workout plan.
* **Train & Live Tracking** (`/activities`): Direct access to real-time GPS tracking, football match cockpit, pitch armor gear, and heatmaps.
* **Progress & Telemetry** (`/fithub`): Multi-year Google Fit analytics (1,456 days), authentic Strava timeline, and milestone PRs.
* **Vault & Habits** (`/discipline`): Daily discipline muster checklist, fuel & nutrition, Vedas audio focus, and athlete settings.
* **Floating `+` Action FAB**: 1-tap logging for live GPS runs/rides, football matches, push-up sets, and daily recap cards.

### ⚡ 2. Ambient Intelligence Copilot
* **Zero-Prompt Status Pill**: Replaced text-heavy chat cards with a 56px ambient copilot pill displaying real-time readiness (`95% Optimal`), active streak, and dynamic 1-sentence tactical directives.
* **1-Tap Headphone Audio Briefing**: Spoken audio directives before your workout via synthesized TTS.
* **Slide-Over Copilot Sheet**: Non-intrusive drawer for interactive dialogue, tactical adjustments, and quick prompt chips.

### 🌅 3. 0630 Morning Stand-Up & Trinity Rings
* **Athletic Battery Gauge**: Real-time recovery score calculated from recent strain and streak consistency.
* **The 3 Target Rings**: Movement volume, habit discipline percentage, and hydration tracking.
* **1-Tap Muster Call (+25 XP)**: Daily roll-call confirmation with a ceremonial military bugle fanfare.

### 🔊 4. Tactile Sound Effects & Web Audio Engine
* **Mechanical Switch Click-Thud**: Haptic-style audio feedback when checking off daily discipline habits.
* **Level-Up Chimes & Fanfares**: Multi-chord victory fanfare upon session completion.
* **Referee Match Whistle**: Dual-tone whistle for football session logging.
* **Built-in Soundscapes**: 175 SPM Cadence Metronome and 432Hz Vedic Focus continuous drone.

### 👻 5. Ghost Runner Real-Time Pacing
* Live GPS telemetry comparing your current pace against your 4:40/km course PR (*"⚡ Ahead of Target Pace by +42m!"*).
* Automatic launch of the 3D Cesium/Mapbox satellite flyby reel upon completion.

---

## 🚀 Getting Started

### Web Development
```bash
# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev -- --port 5173

# Build web distribution
npm run build
```

### Android Build
```bash
# Sync web build to Android assets
Remove-Item -Path "android-app/app/src/main/assets/web/assets/*" -Force
Copy-Item -Path "dist/assets/*" -Destination "android-app/app/src/main/assets/web/assets/" -Recurse -Force
Copy-Item -Path "dist/index.html" -Destination "android-app/app/src/main/assets/web/index.html" -Force

# Build debug APK using Gradle
cd android-app
./gradlew.bat assembleDebug
```

The compiled APK will be located at `android-app/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📦 Releases

| Release | Version Code | Highlights | APK Download |
| :--- | :---: | :--- | :--- |
| **v2.1.0** | `12` | 4-Pillar Cockpit, Ambient Copilot, 0630 Stand-Up, Tactile Audio | [KuchhBhii-v2.1.0.apk](https://github.com/SughoshDixit/Everything-App/releases/tag/v2.1.0) |
| **v2.0.1** | `11` | 100% Authentic Google Fit & Strava Datasets (1,456 days) | [KuchhBhii-v2.0.1.apk](https://github.com/SughoshDixit/Everything-App/releases/tag/v2.0.1) |
| **v2.0** | `10` | Gen-AI Tactical Studio, GPS Satellite Lock, Restored Athlete Engine | [KuchhBhii-v2.0.apk](https://github.com/SughoshDixit/Everything-App/releases/tag/v2.0) |
| **v1.9** | `9` | Tactical Routine AI, Missed Activity Auto-Detection, Animated Dynamic Trail | [KuchhBhii-v1.9.apk](https://github.com/SughoshDixit/Everything-App/releases/tag/v1.9) |

---

## 📄 License
Private repository & athletic operating system by Sughosh Dixit. All rights reserved.
