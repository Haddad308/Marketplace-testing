// lib/firebase-admin.ts
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

// Check if all required environment variables are present
const requiredEnvVars = {
	projectId: process.env.FIREBASE_PROJECT_ID,
	clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
	privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
	.filter(([, value]) => !value)
	.map(([key]) => key);

if (missingVars.length > 0) {
	console.warn(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
}

let adminAuth: Auth | null = null;

// Only initialize Firebase Admin if all variables are present
if (missingVars.length === 0) {
	try {
		const privateKey = requiredEnvVars.privateKey!.replace(/\\n/g, '\n');

		const app = !getApps().length
			? initializeApp({
					credential: cert({
						projectId: requiredEnvVars.projectId!,
						clientEmail: requiredEnvVars.clientEmail!,
						privateKey,
					}),
				})
			: getApp();

		adminAuth = getAuth(app);
	} catch (error) {
		console.error('Failed to initialize Firebase Admin:', error);
	}
}

export { adminAuth };
