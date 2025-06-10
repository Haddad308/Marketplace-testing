// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLbbKGyUT4ES9oGs08njKP-W7Ujr-vDcg",
  authDomain: "keywords-f3e1a.firebaseapp.com",
  projectId: "keywords-f3e1a",
  storageBucket: "keywords-f3e1a.firebasestorage.app",
  messagingSenderId: "268883776758",
  appId: "1:268883776758:web:8f0d4f4fc7783637f648d7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
