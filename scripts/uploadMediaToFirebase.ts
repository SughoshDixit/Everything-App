import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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
const storage = getStorage(app);
const db = getFirestore(app, 'default');
const USER_ID = 'sughosh';

async function uploadAllMedia() {
  const publicMediaDir = path.resolve('public', 'media');
  if (!fs.existsSync(publicMediaDir)) {
    console.error('❌ public/media folder does not exist. Run extractStravaMedia.ts first!');
    return;
  }

  const files = fs.readdirSync(publicMediaDir);
  console.log(`☁️ Found ${files.length} media files to upload to Firebase Cloud Storage...`);

  let uploadedCount = 0;
  for (const file of files) {
    const filePath = path.join(publicMediaDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const isVideo = file.toLowerCase().endsWith('.mp4');
    const contentType = isVideo ? 'video/mp4' : 'image/jpeg';

    const storageRef = ref(storage, `users/${USER_ID}/media/${file}`);
    try {
      await uploadBytes(storageRef, fileBuffer, { contentType });
      const downloadUrl = await getDownloadURL(storageRef);
      uploadedCount++;
      console.log(`[${uploadedCount}/${files.length}] Uploaded ${file} -> ${downloadUrl.substring(0, 50)}...`);
    } catch (err) {
      console.warn(`⚠️ Failed to upload ${file}:`, err);
    }
  }

  console.log(`🎉 Finished uploading ${uploadedCount} files to Firebase Storage!`);
  process.exit(0);
}

uploadAllMedia().catch(console.error);
