'use client';

import { signOut } from 'firebase/auth';
import { Heart, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/firebase/firabase';

interface UserDropdownProps {
	user: {
		displayName: string | null;
		email: string | null;
		photoURL: string | null;
	};
	wishlistCount?: number;
}

export function UserDropdown({ user, wishlistCount = 0 }: UserDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			// Redirect or update UI state after sign out
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const getInitials = () => {
		if (user.displayName) {
			return user.displayName
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.substring(0, 2);
		}
		return user.email ? user.email[0].toUpperCase() : 'U';
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center space-x-2 rounded-full border-gray-300 px-4 py-2 hover:border-purple-500"
				>
					<Avatar className="h-6 w-6">
						<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
						<AvatarFallback className="bg-purple-100 text-purple-800">{getInitials()}</AvatarFallback>
					</Avatar>
					<span className="hidden md:inline">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64 p-0">
				<div className="p-4">
					<div className="mb-2 text-lg font-semibold">Hi, {user.displayName || user.email?.split('@')[0] || 'User'}!</div>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
							<AvatarFallback className="bg-purple-100 text-purple-800">{getInitials()}</AvatarFallback>
						</Avatar>
						<div className="text-sm text-gray-600">{user.email}</div>
					</div>
				</div>

				<DropdownMenuSeparator />

				<Link href="/wishlist" className="block">
					<DropdownMenuItem className="flex cursor-pointer items-center justify-between p-3 text-base">
						<div className="flex items-center">
							<Heart className="mr-3 h-5 w-5" />
							<span>My Wishlist</span>
						</div>
						{wishlistCount > 0 && <span className="font-medium text-purple-600">{wishlistCount}</span>}
					</DropdownMenuItem>
				</Link>

				<Link href="/account" className="block">
					<DropdownMenuItem className="flex cursor-pointer items-center p-3 text-base">
						<User className="mr-3 h-5 w-5" />
						<span>Account Settings</span>
					</DropdownMenuItem>
				</Link>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					className="flex cursor-pointer items-center p-3 text-base text-red-600 hover:text-red-700"
					onClick={handleSignOut}
				>
					<LogOut className="mr-3 h-5 w-5" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
