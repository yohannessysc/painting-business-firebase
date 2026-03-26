import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';

type HostingFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let firebaseAppPromise: Promise<FirebaseApp> | null = null;

export async function getClientFirebaseApp(): Promise<FirebaseApp> {
  if (getApps().length > 0) {
    return getApp();
  }

  if (firebaseAppPromise) {
    return firebaseAppPromise;
  }

  firebaseAppPromise = (async () => {
    const response = await fetch('/__/firebase/init.json', {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Unable to load Firebase config.');
    }

    const firebaseConfig = (await response.json()) as HostingFirebaseConfig;
    return initializeApp(firebaseConfig);
  })();

  return firebaseAppPromise;
}