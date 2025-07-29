'use client';

import { ExternalLink, MapPin, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import MerchantDetailsCard from '@/components/MerchantDetailsCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductActionButtons from '@/components/ProductActionButtons';
import ProductDetailsSkeleton from '@/components/skeletons/ProductDetailsSkeleton';
import { Button } from '@/components/ui/button';
import { ProductMap } from '@/components/ui/product-map';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { getProductById, incrementProductView } from '@/firebase/productServices';
import { toast } from '@/hooks/use-toast';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import { useViewedProductsStore } from '@/stores/viewedProductsStore';
import type { Product } from '@/types';
import { useParams } from 'next/navigation';

export default function ProductPage() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const { user } = useAuth();

	const params = useParams();
	const id = params.id as string;

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const { hasViewed, markAsViewed } = useViewedProductsStore();

	useEffect(() => {
		if (product) {
			const isOwner = user?.uid === product.merchantId;
			const alreadyViewed = hasViewed(product.id);

			if (!isOwner && !alreadyViewed) {
				incrementProductView(product.id).catch((err) => toast.error('Failed to increment product views:', err));
				markAsViewed(product.id);
			}
		}
	}, [product, user]);

	useEffect(() => {
		const fetchProduct = async () => {
			const data = await getProductById(id);
			setProduct(data);
			setLoading(false);
		};

		fetchProduct();
	}, [id]);

	if (loading) {
		return <ProductDetailsSkeleton />;
	}

	if (!product) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center">
				<h2 className="mb-2 text-2xl font-bold">Product not found</h2>
				<p className="mb-4 text-gray-600">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
				<Link href="/">
					<Button>Back to Home</Button>
				</Link>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto max-w-6xl">
				<div className="mb-6">
					<Link href="/" className="text-sm text-purple-600 hover:underline">
						← Back to Deals
					</Link>
				</div>

				<div className="grid items-center gap-8 md:grid-cols-2 lg:gap-20">
					{/* Product Image */}
					<div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
						<Image
							src={product.image || '/placeholder.svg?height=600&width=600'}
							alt={product.title}
							fill
							className="object-cover"
							priority
						/>
						{product.badge && (
							<div className="absolute top-4 left-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
								{product.badge}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div>
						<div className="mb-6">
							<div className="mb-1 flex items-center gap-2">
								<span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
									{product.category}
								</span>
								<div className="flex items-center text-sm text-gray-500">
									<MapPin className="mr-1 h-4 w-4" />
									{product.location}
								</div>
							</div>

							<h1 className="mb-2 text-3xl font-bold text-gray-900">{product.title}</h1>

							<div className="mb-2 flex items-center text-sm text-gray-700">
								<Store className="mr-1 h-4 w-4" />
								<span>{product.business}</span>
							</div>

							<div className="mb-6">
								<div className="mb-2 flex items-baseline gap-2">
									{product.discountPercentage ? (
										<>
											<span className="text-3xl font-bold text-gray-900">${(product.discountedPrice ?? 0).toFixed(2)}</span>
											<span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
											<span className="rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
												{product.discountPercentage}% OFF
											</span>
										</>
									) : (
										<span className="text-xl text-gray-900">${product.originalPrice.toFixed(2)}</span>
									)}
								</div>
							</div>

							<Separator className="my-6" />

							<div className="mt-8 flex flex-col gap-4 sm:flex-row">
								<Button
									size="lg"
									className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
									onClick={() => window.open(product.affiliateLink, '_blank')}
								>
									View Deal
									<ExternalLink className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="flex items-center gap-2 border-purple-600 bg-transparent text-purple-600 hover:bg-purple-50"
									onClick={() => toggleFavorite(product.id)}
								>
									{favorites.includes(product.id) ? 'Remove from wishlist' : 'Add to Wishlist'}
								</Button>
							</div>

							{/* Product Action Buttons */}
							<ProductActionButtons productId={product.id} />
						</div>
					</div>
				</div>

				{/* Additional Information */}
				<div className="mt-12">
					<div className="rounded-lg border border-gray-200 p-6">
						<h3 className="mb-2 text-lg font-medium text-gray-800">About {product.business}</h3>
						<p className="break-words text-gray-600">{product.description}</p>
					</div>
				</div>

				{/* Merchant Details */}
				<MerchantDetailsCard merchantId={product.merchantId} />

				{/* Product Location Map */}
				<div className="mt-8">
					<div className="overflow-hidden rounded-lg border border-gray-200">
						<div className="border-b border-gray-200 bg-gray-50 p-4">
							<h3 className="text-lg font-medium text-gray-800">Location</h3>
						</div>
						<ProductMap location={product.location} className="h-80" />
					</div>
				</div>
			</div>
			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</>
	);
}
