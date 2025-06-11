'use client';

import { Heart, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { SignInModal } from '@/components/modals/SignInModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
	const [searchQuery, setSearchQuery] = useState('');

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
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<Input
								type="text"
								placeholder="Search for deals"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="block w-full rounded-full border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
							/>
						</div>
					</div>

					{/* Right Side Actions */}
					<div className="flex items-center space-x-4">
						{/* Wishlist */}
						<Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
							<Heart className="h-5 w-5" />
							<span className="sr-only">Wishlist</span>
						</Button>

						{/* Sign In */}
						<SignInModal />
					</div>
				</div>
			</div>

			{/* Search Bar For small to medium screens */}
			<div className="mx-4 mb-2 max-w-2xl flex-1 md:hidden">
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						type="text"
						placeholder="Search for deals"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="block w-full rounded-full border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
					/>
				</div>
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
