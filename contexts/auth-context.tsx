'use client';

import { ensureUserInFirestore, getUserData } from '@/firebase/userServices';
import { User } from '@/types';
import {
	createUserWithEmailAndPassword,
	FacebookAuthProvider,
	signOut as firebaseSignOut,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	UserCredential,
} from 'firebase/auth';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '../firebase/firabase';

interface AuthContextType {
	user: User | null;
	setUser: Dispatch<SetStateAction<User | null>>;
	loading: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<UserCredential>;
	signInWithFacebook: () => Promise<void>;
	signInWithGoogle: () => Promise<UserCredential>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setLoading(true);
			if (user) {
				await ensureUserInFirestore(user as User);

				const userData = await getUserData(user.uid);

				setUser({
					...user,
					role: userData?.role,
					wishlist: userData?.wishlist,
					permissions: userData?.permissions,
				} as User);
			} else {
				setUser(null);
			}

			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	const signUp = async (email: string, password: string) => {
		await createUserWithEmailAndPassword(auth, email, password);
	};

	const signIn = async (email: string, password: string) => {
		return await signInWithEmailAndPassword(auth, email, password);
	};

	const signInWithFacebook = async () => {
		const provider = new FacebookAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const signInWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		return await signInWithPopup(auth, provider);
	};

	const signOut = async () => {
		await firebaseSignOut(auth);
	};

	const value = {
		user,
		setUser,
		loading,
		setLoading,
		signUp,
		signIn,
		signInWithFacebook,
		signInWithGoogle,
		signOut,
	};

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
