import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC5MncM9ZFvQTHG-yYLwBmFfipB2hf3B7o",
  authDomain: "edworld-career-os-2026.firebaseapp.com",
  projectId: "edworld-career-os-2026",
  storageBucket: "edworld-career-os-2026.firebasestorage.app",
  messagingSenderId: "850137062639",
  appId: "1:850137062639:web:a23718e64df90a4e944f1a"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// FCM Messaging — only available in browser contexts that support it
// (not SSR, not iOS < 16.4, not Firefox < 90 without push support)
export const getFirebaseMessaging = async () => {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
};

