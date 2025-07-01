'use client';

import ProductCard from '@/components/cards/ProductCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/firebase/productServices';
import { toast } from '@/hooks/use-toast';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import type { Product } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TrendingSection() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAll, setShowAll] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();

	const fromDashboard = searchParams.get('fromDashboard') || '';

	useEffect(() => {
		if (fromDashboard === 'true') {
			toast.error(
				'Access Denied',
				'Please log in from this page as a user. The dashboard portal login is for merchants only.'
			);

			// Remove 'fromDashboard' from the URL
			const params = new URLSearchParams(searchParams.toString());
			params.delete('fromDashboard');
			router.replace('?' + params.toString());
		}
	}, [fromDashboard, router, searchParams]);

	useEffect(() => {
		const fetchTrendingProducts = async () => {
			try {
				const allProducts = await getProducts();
				// Get the top 3 most viewed products
				const trendingProducts = allProducts.sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 3);
				setProducts(trendingProducts);
			} catch (error) {
				console.error('Error fetching trending products:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchTrendingProducts();
	}, [showAll]);

	if (loading) {
		return (
			<section>
				<div className="mx-auto max-w-7xl">
					<div className="mb-6 flex items-center gap-2">
						<div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
						<div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<div className="mb-6 flex items-center gap-2">
					<h2 className="text-2xl font-bold text-gray-900">Trending</h2>
				</div>

				{/* Products Grid */}
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							isFavorite={favorites.includes(product.id)}
							onToggleFavorite={() => toggleFavorite(product.id)}
						/>
					))}
				</div>

				{/* Show More Button */}
				{!showAll && products.length >= 6 && (
					<div className="mt-8 text-center">
						<Button
							onClick={() => setShowAll(true)}
							variant="outline"
							className="rounded-full border-purple-600 px-8 py-3 font-medium text-purple-600 hover:bg-purple-50"
						>
							See More Trending Deals
						</Button>
					</div>
				)}
			</div>
			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</section>
	);
}
