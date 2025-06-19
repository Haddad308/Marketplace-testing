import { User } from '@/types';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firabase';

export async function ensureUserInFirestore(user: User) {
	const userRef = doc(db, 'users', user.uid);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) {
		await setDoc(userRef, {
			email: user.email,
			role: 'user',
			createdAt: serverTimestamp(),
		});
	}
}

export async function getUserRole(userId: string) {
	const userDoc = await getDoc(doc(db, 'users', userId));
	const role = userDoc.data()?.role || 'user';
	return role;
}

export async function updateUserProfileInfo(updates: { displayName?: string; photoURL?: string }) {
	const auth = getAuth();
	const user = auth.currentUser;

	if (!user) throw new Error('No authenticated user found.');

	const { displayName, photoURL } = updates;

	// 1. Update Firebase Auth profile
	if (displayName || photoURL) {
		await updateProfile(user, {
			displayName: displayName ?? user.displayName,
			photoURL: photoURL ?? user.photoURL,
		});
	}

	// 2. Update Firestore user document
	const userRef = doc(db, 'users', user.uid);
	await updateDoc(userRef, {
		...(displayName && { displayName }),
		...(photoURL && { photoURL }),
	});
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
	const auth = getAuth();
	const user = auth.currentUser;

	if (!user) throw new Error('No authenticated user found.');

	// Re-authenticate before updating password
	if (!user.email) throw new Error('User email is required for reauthentication.');

	const credential = EmailAuthProvider.credential(user.email, currentPassword);
	await reauthenticateWithCredential(user, credential);

	await updatePassword(user, newPassword);
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
