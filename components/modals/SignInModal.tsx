'use client';

import { ChevronDown, Eye, EyeOff, User } from 'lucide-react';
import { useState } from 'react';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthStep = 'email' | 'signin' | 'signup';

export function SignInModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<AuthStep>('email');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [agreeToEmails, setAgreeToEmails] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleEmailContinue = async () => {
		if (!email) return;

		setIsLoading(true);
		// Simulate API call to check if user exists
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock logic: if email contains "existing", show signin, else signup
		const userExists = email.includes('existing');
		setStep(userExists ? 'signin' : 'signup');
		setIsLoading(false);
	};

	const handleSignIn = async () => {
		if (!password) return;
		setIsLoading(true);
		// Simulate sign in
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsLoading(false);
		setIsOpen(false);
		// Handle successful sign in
	};

	const handleSignUp = async () => {
		if (!name || !password) return;
		setIsLoading(true);
		// Simulate sign up
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsLoading(false);
		setIsOpen(false);
		// Handle successful sign up
	};

	const resetForm = () => {
		setStep('email');
		setEmail('');
		setPassword('');
		setName('');
		setShowPassword(false);
		setAgreeToEmails(false);
	};

	const handleSocialLogin = (provider: string) => {
		console.log(`Login with ${provider}`);
		// Implement social login
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center space-x-2 rounded-full border-gray-300 px-4 py-2 hover:border-purple-500"
				>
					<User className="h-4 w-4" />
					<span>Sign In</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-96 bg-white p-0">
				<div className="p-6">
					{step === 'email' && (
						<>
							<div className="mb-6 text-center">
								<h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to DealSpot</h2>
								<p className="text-gray-600">Access all DealSpot has to offer</p>
							</div>

							{/* Social Login Buttons */}
							<div className="mb-6 space-y-3">
								<Button
									variant="outline"
									className="flex w-full items-center justify-center space-x-3 border-gray-300 py-3 hover:bg-gray-50"
									onClick={() => handleSocialLogin('Facebook')}
								>
									<FaFacebook className="h-5 w-5 text-blue-600" />
									<span>Continue with Facebook</span>
								</Button>

								<Button
									variant="outline"
									className="flex w-full items-center justify-center space-x-3 border-gray-300 py-3 hover:bg-gray-50"
									onClick={() => handleSocialLogin('Google')}
								>
									<FaGoogle className="h-5 w-5 text-red-500" />
									<span>Continue with Google</span>
								</Button>
							</div>

							<div className="mb-4 text-center text-gray-500">Or sign in with email</div>

							{/* Email Input */}
							<div className="space-y-4">
								<div>
									<Input
										type="email"
										placeholder="Email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full rounded-md border-gray-300 py-3"
									/>
								</div>

								<Button
									onClick={handleEmailContinue}
									disabled={!email || isLoading}
									className="w-full rounded-full bg-purple-600 py-3 font-medium text-white hover:bg-purple-700"
								>
									{isLoading ? 'Loading...' : 'Continue'}
								</Button>
							</div>

							<div className="mt-4 text-center text-xs text-gray-500">
								By clicking an option above, I agree to the{' '}
								<a href="#" className="text-purple-600 hover:underline">
									Terms and Conditions
								</a>{' '}
								and have read the{' '}
								<a href="#" className="text-purple-600 hover:underline">
									Privacy Statement
								</a>
								.
							</div>
						</>
					)}

					{step === 'signin' && (
						<>
							<div className="mb-6">
								<div className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-3">
									<span className="text-sm text-gray-700">{email}</span>
									<Button variant="link" className="h-auto p-0 text-sm text-purple-600" onClick={resetForm}>
										Change
									</Button>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<Label htmlFor="password" className="text-sm font-medium text-gray-700">
										Password
									</Label>
									<div className="relative mt-1">
										<Input
											id="password"
											type={showPassword ? 'text' : 'password'}
											placeholder="Password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="w-full rounded-md border-gray-300 py-3 pr-10"
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-1/2 right-2 h-auto -translate-y-1/2 transform p-1"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</Button>
									</div>
								</div>

								<Button
									onClick={handleSignIn}
									disabled={!password || isLoading}
									className="w-full rounded-full bg-purple-600 py-3 font-medium text-white hover:bg-purple-700"
								>
									{isLoading ? 'Signing In...' : 'Sign In'}
								</Button>
							</div>

							<div className="mt-4 text-center">
								<Button variant="link" className="text-sm text-purple-600" onClick={resetForm}>
									Forgot password?
								</Button>
							</div>
						</>
					)}

					{step === 'signup' && (
						<>
							<div className="mb-6">
								<div className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-3">
									<span className="text-sm text-gray-700">{email}</span>
									<Button variant="link" className="h-auto p-0 text-sm text-purple-600" onClick={resetForm}>
										Change
									</Button>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<Label htmlFor="name" className="text-sm font-medium text-gray-700">
										Your name
									</Label>
									<Input
										id="name"
										type="text"
										placeholder="Name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="mt-1 w-full rounded-md border-gray-300 py-3"
									/>
								</div>

								<div>
									<Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
										Create a password
									</Label>
									<div className="relative mt-1">
										<Input
											id="signup-password"
											type={showPassword ? 'text' : 'password'}
											placeholder="Password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="w-full rounded-md border-gray-300 py-3 pr-10"
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-1/2 right-2 h-auto -translate-y-1/2 transform p-1"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</Button>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										id="emails"
										checked={agreeToEmails}
										onCheckedChange={(checked) => setAgreeToEmails(checked as boolean)}
										className="mt-1"
									/>
									<Label htmlFor="emails" className="text-sm leading-5 text-gray-700">
										Yes, I want to save money by receiving personalized DealSpot emails with awesome deals.
									</Label>
								</div>

								<Button
									onClick={handleSignUp}
									disabled={!name || !password || isLoading}
									className="w-full rounded-full bg-purple-600 py-3 font-medium text-white hover:bg-purple-700"
								>
									{isLoading ? 'Creating Account...' : 'Sign Up'}
								</Button>
							</div>

							<div className="mt-4 text-center text-xs text-gray-500">
								By clicking an option above, I agree to the{' '}
								<a href="#" className="text-purple-600 hover:underline">
									Terms and Conditions
								</a>{' '}
								and have read the{' '}
								<a href="#" className="text-purple-600 hover:underline">
									Privacy Statement
								</a>
								.
							</div>
						</>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
