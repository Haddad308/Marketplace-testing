'use client';

import ProductCard from '@/components/cards/ProductCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';
import { Button } from '@/components/ui/button';
import { getPaginatedProducts } from '@/firebase/productServices';
import { toast } from '@/hooks/use-toast';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import { PAGE_SIZE } from '@/lib/constants';
import { Product } from '@/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function ProductsSection() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const [products, setProducts] = useState<Product[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
	const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		const fetchInitialProducts = async () => {
			try {
				const { products, lastVisible, hasMore } = await getPaginatedProducts();
				setProducts(products);
				setLastDoc(lastVisible);
				setHasMore(hasMore);
			} catch (error) {
				toast.error('error', 'Failed to fetch products, Please try again later');
			} finally {
				setLoading(false);
			}
		};
		fetchInitialProducts();
	}, []);

	const loadMoreProducts = async () => {
		if (!lastDoc || !hasMore) return;
		setLoadingMoreProducts(true);
		try {
			const { products: newProducts, lastVisible, hasMore } = await getPaginatedProducts(PAGE_SIZE, lastDoc);
			setProducts((prev) => (prev ? [...prev, ...newProducts] : prev));
			setLastDoc(lastVisible);
			setHasMore(hasMore);
		} catch (error) {
			toast.error('error', 'Failed to load more products');
		} finally {
			setLoadingMoreProducts(false);
		}
	};

	if (loading) {
		return <ProductGridSkeleton />;
	}

	return (
		<section className="mx-auto max-w-7xl py-8">
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
			{hasMore && (
				<div className="mt-12 text-center">
					<Button
						onClick={loadMoreProducts}
						disabled={loadingMoreProducts}
						variant="outline"
						className="rounded-full border-purple-600 px-8 py-3 font-medium text-purple-600 transition-colors duration-200 hover:border-purple-700 hover:bg-purple-50 hover:text-purple-900"
					>
						{loadingMoreProducts ? 'Loading...' : 'Load More Products'}
					</Button>
				</div>
			)}

			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</section>
	);
}
