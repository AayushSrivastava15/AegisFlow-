import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function getFirebaseInstance(config: any) {
  // If config is empty, return null
  if (!config.apiKey) return { auth: null, db: null };

  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  return { auth, db };
}
