'use client';

import ProductCard from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/firebase/productServices';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import type { Product } from '@/types';
import { useEffect, useState } from 'react';

export default function TrendingSection() {
	const { favorites, toggleFavorite } = useToggleFavorites();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		const fetchTrendingProducts = async () => {
			try {
				const allProducts = await getProducts();
				// Filter for trending/popular products and limit to 6 initially
				const trendingProducts = allProducts
					.filter((product) => product.isPopular)
					.slice(0, showAll ? allProducts.length : 6);
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
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
		</section>
	);
}
