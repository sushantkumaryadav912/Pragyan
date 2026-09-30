import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Pragyan Live Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAVo1yBjypEZHH5pMCcjwaeLBJinsZ7_CY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pragyan-e984b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pragyan-e984b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pragyan-e984b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "814124766748",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:814124766748:web:02d83f591fe679394bf1d9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8Y8CTYWQ1K"
};

export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
