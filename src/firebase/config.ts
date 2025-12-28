import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkreW94yXg1lPrcY3_nMqoG_qqggXtxLM",
  authDomain: "tisha-booking.firebaseapp.com",
  projectId: "tisha-booking",
  storageBucket: "tisha-booking.firebasestorage.app",
  messagingSenderId: "716286392406",
  appId: "1:716286392406:web:c67e3a2ee81ac63aefa3f7",
  measurementId: "G-ZRMJC4W2R2",
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize messaging (only in browser with service worker support)
export const initializeMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('Connected to Firebase emulators');
}

export default app;

