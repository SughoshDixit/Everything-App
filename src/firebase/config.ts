import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDh3tjm2gST-upnfViBSD55ZppV3VEFNQQ",
  authDomain: "kuchh-bhii.firebaseapp.com",
  projectId: "kuchh-bhii",
  storageBucket: "kuchh-bhii.firebasestorage.app",
  messagingSenderId: "318042636199",
  appId: "1:318042636199:web:5c8628e6110c6e6f85c082",
  measurementId: "G-X0K69F1495"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with offline persistence for Android / Web
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  },
  'default'
);

// Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);
