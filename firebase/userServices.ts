import { PaginatedUsers, User, UserData } from '@/types';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import {
	arrayRemove,
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	startAfter,
	updateDoc,
} from 'firebase/firestore';
import { db } from './firabase';

export async function ensureUserInFirestore(user: User) {
	const userRef = doc(db, 'users', user.uid);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) {
		await setDoc(userRef, {
			email: user.email,
			role: 'user',
			permissions: [],
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
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

export async function getUsers(pageSize = 5, lastDoc?: any, searchQuery?: string): Promise<PaginatedUsers> {
	try {
		let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

		if (searchQuery) {
			q = query(collection(db, 'users'));
		} else if (lastDoc) {
			q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize + 1));
		} else {
			q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(pageSize + 1));
		}

		const snapshot = await getDocs(q);
		let users = snapshot.docs.map((doc) => ({
			id: doc.id,
			...(doc.data() as Omit<User, 'id'>),
		}));

		// Client-side search filtering
		if (searchQuery) {
			const searchLower = searchQuery.toLowerCase();
			users = users.filter(
				(user) => user.displayName?.toLowerCase().includes(searchLower) || user.email?.toLowerCase().includes(searchLower)
			);
			// Apply pagination to search results
			const startIndex = lastDoc ? users.findIndex((u) => u.id === lastDoc.id) + 1 : 0;
			users = users.slice(startIndex, startIndex + pageSize + 1);
		}

		const hasMore = users.length > pageSize;
		if (hasMore) {
			users = users.slice(0, pageSize);
		}

		return {
			users,
			hasMore,
			lastDoc: users.length > 0 ? snapshot.docs[users.length - 1] : null,
		};
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
}

export async function updateUserRole(
	userId: string,
	role: 'user' | 'merchant' | 'admin',
	permissions?: string[]
): Promise<void> {
	try {
		const userRef = doc(db, 'users', userId);
		const updateData: any = {
			role,
			updatedAt: serverTimestamp(),
		};

		if (permissions) {
			updateData.permissions = permissions;
		}

		await updateDoc(userRef, updateData);
	} catch (error) {
		console.error('Error updating user role:', error);
		throw error;
	}
}

export async function updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
	try {
		const userRef = doc(db, 'users', userId);
		await updateDoc(userRef, {
			permissions,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error('Error updating user permissions:', error);
		throw error;
	}
}

export async function getUserById(userId: string): Promise<User | null> {
	try {
		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			return null;
		}

		return {
			id: userSnap.id,
			...(userSnap.data() as Omit<User, 'id'>),
		} as User;
	} catch (error) {
		console.error('Error fetching user:', error);
		throw error;
	}
}

export async function getUserData(userId: string): Promise<UserData | null> {
	const userRef = doc(db, 'users', userId);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) return null;

	const data = userSnap.data();

	return {
		wishlist: data.wishlist ?? [],
		role: data.role ?? 'user',
		permissions: data.permissions ?? [],
	};
}
