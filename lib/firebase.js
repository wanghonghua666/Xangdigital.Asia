// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAU5ah8ZEXiU-OADOYzK3mkDZlq4eu_n6w",
  authDomain: "xangdigitalasia.firebaseapp.com",
  projectId: "xangdigitalasia",
  storageBucket: "xangdigitalasia.firebasestorage.app",
  messagingSenderId: "621069529390",
  appId: "1:621069529390:web:b786a2017ee8cd74f9cabf",
  measurementId: "G-Y70H0H0041"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 