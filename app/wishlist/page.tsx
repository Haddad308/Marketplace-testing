'use client';

import WishlistProductCard from '@/components/cards/WishlistProductCard';
import WishlistSkeleton from '@/components/skeletons/WishlistSkeleton';
import { useAuth } from '@/contexts/auth-context';
import { getProductsByIds } from '@/firebase/productServices';
import { removeFromWishlist } from '@/firebase/userServices';
import { toast } from '@/hooks/use-toast';
import EmptyWishlist from '@/sections/EmptyWishlist';
import type { Product } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WishlistPage() {
	const { user, setUser, loading } = useAuth();
	const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (user) {
			fetchWishlist();
		} else if (!loading) {
			setIsLoading(false);
		}
	}, [user, loading]);

	const fetchWishlist = async () => {
		if (!user) return;

		try {
			setIsLoading(true);

			const prods = await getProductsByIds(user.wishlist ?? []);
			setWishlistItems(prods);
		} catch (error) {
			console.error('Error fetching wishlist:', error);
			toast.error('Error', `Error fetching wishlist: ${error}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveFromWishlist = async (productId: string) => {
		if (!user) return;
		const oldWishlistItems = [...wishlistItems];
		setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
		setUser({ ...user, wishlist: wishlistItems.filter((item) => item.id !== productId).map((item) => item.id) });

		try {
			await removeFromWishlist(user.uid, productId);
		} catch (error) {
			console.error('Error Removing Product:', error);
			toast.error('Error', `Error Removing Product: ${error}`);

			setWishlistItems(oldWishlistItems);
			setUser({ ...user, wishlist: oldWishlistItems.map((item) => item.id) });
		}
	};

	if (!user && !loading) {
		return (
			<>
				<Link href="/" className="text-sm text-purple-600 hover:underline">
					← Back to Deals
				</Link>
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
					<div className="mb-4 rounded-full bg-purple-100 p-4">
						<svg className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
					</div>
					<h3 className="mb-2 text-lg font-medium">Sign in to view your wishlist</h3>
					<p className="mb-6 text-gray-500">Create an account or sign in to save your favorite deals.</p>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-3xl font-bold">My Wishlist</h1>
				{wishlistItems.length > 0 && (
					<span className="text-sm text-gray-500">
						{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
					</span>
				)}
			</div>

			{isLoading ? (
				<WishlistSkeleton />
			) : wishlistItems.length === 0 ? (
				<EmptyWishlist />
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{wishlistItems.map((product) => (
						<WishlistProductCard key={product.id} product={product} onRemove={handleRemoveFromWishlist} />
					))}
				</div>
			)}
		</>
	);
}
