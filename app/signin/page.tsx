'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { user, signIn, signInWithGoogle } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push('/signin');
		}
	}, [user, router]);

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await signIn(email, password);
			router.push('/dashboard');
		} catch (err) {
			setError('Invalid email or password. Please try again.');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await signInWithGoogle();
			window.location.href = '/';
		} catch (err) {
			setError('Failed to sign in with Google. Please try again.');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500">
			<main className="flex flex-1 items-center justify-center p-4 md:p-8">
				<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl md:p-8">
					<div className="mb-8 text-center">
						<h1 className="text-2xl font-bold">
							<span className="text-purple-400">Omni</span>
							<span className="text-pink-400">Search</span>
						</h1>

						<p className="mt-2 text-gray-600">Search About All You Need</p>
					</div>

					{error && (
						<div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
					)}

					<form onSubmit={handleSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-gray-700">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password" className="text-gray-700">
									Password
								</Label>
							</div>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full"
							/>
						</div>
						<Button type="submit" className="w-full bg-purple-600 text-white hover:bg-purple-700" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								'Sign in'
							)}
						</Button>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-gray-500">Or continue with</span>
							</div>
						</div>

						<Button
							variant="ghost"
							className="mt-4 flex w-full cursor-pointer items-center justify-center bg-gray-900"
							onClick={handleGoogleSignIn}
							disabled={isLoading}
						>
							<FcGoogle className="mr-2 h-5 w-5" />
							Sign in with Google
						</Button>
					</div>

					<p className="mt-8 text-center text-sm text-gray-600">
						Dont have an account?{' '}
						<Link
							href="https://rebusai.com/shop/free-trial-3#attr="
							className="font-medium text-purple-600 hover:text-purple-800"
						>
							Start your free trial
						</Link>
					</p>
				</div>
			</main>

			<footer className="bg-purple-800 px-4 py-6 md:px-6">
				<div className="container mx-auto text-center text-sm text-white/70">
					<p>© 2023 RebusAI. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
