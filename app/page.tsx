'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (!user) {
			router.push('/signin');
			return;
		}
	}, [user, router]);

	return (
		<main className="min-h-screen space-y-2 bg-slate-900 pb-10 text-white">
			<div className="flex h-screen flex-col items-center justify-center">
				<h1 className="text-4xl font-bold">
					Welcome to the Next.js boilerplate with Radix UI, Tailwind CSS, and TypeScript
				</h1>
				<p className="mt-4 rounded-lg bg-white p-4 text-center shadow-md">You are logged in as {user?.email}</p>
			</div>
			{/* Add more content here as needed */}
		</main>
	);
}
