import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyDT2XdiT4k2C4jFY0U6kWcjlbj7BeukNoo',
  authDomain:        'teleprompter-mm.firebaseapp.com',
  projectId:         'teleprompter-mm',
  storageBucket:     'teleprompter-mm.firebasestorage.app',
  messagingSenderId: '972440243498',
  appId:             '1:972440243498:web:954928c51e2b50c61ca253',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db   = getFirestore(app);
