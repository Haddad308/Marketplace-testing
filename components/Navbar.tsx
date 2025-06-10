'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Navbar = () => {
	const { signOut, user } = useAuth();
	const router = useRouter();

	// Get user initials for avatar fallback
	const getUserInitials = () => {
		if (!user?.displayName) return 'U';
		const nameParts = user.displayName.split(' ');
		if (nameParts.length >= 2) {
			return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
		}
		return nameParts[0][0].toUpperCase();
	};

	useEffect(() => {
		if (!user) {
			router.push('/signin');
			return;
		}
	}, [user, router]);

	return (
		<header className="border-b border-slate-700 bg-slate-900 p-4 dark:border-slate-700">
			<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center sm:justify-between">
				<h1 className="text-2xl font-bold">
					<span className="text-purple-400">Nextjs</span>
					<span className="text-pink-400">Boilerplate</span>
				</h1>

				<DropdownMenu>
					<DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-2 transition-colors outline-none hover:bg-slate-800">
						<Avatar className="h-8 w-8 border border-slate-700">
							<AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
							<AvatarFallback className="bg-purple-600 text-white">{getUserInitials()}</AvatarFallback>
						</Avatar>
						<span className="hidden text-slate-200 sm:inline-block">{user?.displayName || 'User'}</span>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-56 border-slate-700 bg-slate-800 text-slate-200">
						<DropdownMenuItem
							className="flex cursor-pointer items-center gap-2 hover:bg-slate-700 focus:bg-slate-700"
							onClick={() => router.push('/config')}
						>
							<Settings className="h-4 w-4 text-slate-400" />
							<span>Config</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="bg-slate-700" />

						<DropdownMenuItem
							className="flex cursor-pointer items-center gap-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300"
							onClick={signOut}
						>
							<LogOut className="h-4 w-4" />
							<span>Logout</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
};

export default Navbar;
