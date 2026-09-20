import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

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

async function extractAndLinkMedia() {
  console.log('🚀 Starting Strava Media Extraction & Linking...');

  const zipPath = path.resolve('Strava Data', 'export_88795622.zip');
  const publicMediaDir = path.resolve('public', 'media');
  const androidMediaDir = path.resolve('android-app', 'app', 'src', 'main', 'assets', 'web', 'media');

  if (!fs.existsSync(publicMediaDir)) {
    fs.mkdirSync(publicMediaDir, { recursive: true });
  }
  if (!fs.existsSync(androidMediaDir)) {
    fs.mkdirSync(androidMediaDir, { recursive: true });
  }

  // 1. Read zip file using PowerShell or AdmZip if available, or native unzipper
  // Since we are on Windows, we can use a PowerShell child process or System.IO.Compression
  console.log('📦 Extracting media files from Strava zip to public/media...');
  const { execSync } = await import('child_process');
  
  const psExtractCommand = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/\\/g, '/')}'); foreach ($entry in ($z.Entries | Where-Object { $_.FullName -like 'media/*' -and $_.Length -gt 0 })) { $target = Join-Path '${publicMediaDir.replace(/\\/g, '/')}' ([System.IO.Path]::GetFileName($entry.FullName)); [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true) }; $z.Dispose()"`;
  
  execSync(psExtractCommand, { stdio: 'inherit' });

  const extractedFiles = fs.readdirSync(publicMediaDir);
  console.log(`✅ Extracted ${extractedFiles.length} media files into public/media/`);

  // Copy to Android web assets
  console.log('📲 Syncing media to android-app assets...');
  for (const file of extractedFiles) {
    const src = path.join(publicMediaDir, file);
    const dest = path.join(androidMediaDir, file);
    fs.copyFileSync(src, dest);
  }
  console.log('✅ Android web assets synchronized with media files.');

  // 2. Parse activities.csv to map Activity ID to media
  const activitiesCsvPath = path.resolve('activities.csv');
  if (!fs.existsSync(activitiesCsvPath)) {
    console.error('❌ activities.csv not found!');
    return;
  }

  const csvContent = fs.readFileSync(activitiesCsvPath, 'utf8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });

  console.log(`📊 Parsing ${records.length} activities for media linkages...`);
  let linkedActivities = 0;

  for (const r of records) {
    const actId = r['Activity ID'];
    const mediaField = r['Media'] || '';
    if (!actId || !mediaField) continue;

    // mediaField looks like: "media/xyz.jpg|media/abc.mp4"
    const mediaItems = mediaField.split('|').map((s: string) => s.trim()).filter(Boolean);
    const photoUrls: string[] = [];
    const videoUrls: string[] = [];

    for (const item of mediaItems) {
      const filename = path.basename(item);
      const url = `/media/${filename}`;
      if (filename.toLowerCase().endsWith('.mp4') || filename.toLowerCase().endsWith('.mov')) {
        videoUrls.push(url);
      } else {
        photoUrls.push(url);
      }
    }

    if (photoUrls.length === 0 && videoUrls.length === 0) continue;

    try {
      // Update in gps_activities
      const actRef = doc(db, 'users', USER_ID, 'gps_activities', actId);
      const actSnap = await getDoc(actRef);
      if (actSnap.exists()) {
        await updateDoc(actRef, {
          mediaUrls: photoUrls,
          videoUrls: videoUrls
        });
      }

      // Update in activity_feed_posts
      const postRef = doc(db, 'activity_feed_posts', actId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postUpdateData: Record<string, any> = {
          photos: photoUrls,
          videoUrls: videoUrls
        };
        if (photoUrls.length > 0) {
          postUpdateData.customMediaUrl = photoUrls[0];
        }
        await updateDoc(postRef, postUpdateData);
      }

      linkedActivities++;
      console.log(`📸 Linked activity ${actId}: ${photoUrls.length} photos, ${videoUrls.length} videos`);
    } catch (err) {
      console.warn(`⚠️ Error updating media for activity ${actId}:`, err);
    }
  }

  console.log(`\n🎉 Successfully linked media to ${linkedActivities} activities in Firestore!`);
  process.exit(0);
}

extractAndLinkMedia().catch((err) => {
  console.error('Fatal error during media extraction:', err);
  process.exit(1);
});
