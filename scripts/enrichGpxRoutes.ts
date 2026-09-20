import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { execSync } from 'child_process';

const firebaseConfig = {
  apiKey: "AIzaSyDh3tjm2gST-upnfViBSD55ZppV3VEFNQQ",
  authDomain: "kuchh-bhii.firebaseapp.com",
  projectId: "kuchh-bhii",
  storageBucket: "kuchh-bhii.firebasestorage.app",
  messagingSenderId: "318042636199",
  appId: "1:318042636199:web:5c8628e6110c6e6f85c082",
  measurementId: "G-X0K69F1495"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'default');
const USER_ID = 'sughosh';

// Haversine distance in meters
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatPace(speedMs: number): string {
  if (!speedMs || speedMs <= 0.1) return '--:-- /km';
  const paceSecPerKm = 1000 / speedMs;
  if (paceSecPerKm > 3600 || paceSecPerKm < 60) return '--:-- /km';
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.round(paceSecPerKm % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
}

interface RawGpsPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
  speed?: number; // m/s
  accuracy?: number;
}

interface ActivitySplit {
  splitNumber: number;
  distanceLabel: string;
  distanceMeters: number;
  durationSeconds: number;
  paceMinKm: string;
  elevationDeltaMeters: number;
  speedKmh: number;
}

// Parse GPX text into points and calculate splits
function parseGpxContent(xmlText: string): { points: RawGpsPoint[]; splits: ActivitySplit[] } {
  const points: RawGpsPoint[] = [];
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)">([\s\S]*?)<\/trkpt>/g;
  let match: RegExpExecArray | null;

  while ((match = trkptRegex.exec(xmlText)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const inner = match[3];

    let ele: number | undefined;
    const eleMatch = /<ele>([^<]+)<\/ele>/.exec(inner);
    if (eleMatch) ele = parseFloat(eleMatch[1]);

    let timeMs = Date.now();
    const timeMatch = /<time>([^<]+)<\/time>/.exec(inner);
    if (timeMatch) timeMs = new Date(timeMatch[1]).getTime();

    points.push({
      latitude: lat,
      longitude: lon,
      altitude: ele ? Number(ele.toFixed(1)) : undefined,
      timestamp: timeMs,
      accuracy: 5 // Default high accuracy for clean GPX
    });
  }

  if (points.length < 2) {
    return { points, splits: [] };
  }

  // Calculate speeds and accumulated distance
  let totalDistMeters = 0;
  let currentSplitMeters = 0;
  let splitStartTime = points[0].timestamp;
  let splitStartEle = points[0].altitude || 0;
  let splitIndex = 1;
  const splits: ActivitySplit[] = [];

  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      const pPrev = points[i - 1];
      const pCurr = points[i];
      const dMeters = haversineMeters(pPrev.latitude, pPrev.longitude, pCurr.latitude, pCurr.longitude);
      const dTimeSec = Math.max(1, (pCurr.timestamp - pPrev.timestamp) / 1000);
      const speed = dMeters / dTimeSec;
      pCurr.speed = Number(speed.toFixed(2));

      totalDistMeters += dMeters;
      currentSplitMeters += dMeters;

      // Check for 1km split boundary
      if (currentSplitMeters >= 1000 || i === points.length - 1) {
        const splitDuration = Math.max(1, Math.round((pCurr.timestamp - splitStartTime) / 1000));
        const splitSpeedMs = currentSplitMeters / splitDuration;
        const eleDelta = pCurr.altitude !== undefined ? Number((pCurr.altitude - splitStartEle).toFixed(1)) : 0;

        splits.push({
          splitNumber: splitIndex,
          distanceLabel: `${splitIndex}.0 km`,
          distanceMeters: Math.round(currentSplitMeters),
          durationSeconds: splitDuration,
          paceMinKm: formatPace(splitSpeedMs),
          elevationDeltaMeters: eleDelta,
          speedKmh: Number((splitSpeedMs * 3.6).toFixed(1))
        });

        splitIndex++;
        currentSplitMeters = 0;
        splitStartTime = pCurr.timestamp;
        if (pCurr.altitude !== undefined) splitStartEle = pCurr.altitude;
      }
    } else {
      points[0].speed = 0;
    }
  }

  // If points are very dense (> 1200), downsample uniformly to keep Firestore under limits & smooth Leaflet/Google Maps rendering
  let finalPoints = points;
  if (points.length > 1200) {
    const step = Math.ceil(points.length / 1000);
    finalPoints = [];
    for (let i = 0; i < points.length; i += step) {
      finalPoints.push(points[i]);
    }
    // Always keep last point
    if (finalPoints[finalPoints.length - 1] !== points[points.length - 1]) {
      finalPoints.push(points[points.length - 1]);
    }
  }

  return { points: finalPoints, splits };
}

async function enrichHistoricalActivitiesWithGpx() {
  console.log('🗺️ Starting GPX Track Ingestion for Historical Strava Activities...');

  const zipPath = path.resolve('Strava Data', 'export_88795622.zip');
  const tempGpxDir = path.resolve('temp_gpx');

  if (!fs.existsSync(tempGpxDir)) {
    fs.mkdirSync(tempGpxDir, { recursive: true });
  }

  console.log('📦 Extracting activities/*.gpx files from Strava export archive...');
  const psExtractCommand = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/\\/g, '/')}'); foreach ($entry in ($z.Entries | Where-Object { $_.FullName -like 'activities/*.gpx' -and $_.Length -gt 0 })) { $target = Join-Path '${tempGpxDir.replace(/\\/g, '/')}' ([System.IO.Path]::GetFileName($entry.FullName)); [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true) }; $z.Dispose()"`;

  execSync(psExtractCommand, { stdio: 'inherit' });

  const gpxFiles = fs.readdirSync(tempGpxDir).filter(f => f.endsWith('.gpx'));
  console.log(`✅ Extracted ${gpxFiles.length} GPX files to temporary workspace.`);

  // Parse activities.csv to map each file to Activity ID
  const activitiesCsvPath = path.resolve('activities.csv');
  const csvContent = fs.readFileSync(activitiesCsvPath, 'utf8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });

  const filenameToActId: Record<string, string> = {};
  for (const r of records) {
    const actId = r['Activity ID'];
    const fn = r['Filename'] ? path.basename(r['Filename']) : '';
    if (actId && fn) {
      filenameToActId[fn] = actId;
    }
  }

  let enrichedCount = 0;

  for (const gpxFile of gpxFiles) {
    // Check if filename matches an Activity ID directly or through CSV mapping
    let actId = filenameToActId[gpxFile];
    if (!actId) {
      // Often the file is named {actId}.gpx
      const baseName = path.basename(gpxFile, '.gpx');
      actId = baseName;
    }

    const gpxFilePath = path.join(tempGpxDir, gpxFile);
    const xmlContent = fs.readFileSync(gpxFilePath, 'utf8');
    const { points, splits } = parseGpxContent(xmlContent);

    if (points.length === 0) {
      console.log(`⚠️ No trackpoints found in ${gpxFile}`);
      continue;
    }

    try {
      // 1. Check if already enriched in gps_activities
      const actRef = doc(db, 'users', USER_ID, 'gps_activities', actId);
      const actSnap = await getDoc(actRef);

      if (actSnap.exists() && actSnap.data().routePoints && actSnap.data().routePoints.length > 0) {
        enrichedCount++;
        console.log(`⏩ [${enrichedCount}/${gpxFiles.length}] Already enriched ${actId} (${actSnap.data().routePoints.length} points)`);
        continue;
      }

      if (actSnap.exists()) {
        await updateDoc(actRef, {
          routePoints: points,
          splits: splits
        });
      } else {
        await updateDoc(actRef, {
          routePoints: points,
          splits: splits
        }).catch(() => {});
      }

      // 2. Update in activity_feed_posts
      const postRef = doc(db, 'activity_feed_posts', actId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const updatedGpsActivity = {
          ...(postData.gpsActivity || {}),
          routePoints: points,
          splits: splits
        };

        await updateDoc(postRef, {
          gpsActivity: updatedGpsActivity,
          splits: splits
        });
      }

      enrichedCount++;
      console.log(`📍 [${enrichedCount}/${gpxFiles.length}] Enriched Activity ${actId}: ${points.length} waypoints, ${splits.length} splits`);
      // Throttling to prevent Firestore write stream exhaustion
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      console.warn(`⚠️ Error enriching activity ${actId}:`, err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Cleanup temporary GPX files
  console.log('🧹 Cleaning up temporary GPX files...');
  try {
    fs.rmSync(tempGpxDir, { recursive: true, force: true });
  } catch {}

  console.log(`\n🎉 Successfully enriched ${enrichedCount} historical Strava activities with GPS routes in Cloud Firestore!`);
  process.exit(0);
}

enrichHistoricalActivitiesWithGpx().catch((err) => {
  console.error('Fatal error during GPX route enrichment:', err);
  process.exit(1);
});
