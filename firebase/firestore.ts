// import { FREE_SEARCH_COUNT } from '@/lib/constants';
// import { User } from '@/types';
// import { User as FirebaseAuthUser } from 'firebase/auth';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { db } from './firabase';

// // Get user data from Firestore
// export const getUserFromFirestore = async (authUser: FirebaseAuthUser): Promise<User | null> => {
// 	const userRef = doc(db, 'users', authUser.uid);
// 	const userSnap = await getDoc(userRef);

// 	if (!userSnap.exists()) return null;

// 	const data = userSnap.data();

// 	return {
// 		...authUser,
// 		freeSearchCount: data.freeSearchCount ?? 0,
// 		giminiApiKey: data.giminiApiKey ?? '',
// 		createdAt: data.updatedAt?.toDate() ?? new Date(),
// 		updatedAt: data.updatedAt?.toDate() ?? new Date(),
// 	};
// };

// // Ensure user exists in Firestore
// export const ensureUserInFirestore = async (firebaseUser: FirebaseAuthUser) => {
// 	const userRef = doc(db, 'users', firebaseUser.uid);
// 	const userSnap = await getDoc(userRef);

// 	if (!userSnap.exists()) {
// 		return await createUserInFirestore(firebaseUser);
// 	}

// 	return null;
// };

// // Update free search count in Firestore
// export const updateFreeSearchCount = async (userId: string, count: number) => {
// 	try {
// 		await setDoc(doc(db, 'users', userId), { freeSearchCount: count }, { merge: true });
// 		return true;
// 	} catch (error) {
// 		console.error('Error updating free search count:', error);
// 		throw error;
// 	}
// };
