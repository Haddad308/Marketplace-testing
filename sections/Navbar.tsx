'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

import { SignInModal } from '@/components/modals/SignInModal';
import { SearchDropdown } from '@/components/SearchDropdown';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { UserDropdown } from '@/components/UserDropdown';
import WishlistBadge from '@/components/WishlistBadge';
import { useAuth } from '@/contexts/auth-context';

const categories = [
	{ name: 'Beauty & Spas', icon: '💄' },
	{ name: 'Things To Do', icon: '🎯' },
	{ name: 'Auto & Home', icon: '🏠' },
	{ name: 'Food & Drink', icon: '🍽️' },
	{ name: 'Gifts', icon: '🎁' },
	{ name: 'Local', icon: '📍' },
	{ name: 'Travel', icon: '✈️' },
	{ name: 'Goods', icon: '🛍️' },
	{ name: 'Coupons', icon: '🎫' },
];

export default function Navbar() {
	const { user, loading } = useAuth();

	return (
		<header className="w-full border-b border-gray-200 bg-white shadow-sm">
			{/* Main Navbar */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex-shrink-0">
						<div className="text-2xl font-bold text-purple-600">DEALSPOT</div>
					</Link>

					{/* Search Bar For medium to large screens */}
					<div className="mx-8 hidden max-w-2xl flex-1 md:block">
						<SearchDropdown />
					</div>

					{/* Right Side Actions */}
					<div className="flex items-center space-x-4">
						{/* Wishlist */}
						<Link href="/wishlist">
							<Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-purple-600">
								<Heart className="h-5 w-5" />
								<WishlistBadge />
								<span className="sr-only">Wishlist</span>
							</Button>
						</Link>

						{loading ? <LoadingButton /> : user ? <UserDropdown user={user} /> : <SignInModal />}
					</div>
				</div>
			</div>

			{/* Search Bar For small to medium screens */}
			<div className="mx-4 mb-2 max-w-2xl flex-1 md:hidden">
				<SearchDropdown />
			</div>

			{/* Categories Navigation */}
			<div className="border-t border-gray-200 bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-12 items-center justify-between overflow-x-auto">
						<nav className="flex w-full justify-between gap-x-8">
							{categories.map((category) => (
								<Link
									key={category.name}
									href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
									className="flex items-center space-x-2 text-sm font-medium whitespace-nowrap text-gray-600 transition-colors duration-200 hover:text-purple-600"
								>
									<span className="text-base">{category.icon}</span>
									<span>{category.name}</span>
								</Link>
							))}
						</nav>
					</div>
				</div>
			</div>
		</header>
	);
}
