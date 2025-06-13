'use client';

import {
	signOut as firebaseSignOut,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	User,
} from 'firebase/auth';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '../firebase/firabase';
// import { ensureUserInFirestore, getUserFromFirestore } from '../firebase/firestore';

interface AuthContextType {
	user: User | null;
	setUser: Dispatch<SetStateAction<User | null>>;
	loading: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	signIn: (email: string, password: string) => Promise<void>;
	signInWithGoogle: () => Promise<void>;
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
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const signIn = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password);
	};

	const signInWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const signOut = async () => {
		await firebaseSignOut(auth);
	};

	const value = {
		user,
		setUser,
		loading,
		setLoading,
		signIn,
		signInWithGoogle,
		signOut,
	};

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
