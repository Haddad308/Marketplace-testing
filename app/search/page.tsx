'use client';

import { ArrowLeft, DollarSign, Filter, Search, SlidersHorizontal, XIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import ProductCard from '@/components/cards/ProductCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchProducts } from '@/firebase/productServices';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import type { Product } from '@/types';

interface SearchFilters {
	query: string;
	category: string;
	sortBy: string;
	minPrice: number;
	maxPrice: number;
}

function SearchContent() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const router = useRouter();
	const searchParams = useSearchParams();

	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filters, setFilters] = useState<SearchFilters>({
		query: searchParams.get('q') || '',
		category: searchParams.get('category') || 'all',
		sortBy: searchParams.get('sort') || 'relevance',
		minPrice: Number(searchParams.get('minPrice')) || 0,
		maxPrice: Number(searchParams.get('maxPrice')) || 1000,
	});

	// Temporary state for price inputs
	const [tempMinPrice, setTempMinPrice] = useState(filters.minPrice.toString());
	const [tempMaxPrice, setTempMaxPrice] = useState(filters.maxPrice.toString());

	const categories = [
		'all',
		'Beauty & Spas',
		'Things To Do',
		'Auto & Home',
		'Food & Drink',
		'Gifts',
		'Local',
		'Travel',
		'Goods',
		'Coupons',
	];

	// Update URL when filters change
	const updateURL = useCallback((newFilters: SearchFilters) => {
		const params = new URLSearchParams();

		if (newFilters.query) params.set('q', newFilters.query);
		if (newFilters.category !== 'all') params.set('category', newFilters.category);
		if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy);
		if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString());
		if (newFilters.maxPrice < 1000) params.set('maxPrice', newFilters.maxPrice.toString());

		const newURL = params.toString() ? `/search?${params.toString()}` : '/search';
		window.history.pushState({}, '', newURL);
	}, []);

	// Perform search with all filters
	const performSearch = useCallback(async (searchFilters: SearchFilters) => {
		try {
			setIsLoading(true);

			// Get all products matching the search query
			let results = await searchProducts(searchFilters.query);

			// Apply category filter
			if (searchFilters.category !== 'all') {
				results = results.filter((product) => product.category.toLowerCase() === searchFilters.category.toLowerCase());
			}

			// Apply price filter
			results = results.filter(
				(product) => product.discountedPrice >= searchFilters.minPrice && product.discountedPrice <= searchFilters.maxPrice
			);

			// Apply sorting
			switch (searchFilters.sortBy) {
				case 'price-low':
					results.sort((a, b) => a.discountedPrice - b.discountedPrice);
					break;
				case 'price-high':
					results.sort((a, b) => b.discountedPrice - a.discountedPrice);
					break;
				case 'discount':
					results.sort((a, b) => b.discountPercentage - a.discountPercentage);
					break;
				case 'rating':
					results.sort((a, b) => b.rating - a.rating);
					break;
				default:
					// Keep relevance order (default from search)
					break;
			}

			setProducts(results);
		} catch (error) {
			console.error('Error searching products:', error);
			setProducts([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Handle filter changes
	const handleFilterChange = useCallback(
		(key: keyof SearchFilters, value: string | number) => {
			const newFilters = { ...filters, [key]: value };
			setFilters(newFilters);
			updateURL(newFilters);
			performSearch(newFilters);
		},
		[filters, updateURL, performSearch]
	);

	// Handle price filter application
	const handlePriceFilter = () => {
		const minPrice = Math.max(0, Number(tempMinPrice) || 0);
		const maxPrice = Math.max(minPrice, Number(tempMaxPrice) || 1000);

		setTempMinPrice(minPrice.toString());
		setTempMaxPrice(maxPrice.toString());

		const newFilters = { ...filters, minPrice, maxPrice };
		setFilters(newFilters);
		updateURL(newFilters);
		performSearch(newFilters);
	};

	// Reset price filter
	const handleResetPriceFilter = () => {
		setTempMinPrice('0');
		setTempMaxPrice('1000');
		const newFilters = { ...filters, minPrice: 0, maxPrice: 1000 };
		setFilters(newFilters);
		updateURL(newFilters);
		performSearch(newFilters);
	};

	// Initial search on component mount
	useEffect(() => {
		performSearch(filters);
	}, []); // Only run once on mount

	// Update temp price values when filters change from URL
	useEffect(() => {
		setTempMinPrice(filters.minPrice.toString());
		setTempMaxPrice(filters.maxPrice.toString());
	}, [filters.minPrice, filters.maxPrice]);

	const hasActiveFilters = filters.category !== 'all' || filters.minPrice > 0 || filters.maxPrice < 1000;

	return (
		<>
			{/* Results Info */}
			{!isLoading && (
				<div className="mb-8 flex items-center gap-2">
					<ArrowLeft className="cursor-pointer" onClick={() => router.push('/')} />
					<p className="text-gray-600">
						{products.length > 0
							? `Found ${products.length} deal${products.length !== 1 ? 's' : ''} ${
									filters.query ? `for "${filters.query}"` : ''
								}`
							: filters.query
								? `No results found for "${filters.query}"`
								: 'Enter a search term to find deals'}
					</p>
				</div>
			)}

			{/* Filters and Sorting */}
			{(products.length > 0 || isLoading) && (
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-4">
						{/* Category Filter */}
						<Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
							<SelectTrigger className="w-48">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category === 'all' ? 'All Categories' : category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Price Filter */}
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="w-48">
									<DollarSign className="mr-2 h-4 w-4" />
									Price Range
									{hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-purple-600"></span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label className="text-sm font-medium">Price Range</Label>
										<div className="flex items-center space-x-2">
											<div className="flex-1">
												<Label htmlFor="minPrice" className="text-xs text-gray-500">
													Min
												</Label>
												<Input
													id="minPrice"
													type="number"
													placeholder="0"
													value={tempMinPrice}
													onChange={(e) => setTempMinPrice(e.target.value)}
													className="mt-1"
													min="0"
												/>
											</div>
											<div className="flex-1">
												<Label htmlFor="maxPrice" className="text-xs text-gray-500">
													Max
												</Label>
												<Input
													id="maxPrice"
													type="number"
													placeholder="1000"
													value={tempMaxPrice}
													onChange={(e) => setTempMaxPrice(e.target.value)}
													className="mt-1"
													min="0"
												/>
											</div>
										</div>
									</div>
									<div className="flex space-x-2">
										<Button onClick={handlePriceFilter} size="sm" className="flex-1">
											Apply
										</Button>
										<Button onClick={handleResetPriceFilter} variant="outline" size="sm" className="flex-1">
											Reset
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					{/* Sort Filter */}
					<Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
						<SelectTrigger className="w-48">
							<SlidersHorizontal className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="relevance">Relevance</SelectItem>
							<SelectItem value="price-low">Price: Low to High</SelectItem>
							<SelectItem value="price-high">Price: High to Low</SelectItem>
							<SelectItem value="discount">Highest Discount</SelectItem>
							<SelectItem value="rating">Highest Rated</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Active Filters Display */}
			{hasActiveFilters && (
				<div className="mb-6 flex flex-wrap gap-2">
					{filters.category !== 'all' && (
						<div className="flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm">
							<span className="text-purple-800">Category: {filters.category}</span>
							<button
								onClick={() => handleFilterChange('category', 'all')}
								className="ml-2 cursor-pointer text-purple-600 hover:text-purple-800"
								aria-label="Clear category filter"
							>
								<XIcon className="h-4 w-4" />
							</button>
						</div>
					)}
					{(filters.minPrice > 0 || filters.maxPrice < 1000) && (
						<div className="flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm">
							<span className="text-purple-800">
								Price: ${filters.minPrice} - ${filters.maxPrice}
							</span>
							<button onClick={handleResetPriceFilter} className="ml-2 cursor-pointer text-purple-600 hover:text-purple-800">
								<XIcon className="h-4 w-4" />
							</button>
						</div>
					)}
				</div>
			)}

			{/* Results */}
			{isLoading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...Array(8)].map((_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			) : products.length > 0 ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							isFavorite={favorites.includes(product.id)}
							onToggleFavorite={() => toggleFavorite(product.id)}
						/>
					))}
				</div>
			) : filters.query ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
					<div className="mb-4 rounded-full bg-gray-100 p-4">
						<Search className="h-12 w-12 text-gray-400" />
					</div>
					<h3 className="mb-2 text-lg font-medium">No deals found</h3>
					<p className="mb-6 text-gray-500">
						We couldn't find any deals matching your criteria. Try adjusting your filters or search terms.
					</p>
					<div className="flex gap-2">
						<Button onClick={() => handleFilterChange('query', '')} variant="outline">
							Clear Search
						</Button>
						{hasActiveFilters && (
							<Button
								onClick={() => {
									const resetFilters = {
										...filters,
										category: 'all',
										minPrice: 0,
										maxPrice: 1000,
									};
									setFilters(resetFilters);
									updateURL(resetFilters);
									performSearch(resetFilters);
								}}
								variant="outline"
							>
								Clear Filters
							</Button>
						)}
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
					<div className="mb-4 rounded-full bg-purple-100 p-4">
						<Search className="h-12 w-12 text-purple-600" />
					</div>
					<h3 className="mb-2 text-lg font-medium">Start your search</h3>
					<p className="text-gray-500">Enter keywords to find amazing deals and offers.</p>
				</div>
			)}

			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</>
	);
}

export default function SearchPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SearchContent />
		</Suspense>
	);
}
