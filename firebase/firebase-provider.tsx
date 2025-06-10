'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/auth-context';

export function FirebaseProvider({ children }: { children: ReactNode }) {
	return <AuthProvider>{children}</AuthProvider>;
}
