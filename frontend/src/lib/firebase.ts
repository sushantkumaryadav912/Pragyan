import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Environment variables or fallback demo Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPragyanApiKeyForSOCLab123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pragyan-soc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pragyan-soc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pragyan-soc.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demoapp12345"
};

export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
