'use client';

import { ArrowLeft, Filter, Package, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ProductCard from '@/components/cards/ProductCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProducts } from '@/firebase/productServices';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import { categoryMetadata } from '@/lib/constants';
import type { CategoryInfo, Product } from '@/types';

export default function CategoryPage() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();
	const params = useParams();
	const slug = params.slug as string;

	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState('relevance');
	const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);

	useEffect(() => {
		fetchCategoryProducts();
	}, [slug]);

	useEffect(() => {
		applySorting();
	}, [sortBy, products]);

	const fetchCategoryProducts = async () => {
		try {
			setLoading(true);

			// Get category info
			const info = categoryMetadata[slug];
			if (!info) {
				return;
			}
			setCategoryInfo(info);

			// Fetch all products and filter by category
			const allProducts = await getProducts();
			const categoryProducts = allProducts.filter(
				(product) => product.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === slug
			);

			setProducts(categoryProducts);
			setFilteredProducts(categoryProducts);
		} catch (error) {
			console.error('Error fetching category products:', error);
		} finally {
			setLoading(false);
		}
	};

	const applySorting = () => {
		const sorted = [...products];

		switch (sortBy) {
			case 'price-low':
				sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
				break;
			case 'price-high':
				sorted.sort((a, b) => b.discountedPrice - a.discountedPrice);
				break;
			case 'discount':
				sorted.sort((a, b) => b.discountPercentage - a.discountPercentage);
				break;
			case 'rating':
				sorted.sort((a, b) => b.rating - a.rating);
				break;
			case 'popular':
				sorted.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
				break;
			default:
				// Keep original order for relevance
				break;
		}

		setFilteredProducts(sorted);
	};

	if (!categoryInfo && !loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-rose-100">
				<div className="flex flex-col items-center justify-center py-12">
					<Package className="mb-4 h-16 w-16 text-gray-400" />
					<h1 className="mb-2 text-2xl font-bold text-gray-900">Category Not Found</h1>
					<p className="mb-6 text-gray-600">The category you&apos;re looking for doesn&apos;t exist.</p>
					<Link href="/categories">
						<Button>Browse All Categories</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100">
			{/* Category Header */}
			<div className="border-b border-gray-200 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="mb-4">
						<Link href="/categories" className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700">
							<ArrowLeft className="mr-1 h-4 w-4" />
							Back to Categories
						</Link>
					</div>

					{categoryInfo && (
						<div className="flex items-center space-x-6">
							<div
								className={`h-20 w-20 rounded-2xl bg-gradient-to-r ${categoryInfo.color} flex items-center justify-center text-3xl shadow-lg`}
							>
								{categoryInfo.icon}
							</div>
							<div className="flex-1">
								<h1 className="mb-2 text-4xl font-bold text-gray-900">{categoryInfo.name}</h1>
								<p className="mb-4 text-xl text-gray-600">{categoryInfo.description}</p>
								<p className="text-sm text-gray-500">{loading ? 'Loading...' : `${filteredProducts.length} deals available`}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Filters and Sorting */}
				{!loading && filteredProducts.length > 0 && (
					<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center space-x-4">
							<span className="text-sm font-medium text-gray-700">Showing {filteredProducts.length} deals</span>
						</div>

						<div className="flex items-center space-x-4">
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className="w-48 bg-white">
									<SlidersHorizontal className="mr-2 h-4 w-4" />
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="relevance">Most Relevant</SelectItem>
									<SelectItem value="popular">Most Popular</SelectItem>
									<SelectItem value="price-low">Price: Low to High</SelectItem>
									<SelectItem value="price-high">Price: High to Low</SelectItem>
									<SelectItem value="discount">Highest Discount</SelectItem>
									<SelectItem value="rating">Highest Rated</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				{/* Products Grid */}
				{loading ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{[...Array(8)].map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<div className="text-center">
							<Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
							<h3 className="mb-2 text-xl font-medium text-gray-900">No deals found</h3>
							<p className="mb-6 text-gray-600">
								We don&apos;t have any deals in this category right now. Check back later or browse other categories.
							</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Link href="/categories">
									<Button variant="outline">Browse Other Categories</Button>
								</Link>
								<Link href="/search">
									<Button className="bg-purple-600 text-white hover:bg-purple-700">Search All Deals</Button>
								</Link>
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{filteredProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									isFavorite={favorites.includes(product.id)}
									onToggleFavorite={() => toggleFavorite(product.id)}
								/>
							))}
						</div>

						{/* Load More Section */}
						{filteredProducts.length >= 12 && (
							<div className="mt-12 text-center">
								<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
									<h3 className="mb-2 text-lg font-semibold text-gray-900">Want to see more deals?</h3>
									<p className="mb-4 text-gray-600">
										Explore our search page to find more {categoryInfo?.name?.toLowerCase()} deals with advanced filters.
									</p>
									<Link href={`/search?category=${encodeURIComponent(categoryInfo?.name || '')}`}>
										<Button className="bg-purple-600 hover:bg-purple-700">
											<Filter className="mr-2 h-4 w-4" />
											Advanced Search
										</Button>
									</Link>
								</div>
							</div>
						)}
					</>
				)}

				{wishlistLoginModalOpen && (
					<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
				)}
			</div>
		</div>
	);
}
