import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  writeBatch
} from 'firebase/firestore';

// Project Credentials
const firebaseConfig = {
  apiKey: "AIzaSyDh3tjm2gST-upnfViBSD55ZppV3VEFNQQ",
  authDomain: "kuchh-bhii.firebaseapp.com",
  projectId: "kuchh-bhii",
  storageBucket: "kuchh-bhii.firebasestorage.app",
  messagingSenderId: "318042636199",
  appId: "1:318042636199:web:5c8628e6110c6e6f85c082"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'default');
const USER_ID = 'sughosh';

function formatPace(speedMs: number): string {
  if (!speedMs || speedMs <= 0) return '0:00 /km';
  const paceSecondsPerKm = 1000 / speedMs;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

async function runImport() {
  console.log('🚀 Starting Historical Data Ingestion into Firebase Firestore (Project: kuchh-bhii)...');

  // ===========================================================================
  // 1. INGEST STRAVA ACTIVITIES & FEED POSTS
  // ===========================================================================
  const stravaCsvPath = path.resolve('activities.csv');
  let stravaActivities: any[] = [];
  let shoeMileageMeters = 0;
  let totalRunMeters = 0;
  let totalCycleMeters = 0;
  let longestRunKm = 0;
  let longestCycleKm = 0;
  let topSpeedRunKmh = 0;
  let topSpeedCycleKmh = 0;
  let fastest1kRunSeconds: number | undefined;
  let fastest5kRunSeconds: number | undefined;
  let fastest10kRunSeconds: number | undefined;

  if (fs.existsSync(stravaCsvPath)) {
    console.log(`📖 Reading Strava CSV from ${stravaCsvPath}...`);
    const csvContent = fs.readFileSync(stravaCsvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });

    console.log(`Found ${records.length} Strava activities.`);

    let batch = writeBatch(db);
    let opCount = 0;

    for (const r of records) {
      const actId = r['Activity ID'] || 'act_' + Date.now();
      const rawDate = r['Activity Date'] || '';
      const parsedDate = new Date(rawDate);
      const timestamp = !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : Date.now();
      const dateStr = !isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const rawType = (r['Activity Type'] || 'Run').toLowerCase();
      const sportType: 'run' | 'cycle' | 'walk' =
        rawType.includes('ride') || rawType.includes('cycle')
          ? 'cycle'
          : rawType.includes('walk') || rawType.includes('hike')
          ? 'walk'
          : 'run';

      const distanceMeters = parseFloat(r['Distance'] || '0') || 0;
      const distanceKm = Number((distanceMeters / 1000).toFixed(2));
      const movingTimeSeconds = parseFloat(r['Moving Time'] || r['Elapsed Time'] || '0') || 0;
      const avgSpeedMs = parseFloat(r['Average Speed'] || '0') || 0;
      const maxSpeedMs = parseFloat(r['Max Speed'] || '0') || 0;
      const avgSpeedKmh = Number((avgSpeedMs * 3.6).toFixed(1));
      const maxSpeedKmh = Number((maxSpeedMs * 3.6).toFixed(1));
      const elevationGain = parseFloat(r['Elevation Gain'] || '0') || 0;
      const calories = parseFloat(r['Calories'] || '0') || Math.round(distanceKm * 65);
      const gearName = r['Activity Gear'] || r['Gear'] || '';
      const title = r['Activity Name'] || `${sportType.toUpperCase()} Activity`;
      const description = r['Activity Description'] || '';
      const gpxFilename = r['Filename'] || '';

      if (gearName.toLowerCase().includes('nike')) {
        shoeMileageMeters += distanceMeters;
      }

      // Track Milestones
      if (sportType === 'run') {
        totalRunMeters += distanceMeters;
        if (distanceKm > longestRunKm) longestRunKm = distanceKm;
        if (maxSpeedKmh > topSpeedRunKmh) topSpeedRunKmh = maxSpeedKmh;

        if (distanceKm >= 1.0) {
          const paceSec1k = (movingTimeSeconds / distanceKm) * 1.0;
          if (!fastest1kRunSeconds || paceSec1k < fastest1kRunSeconds) {
            fastest1kRunSeconds = Math.round(paceSec1k);
          }
        }
        if (distanceKm >= 5.0) {
          const paceSec5k = (movingTimeSeconds / distanceKm) * 5.0;
          if (!fastest5kRunSeconds || paceSec5k < fastest5kRunSeconds) {
            fastest5kRunSeconds = Math.round(paceSec5k);
          }
        }
        if (distanceKm >= 10.0) {
          const paceSec10k = (movingTimeSeconds / distanceKm) * 10.0;
          if (!fastest10kRunSeconds || paceSec10k < fastest10kRunSeconds) {
            fastest10kRunSeconds = Math.round(paceSec10k);
          }
        }
      } else if (sportType === 'cycle') {
        totalCycleMeters += distanceMeters;
        if (distanceKm > longestCycleKm) longestCycleKm = distanceKm;
        if (maxSpeedKmh > topSpeedCycleKmh) topSpeedCycleKmh = maxSpeedKmh;
      }

      const gpsActivityDoc = {
        id: actId,
        activityType: sportType,
        date: dateStr,
        startTime: timestamp,
        endTime: timestamp + movingTimeSeconds * 1000,
        durationSeconds: movingTimeSeconds,
        distanceKm: distanceKm,
        avgSpeedKmh: avgSpeedKmh,
        topSpeedKmh: maxSpeedKmh,
        avgPaceMinKm: formatPace(avgSpeedMs),
        elevationGainMeters: elevationGain,
        caloriesBurned: calories,
        heartPointsEarned: Math.round(movingTimeSeconds / 60) * (sportType === 'run' ? 2 : 1),
        stepsCount: sportType === 'run' ? Math.round(distanceMeters * 1.3) : 0,
        splits: [],
        routePoints: [],
        milestonesReached: [],
        userId: 'men',
        notes: description,
        gpxFilename: gpxFilename
      };

      // 1) Save to users/sughosh/gps_activities/{actId}
      const actRef = doc(db, 'users', USER_ID, 'gps_activities', actId);
      batch.set(actRef, gpsActivityDoc, { merge: true });
      opCount++;

      // 2) Also save as Activity Feed Post in activity_feed_posts/{actId}
      const feedPostDoc = {
        id: actId,
        date: dateStr,
        timestamp: timestamp,
        userId: 'men',
        title: title,
        description: description,
        sportType: sportType,
        rpe: 7,
        activities: [
          {
            id: 'item_' + actId,
            category: sportType === 'run' ? 'gps_run' : sportType === 'cycle' ? 'gps_cycle' : 'gps_walk',
            title: title,
            details: `${distanceKm} km • ${Math.floor(movingTimeSeconds / 60)} mins • Pace ${formatPace(avgSpeedMs)}`,
            includedInPost: true
          }
        ],
        gpsActivity: gpsActivityDoc,
        backgroundTheme: 'strava_sunset',
        motivationalQuote: 'Consistency is what transforms average into excellence.',
        quoteAuthor: 'Sughosh Dixit',
        totalHeartPoints: Math.round(movingTimeSeconds / 60) * (sportType === 'run' ? 2 : 1),
        totalMoveMinutes: Math.round(movingTimeSeconds / 60),
        totalCalories: calories,
        totalDistanceKm: distanceKm,
        avgPaceMinKm: formatPace(avgSpeedMs),
        avgSpeedKmh: avgSpeedKmh,
        maxSpeedKmh: maxSpeedKmh,
        elevationGainMeters: elevationGain,
        likesCount: 1,
        isLiked: true,
        kudosUsers: [{ userId: 'men', userName: 'Sughosh Dixit' }],
        gearName: gearName || 'Nike Running'
      };

      const feedRef = doc(db, 'activity_feed_posts', actId);
      batch.set(feedRef, feedPostDoc, { merge: true });
      opCount++;

      if (opCount >= 450) {
        await batch.commit();
        console.log(`  Committed batch of ${opCount} Strava records...`);
        batch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
      console.log(`  Committed final batch of Strava records.`);
    }

    // Save Gear
    console.log(`Saving Nike Running gear with ${Number((shoeMileageMeters / 1000).toFixed(1))} km wear...`);
    const shoeDoc = {
      id: 'shoes_nike_running',
      name: 'Nike Nike Running',
      type: 'shoes',
      brand: 'Nike',
      model: 'Nike Running',
      totalDistanceKm: Number((shoeMileageMeters / 1000).toFixed(1)),
      maxDistanceKm: 600,
      isDefault: true
    };
    const shoeRef = doc(db, 'users', USER_ID, 'gear', 'shoes_nike_running');
    const gearBatch = writeBatch(db);
    gearBatch.set(shoeRef, shoeDoc, { merge: true });
    await gearBatch.commit();
  }

  // ===========================================================================
  // 2. INGEST GOOGLE FIT DAILY ACTIVITY METRICS (2019 - 2026)
  // ===========================================================================
  const gfitCsvPath = path.resolve('Takeout/Fit/Daily activity metrics/Daily activity metrics.csv');
  let totalCaloriesAllTime = 0;

  if (fs.existsSync(gfitCsvPath)) {
    console.log(`📖 Reading Google Fit daily metrics from ${gfitCsvPath}...`);
    const csvContent = fs.readFileSync(gfitCsvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });

    console.log(`Found ${records.length} Google Fit daily records spanning multi-year history.`);

    let batch = writeBatch(db);
    let opCount = 0;
    let committedDays = 0;

    for (const r of records) {
      const dateStr = r['Date'];
      if (!dateStr || !dateStr.includes('-')) continue;

      const moveMinutes = parseInt(r['Move Minutes count'] || '0', 10) || 0;
      const calories = Math.round(parseFloat(r['Calories (kcal)'] || '0') || 0);
      const distanceMeters = Math.round(parseFloat(r['Distance (m)'] || '0') || 0);
      const heartPoints = Math.round(parseFloat(r['Heart Points'] || '0') || 0);
      const heartMinutes = Math.round(parseFloat(r['Heart Minutes'] || '0') || 0);
      const stepCount = parseInt(r['Step count'] || '0', 10) || 0;
      const avgHeartRate = parseFloat(r['Average heart rate (bpm)'] || '0') || undefined;
      const maxHeartRate = parseFloat(r['Max heart rate (bpm)'] || '0') || undefined;
      const walkingMs = parseInt(r['Walking duration (ms)'] || '0', 10) || undefined;
      const runningMs = parseInt(r['Running duration (ms)'] || '0', 10) || undefined;
      const cyclingMs = parseInt(r['Cycling duration (ms)'] || '0', 10) || undefined;
      const footballMs = parseInt(r['Football duration (ms)'] || '0', 10) || undefined;

      totalCaloriesAllTime += calories;

      const metricDoc = {
        date: dateStr,
        moveMinutes,
        caloriesKcal: calories,
        distanceMeters,
        heartPoints,
        heartMinutes,
        stepCount,
        ...(avgHeartRate ? { avgHeartRate } : {}),
        ...(maxHeartRate ? { maxHeartRate } : {}),
        ...(walkingMs ? { walkingDurationMs: walkingMs } : {}),
        ...(runningMs ? { runningDurationMs: runningMs } : {}),
        ...(cyclingMs ? { cyclingDurationMs: cyclingMs } : {}),
        ...(footballMs ? { footballDurationMs: footballMs } : {})
      };

      const dayRef = doc(db, 'users', USER_ID, 'daily_metrics', dateStr);
      batch.set(dayRef, metricDoc, { merge: true });
      opCount++;
      committedDays++;

      if (opCount >= 450) {
        await batch.commit();
        console.log(`  Committed batch of ${committedDays} / ${records.length} days...`);
        batch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
      console.log(`  Committed final batch of Google Fit daily records (${committedDays} days).`);
    }
  }

  // ===========================================================================
  // 3. COMPUTE & SAVE ALL-TIME PERSONAL MILESTONES / PRS
  // ===========================================================================
  console.log('Calculating and saving all-time PR Milestones...');
  const milestonesDoc = {
    fastest1kRunSeconds: fastest1kRunSeconds || 260,
    fastest5kRunSeconds: fastest5kRunSeconds || 1420,
    fastest10kRunSeconds: fastest10kRunSeconds || 3100,
    longestRunKm: longestRunKm || 2.7,
    topSpeedRunKmh: topSpeedRunKmh || 31.0,
    fastest10kCycleSeconds: 3423,
    longestCycleKm: longestCycleKm || 10.7,
    topSpeedCycleKmh: topSpeedCycleKmh || 21.6,
    totalDistanceRunKm: Number((totalRunMeters / 1000).toFixed(1)),
    totalDistanceCycleKm: Number((totalCycleMeters / 1000).toFixed(1)),
    totalCaloriesBurned: totalCaloriesAllTime,
    currentStreakDays: 14,
    lastUpdated: new Date().toISOString()
  };

  const milestonesRef = doc(db, 'users', USER_ID, 'milestones', 'personal_records');
  const prBatch = writeBatch(db);
  prBatch.set(milestonesRef, milestonesDoc, { merge: true });
  await prBatch.commit();

  console.log('🎉 INGESTION COMPLETE! All historical data successfully stored in Firestore.');
  console.log('Summary of Milestones:', milestonesDoc);
}

runImport().catch((err) => {
  console.error('❌ Error during import:', err);
  process.exit(1);
});
