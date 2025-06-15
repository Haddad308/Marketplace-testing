'use client';

import { ExternalLink, MapPin, Star, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductDetailsSkeleton from '@/components/skeletons/ProductDetailsSkeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getProductById } from '@/firebase/productServices';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import { Product } from '@/types';
import { useParams } from 'next/navigation';

export default function ProductPage() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const params = useParams();
	const id = params.id as string;

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);

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
				<p className="mb-4 text-gray-600">The product you`&apos;re looking for doesn`&apos;t exist or has been removed.</p>
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

				<div className="grid gap-8 md:grid-cols-2">
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
									{product.location} {product.distance && `(${product.distance})`}
								</div>
							</div>

							<h1 className="mb-2 text-3xl font-bold text-gray-900">{product.title}</h1>

							<div className="mb-2 flex items-center text-sm text-gray-700">
								<Store className="mr-1 h-4 w-4" />
								<span>{product.business}</span>
							</div>

							<div className="mb-4 flex items-center gap-2">
								<div className="flex items-center">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
										/>
									))}
								</div>
								<span className="text-sm font-medium text-gray-700">{product.rating}</span>
								<span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
							</div>

							<div className="mb-6">
								<div className="mb-2 flex items-baseline gap-2">
									<span className="text-3xl font-bold text-gray-900">${product.discountedPrice.toFixed(2)}</span>
									<span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
									<span className="rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
										{product.discountPercentage}% OFF
									</span>
								</div>
							</div>

							<Separator className="my-6" />

							{product.isPopular && (
								<div className="mb-6 rounded-md bg-amber-50 p-3">
									<p className="flex items-center text-sm font-medium text-amber-800">
										<svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
										Popular Deal - Many customers have purchased this deal
									</p>
								</div>
							)}

							<div className="mt-8 flex flex-col gap-4 sm:flex-row">
								<Button
									size="lg"
									className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
									onClick={() => window.open(product.redirectLink, '_blank')}
								>
									View Deal
									<ExternalLink className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="flex items-center gap-2 border-purple-600 text-purple-600 hover:bg-purple-50"
									onClick={() => toggleFavorite(product.id)}
								>
									{favorites.includes(product.id) ? 'Remove from wishlist' : 'Add to Wishlist'}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Additional Information */}
				<div className="mt-12">
					<div className="rounded-lg border border-gray-200 bg-white p-6">
						<h2 className="mb-4 text-xl font-medium text-gray-900">Deal Information</h2>

						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<h3 className="mb-2 text-lg font-medium text-gray-800">About {product.business}</h3>
								<p className="text-gray-600">
									{product.business} offers amazing deals on {product.category.toLowerCase()} services. Located in{' '}
									{product.location}, they provide exceptional value and quality service.
								</p>
							</div>

							<div>
								<h3 className="mb-2 text-lg font-medium text-gray-800">Deal Highlights</h3>
								<ul className="list-inside list-disc space-y-1 text-gray-600">
									<li>Save {product.discountPercentage}% off the regular price</li>
									<li>
										Highly rated with {product.rating} stars ({product.reviewCount} reviews)
									</li>
									<li>
										Located in {product.location} {product.distance && `(${product.distance})`}
									</li>
									{product.isPopular && <li>Popular deal - purchased by many customers</li>}
								</ul>
							</div>
						</div>

						<div className="mt-6">
							<h3 className="mb-2 text-lg font-medium text-gray-800">Fine Print</h3>
							<div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700">
								<p>• Promotional value expires 120 days after purchase.</p>
								<p>• Not valid with other offers.</p>
								<p>• Limit 1 per person, may buy 1 additional as gift.</p>
								<p>• All sales are final.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</>
	);
}
