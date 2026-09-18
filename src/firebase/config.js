import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAfnQmhFcfb-2HeiPvXBZ-zRVuFdbtIo5A',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smart-waste-platform-9f926.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-waste-platform-9f926',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smart-waste-platform-9f926.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '468825230098',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:468825230098:web:07a2b94128b0ac496f01cb',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
