// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDY3cdP6a7N5ubvaXOut7hk9P-jsxpBozY",
  authDomain: "marketplace-testing-fd475.firebaseapp.com",
  projectId: "marketplace-testing-fd475",
  storageBucket: "marketplace-testing-fd475.firebasestorage.app",
  messagingSenderId: "932564087745",
  appId: "1:932564087745:web:af74985e985d6dcc573540",
  measurementId: "G-VMMKWJM0HF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
