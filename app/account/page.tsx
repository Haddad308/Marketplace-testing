'use client';

import type React from 'react';

import { Camera, Eye, EyeOff, Lock, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { updateUserPassword, updateUserProfileInfo } from '@/firebase/userServices';
import { toast, useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/helpers';

export default function ProfilePage() {
	const { user, setUser, loading } = useAuth();
	const { success, error, info, warning } = useToast();

	// Profile form state
	const [displayName, setDisplayName] = useState('');
	const [email, setEmail] = useState('');
	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

	// Password form state
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
	const [isPasswordUser, setIsPasswordUser] = useState(false);

	useEffect(() => {
		if (user) {
			setDisplayName(user.displayName || '');
			setEmail(user.email || '');
			setIsPasswordUser(user.providerData.some((provider) => provider.providerId === 'password'));
		}
	}, [user]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-2xl">
					<div className="animate-pulse space-y-6">
						<div className="h-8 w-48 rounded bg-gray-200"></div>
						<div className="h-64 w-full rounded-lg bg-gray-200"></div>
						<div className="h-64 w-full rounded-lg bg-gray-200"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
					<div className="mb-4 rounded-full bg-purple-100 p-4">
						<User className="h-12 w-12 text-purple-600" />
					</div>
					<h3 className="mb-2 text-lg font-medium">Sign in required</h3>
					<p className="text-gray-500">Please sign in to view your profile.</p>
				</div>
			</div>
		);
	}

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setIsUpdatingProfile(true);
			await updateUserProfileInfo({
				displayName: displayName.trim(),
			});

			setUser((prev) => (prev ? { ...prev, displayName } : prev));

			toast.success('Profile updated', 'Your profile has been updated successfully.');
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error('Error', 'Failed to update profile. Please try again.');
		} finally {
			setIsUpdatingProfile(false);
		}
	};

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error('Error', "New passwords don't match.");
			return;
		}

		if (newPassword.length < 6) {
			toast.error('Error', 'Password must be at least 6 characters long.');
			return;
		}

		try {
			setIsUpdatingPassword(true);
			await updateUserPassword(currentPassword, newPassword);

			// Clear form
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');

			toast.success('Password updated', 'Your password has been updated successfully.');
		} catch (error: unknown) {
			console.error('Error updating password:', error);
			let errorMessage = 'Failed to update password. Please try again.';

			if (typeof error === 'object' && error !== null && 'code' in error) {
				const firebaseError = error as { code: string };

				if (firebaseError.code === 'auth/wrong-password') {
					errorMessage = 'Current password is incorrect.';
				} else if (firebaseError.code === 'auth/weak-password') {
					errorMessage = 'Password is too weak. Please choose a stronger password.';
				}
			}

			toast.error('Error', errorMessage);
		} finally {
			setIsUpdatingPassword(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mx-auto max-w-2xl">
				<h1 className="mb-8 text-3xl font-bold">Profile Settings</h1>

				{/* Profile Information Card */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Profile Information
						</CardTitle>
						<CardDescription>Update your account details and personal information.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleUpdateProfile} className="space-y-6">
							{/* Avatar Section */}
							<div className="flex items-center gap-4">
								<Avatar className="h-20 w-20">
									<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
									<AvatarFallback className="bg-purple-100 text-xl text-purple-800">{getInitials(user)}</AvatarFallback>
								</Avatar>
								<div>
									<Button variant="outline" size="sm" disabled>
										<Camera className="mr-2 h-4 w-4" />
										Change Photo
									</Button>
									<p className="mt-1 text-xs text-gray-500">Coming soon</p>
								</div>
							</div>

							<Separator />

							{/* Form Fields */}
							<div className="grid gap-4">
								<div>
									<Label htmlFor="displayName">Display Name</Label>
									<Input
										id="displayName"
										type="text"
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										placeholder="Enter your display name"
									/>
								</div>

								<div>
									<Label htmlFor="email">Email Address</Label>
									<Input id="email" type="email" value={email} disabled className="bg-gray-50" />
									<p className="mt-1 text-xs text-gray-500">Email cannot be changed at this time</p>
								</div>
							</div>

							<Button type="submit" disabled={isUpdatingProfile} className="w-full">
								{isUpdatingProfile ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
										Updating...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Changes
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Password Change Card */}
				{isPasswordUser && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lock className="h-5 w-5" />
								Change Password
							</CardTitle>
							<CardDescription>Update your password to keep your account secure.</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleUpdatePassword} className="space-y-4">
								<div>
									<Label htmlFor="currentPassword">Current Password</Label>
									<div className="relative">
										<Input
											id="currentPassword"
											type={showCurrentPassword ? 'text' : 'password'}
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											placeholder="Enter current password"
											required
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-1/2 right-2 h-auto -translate-y-1/2 p-1"
											onClick={() => setShowCurrentPassword(!showCurrentPassword)}
										>
											{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</Button>
									</div>
								</div>

								<div>
									<Label htmlFor="newPassword">New Password</Label>
									<div className="relative">
										<Input
											id="newPassword"
											type={showNewPassword ? 'text' : 'password'}
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											placeholder="Enter new password"
											required
											minLength={6}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-1/2 right-2 h-auto -translate-y-1/2 p-1"
											onClick={() => setShowNewPassword(!showNewPassword)}
										>
											{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</Button>
									</div>
								</div>

								<div>
									<Label htmlFor="confirmPassword">Confirm New Password</Label>
									<div className="relative">
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder="Confirm new password"
											required
											minLength={6}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-1/2 right-2 h-auto -translate-y-1/2 p-1"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</Button>
									</div>
								</div>

								<Button type="submit" disabled={isUpdatingPassword} className="w-full">
									{isUpdatingPassword ? (
										<>
											<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
											Updating...
										</>
									) : (
										<>
											<Lock className="mr-2 h-4 w-4" />
											Update Password
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
