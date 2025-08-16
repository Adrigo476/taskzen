// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Read from environment variable
  authDomain: "taskzen-z9r35.firebaseapp.com",
  projectId: "taskzen-z9r35",
  storageBucket: "taskzen-z9r35.firebasestorage.app",
  messagingSenderId: "625498384185",
  appId: "1:625498384185:web:f118a89ced7e3358e6eae8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
