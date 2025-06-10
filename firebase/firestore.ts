import { FREE_SEARCH_COUNT } from '@/lib/constants';
import { User } from '@/types';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firabase';

// Save API key to Firestore
export const saveApiKey = async (userId: string, apiKey: string) => {
	try {
		await setDoc(
			doc(db, 'users', userId),
			{
				giminiApiKey: apiKey,
				updatedAt: new Date().toISOString(),
			},
			{ merge: true }
		);
		return true;
	} catch (error) {
		console.error('Error saving API key:', error);
		throw error;
	}
};

// Get API key from Firestore
export const getApiKey = async (userId: string) => {
	try {
		const docRef = doc(db, 'users', userId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return docSnap.data().giminiApiKey;
		} else {
			return null;
		}
	} catch (error) {
		console.error('Error getting API key:', error);
		throw error;
	}
};

// Get user data from Firestore
export const getUserFromFirestore = async (authUser: FirebaseAuthUser): Promise<User | null> => {
	const userRef = doc(db, 'users', authUser.uid);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) return null;

	const data = userSnap.data();

	return {
		...authUser,
		freeSearchCount: data.freeSearchCount ?? 0,
		giminiApiKey: data.giminiApiKey ?? '',
		createdAt: data.updatedAt?.toDate() ?? new Date(),
		updatedAt: data.updatedAt?.toDate() ?? new Date(),
	};
};

// Create new user in Firestore
export const createUserInFirestore = async (firebaseUser: FirebaseAuthUser): Promise<User> => {
	const newUserData = {
		freeSearchCount: FREE_SEARCH_COUNT,
		createdAt: new Date(),
		updatedAt: new Date(),
		giminiApiKey: process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY,
	};

	await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
	return { ...firebaseUser, ...newUserData };
};

// Ensure user exists in Firestore
export const ensureUserInFirestore = async (firebaseUser: FirebaseAuthUser) => {
	const userRef = doc(db, 'users', firebaseUser.uid);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) {
		return await createUserInFirestore(firebaseUser);
	}

	return null;
};

// Update free search count in Firestore
export const updateFreeSearchCount = async (userId: string, count: number) => {
	try {
		await setDoc(doc(db, 'users', userId), { freeSearchCount: count }, { merge: true });
		return true;
	} catch (error) {
		console.error('Error updating free search count:', error);
		throw error;
	}
};
