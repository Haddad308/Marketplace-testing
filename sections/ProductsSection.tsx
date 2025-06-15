'use client';

import ProductCard from '@/components/cards/ProductCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/firebase/productServices';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import { Product } from '@/types';
import { useEffect, useState } from 'react';

export default function ProductsSection() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const [products, setProducts] = useState<Product[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [message, setmessage] = useState({ variant: '', message: '' });

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await getProducts();
				setProducts(response);
			} catch (error) {
				setmessage({ variant: 'error', message: 'Failed to fetch products, Please try again later' });
			} finally {
				setLoading(false);
			}
		};
		fetchProducts();
	}, []);

	if (loading) {
		return <ProductGridSkeleton />;
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Products Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{products?.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						isFavorite={favorites.includes(product.id)}
						onToggleFavorite={() => toggleFavorite(product.id)}
					/>
				))}
			</div>

			{/* Load More Button */}
			<div className="mt-12 text-center">
				<Button
					variant="outline"
					className="rounded-full border-purple-600 px-8 py-3 font-medium text-purple-600 transition-colors duration-200 hover:border-purple-700 hover:bg-purple-50 hover:text-purple-900"
				>
					Load More Deals
				</Button>
			</div>

			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</div>
	);
}
