import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  type Firestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyDh3tjm2gST-upnfViBSD55ZppV3VEFNQQ",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "kuchh-bhii.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "kuchh-bhii",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "kuchh-bhii.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "318042636199",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:318042636199:web:5c8628e6110c6e6f85c082",
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || "G-X0K69F1495"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with resilient offline persistence for Android / Web
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    },
    'default'
  );
} catch (e) {
  console.warn('initializeFirestore with tabManager failed, falling back to standard getFirestore:', e);
  try {
    dbInstance = getFirestore(app, 'default');
  } catch {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
