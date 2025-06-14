'use client';

import { Heart } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';

interface WishlistLoginModalProps {
	isOpen: boolean;
	onClose: Dispatch<SetStateAction<boolean>>;
}

export default function WishlistLoginModal({ isOpen, onClose }: WishlistLoginModalProps) {
	const { signInWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setIsLoading(true);
			await signInWithGoogle();
			onClose(false);
		} catch (error) {
			console.error('Error signing in with Google:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFacebookSignIn = async () => {};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-white sm:max-w-md">
				<DialogHeader>
					<div className="mb-4 flex items-center justify-center">
						<div className="rounded-full bg-purple-100 p-3">
							<Heart className="h-8 w-8 text-purple-600" />
						</div>
					</div>
					<DialogTitle className="text-center text-xl font-semibold">Save to Wishlist</DialogTitle>
					<DialogDescription className="text-center">
						Sign in to save deals to your wishlist and never miss out on great offers!
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-4">
					<Button
						variant="outline"
						className="flex w-full items-center justify-center space-x-3 border-gray-300 py-3 hover:bg-gray-50"
						onClick={handleGoogleSignIn}
						disabled={isLoading}
					>
						<FaGoogle className="h-5 w-5 text-red-500" />
						<span>Continue with Google</span>
					</Button>

					<Button
						variant="outline"
						className="flex w-full items-center justify-center space-x-3 border-gray-300 py-3 hover:bg-gray-50"
						onClick={handleFacebookSignIn}
						disabled={isLoading}
					>
						<FaFacebook className="h-5 w-5 text-blue-600" />
						<span>Continue with Facebook</span>
					</Button>
				</div>

				<div className="pt-4 text-center text-xs text-gray-500">
					By signing in, you agree to our{' '}
					<a href="#" className="text-purple-600 hover:underline">
						Terms of Service
					</a>{' '}
					and{' '}
					<a href="#" className="text-purple-600 hover:underline">
						Privacy Policy
					</a>
					.
				</div>
			</DialogContent>
		</Dialog>
	);
}
