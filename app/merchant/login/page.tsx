'use client';

import { Eye, EyeOff, Lock, Mail, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getUserRole } from '@/firebase/userServices';
import { toast } from '@/hooks/use-toast';

export default function MerchantLoginPage() {
	const { user, signIn, signOut } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (user && user.role === 'merchant') {
			router.push('/merchant/dashboard');
		}
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			toast.error('Error', 'Please fill in all fields');
			return;
		}

		try {
			setIsLoading(true);
			await signIn(email, password);

			if (user) {
				const role = await getUserRole(user.uid);

				if (role !== 'merchant') {
					await signOut();
					toast.error('Access Denied', 'You are not authorized to access the merchant dashboard');
					return;
				}

				toast.success("You're logged in", 'Welcome to your merchant dashboard!');
				router.replace('/merchant/dashboard');
			} else {
				toast.error('Failed to sign in. Please try again.');
			}
		} catch (error: unknown) {
			console.error('Login error:', error);

			let errorMessage = 'Failed to sign in. Please try again.';

			if (typeof error === 'object' && error !== null && 'code' in error) {
				if (error.code === 'auth/user-not-found') {
					errorMessage = 'No account found with this email address.';
				} else if (error.code === 'auth/wrong-password') {
					errorMessage = 'Incorrect password. Please try again.';
				} else if (error.code === 'auth/invalid-email') {
				} else if (error.code === 'auth/invalid-credential') {
					errorMessage = "Email and password don't . Please try again.";
				} else if (error.code === 'auth/invalid-email') {
					errorMessage = 'Please enter a valid email address.';
				} else if (error.code === 'auth/too-many-requests') {
					errorMessage = 'Too many failed attempts. Please try again later.';
				}
			}

			toast.error('Login Failed', errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
						<Store className="h-8 w-8 text-white" />
					</div>
					<h1 className="mb-2 text-3xl font-bold text-white">Merchant Portal</h1>
					<p className="text-gray-400">Sign in to manage your services</p>
				</div>

				{/* Login Card */}
				<Card className="border-gray-700 bg-gray-800 shadow-2xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-center text-2xl font-bold text-white">Sign In</CardTitle>
						<CardDescription className="text-center text-gray-400">
							Enter your credentials to access your dashboard
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-4">
							{/* Email Field */}
							<div className="space-y-2">
								<Label htmlFor="email" className="text-gray-300">
									Email Address
								</Label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<Mail className="h-5 w-5 text-gray-400" />
									</div>
									<Input
										id="email"
										type="email"
										placeholder="merchant@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
										required
									/>
								</div>
							</div>

							{/* Password Field */}
							<div className="space-y-2">
								<Label htmlFor="password" className="text-gray-300">
									Password
								</Label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="border-gray-600 bg-gray-700 pr-10 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
										required
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
							</div>

							{/* Submit Button */}
							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 font-medium text-white hover:from-blue-700 hover:to-indigo-700"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Signing In...
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Additional Info */}
				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">Secure merchant portal powered by Firebase Authentication</p>
				</div>
			</div>
		</div>
	);
}
