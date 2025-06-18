// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDpJBet_2q7nGVQBEkBWY-UiM2XDe7A-eA',
	authDomain: 'merch-64e5f.firebaseapp.com',
	projectId: 'merch-64e5f',
	storageBucket: 'merch-64e5f.firebasestorage.app',
	messagingSenderId: '915108516992',
	appId: '1:915108516992:web:90068b7f5a74e19e264265',
	measurementId: 'G-Z71MLRZWER',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
