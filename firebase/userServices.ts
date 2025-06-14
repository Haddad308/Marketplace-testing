import { User } from '@/types';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firabase';

export async function ensureUserInFirestore(user: User) {
	const userRef = doc(db, 'users', user.uid);

	await setDoc(
		userRef,
		{
			email: user.email,
			name: user.displayName,
		},
		{ merge: true }
	);
}

export async function getUserWishlist(userId: string): Promise<string[] | null> {
	const userRef = doc(db, 'users', userId);
	const userSnap = await getDoc(userRef);
	if (!userSnap.exists()) return null;
	const data = userSnap.data();
	return data.wishlist ?? [];
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
	const userRef = doc(db, 'users', userId);
	await updateDoc(userRef, {
		wishlist: arrayRemove(productId),
	});
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
	const userRef = doc(db, 'users', userId);
	await updateDoc(userRef, {
		wishlist: arrayUnion(productId),
	});
}
