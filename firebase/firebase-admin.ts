// lib/firebase-admin.ts
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!privateKey) {
	throw new Error('FIREBASE_PRIVATE_KEY is missing in environment variables');
}

const app = !getApps().length
	? initializeApp({
			credential: cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey,
			}),
		})
	: getApp();

export const adminAuth = getAuth(app);
