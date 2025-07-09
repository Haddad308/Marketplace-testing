'use client';

import type React from 'react';

import { Grid3X3, MapPin, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { getPopularProducts, searchProducts } from '@/firebase/productServices';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from '@/hooks/use-toast';
import { SEARCH_PRODUCTS_PAGE_SIZE } from '@/lib/constants';
import { useLocationStore } from '@/stores/locationStore';
import type { Product } from '@/types';
import { useSearchParams } from 'next/navigation';
import { LocationSearchModal } from './modals/LocationSearchModal';
import { Button } from './ui/button';

export function SearchDropdown() {
	const { location, setLocation } = useLocationStore();

	const searchParams = useSearchParams();

	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
	const debouncedSearchQuery = useDebounce(searchQuery, 300);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Handle click outside to close dropdown
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Fetch popular products when dropdown is opened with empty search
	useEffect(() => {
		if (isOpen && !searchQuery) {
			fetchPopularProducts();
		}
	}, [isOpen]);

	// Fetch products based on search query
	useEffect(() => {
		if (debouncedSearchQuery) {
			fetchSearchResults();
		} else if (isOpen && !searchQuery) {
			fetchPopularProducts();
		}
	}, [debouncedSearchQuery]);

	const fetchPopularProducts = async () => {
		setIsLoading(true);
		try {
			const popularProducts = await getPopularProducts(3, location);

			setProducts(popularProducts);
		} catch (error) {
			console.error('Error fetching popular products:', error);
			toast.error(error instanceof Error ? error.message : 'Error fetching popular products');
		} finally {
			setIsLoading(false);
		}
	};

	const fetchSearchResults = async () => {
		setIsLoading(true);
		try {
			const results = await searchProducts(debouncedSearchQuery, SEARCH_PRODUCTS_PAGE_SIZE, location);
			setProducts(results);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Error searching products');
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputFocus = () => {
		setIsOpen(true);
		if (!searchQuery) {
			fetchPopularProducts();
		}
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		inputRef.current?.focus();
	};

	const handleLocationSelect = (location: string) => {
		setLocation(location);

		toast.success(`Location set to ${location}`);
	};

	const handleLocationButtonClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsLocationModalOpen(true);
	};

	return (
		<>
			<div className="relative w-full" ref={dropdownRef}>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						ref={inputRef}
						type="text"
						placeholder="Search for deals"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={handleInputFocus}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
							}
						}}
						className="block w-full rounded-full border border-gray-300 bg-white py-2 pr-20 pl-10 leading-5 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
					/>

					{/* Location Search Button */}
					<Button
						onClick={handleLocationButtonClick}
						variant="ghost"
						size="sm"
						className="absolute inset-y-0.5 right-8 flex items-center rounded-full px-2 hover:bg-gray-100"
						title="Search by location"
					>
						<MapPin className="me-2 h-4 w-4 text-gray-500 hover:text-purple-600" />
						{location ? location : 'Select Location'}
					</Button>

					{/* Clear Search Button */}
					{searchQuery && (
						<Button
							onClick={handleClearSearch}
							variant="ghost"
							size="sm"
							className="absolute inset-y-0.5 right-0 flex items-center rounded-full pr-3 hover:bg-gray-100"
						>
							<X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
						</Button>
					)}
				</div>

				{isOpen && (
					<div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
						<div className="p-4">
							<div className="mb-3 flex items-center justify-between">
								<h3 className="text-sm font-medium text-gray-500">{searchQuery ? 'Deals' : 'Popular searches'}</h3>
								<Link href="/categories" onClick={() => setIsOpen(false)}>
									<Button variant="ghost" size="sm" className="text-xs text-purple-600 hover:text-purple-700">
										<Grid3X3 className="mr-1 h-3 w-3" />
										Browse Categories
									</Button>
								</Link>
							</div>

							{isLoading ? (
								<div className="flex h-24 items-center justify-center">
									<div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
								</div>
							) : products.length === 0 ? (
								<div className="py-4 text-center text-gray-500">No results found</div>
							) : (
								<div className="space-y-4">
									{products.map((product) => (
										<Link
											key={product.id}
											href={`/product/${product.id}`}
											className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
											onClick={() => setIsOpen(false)}
										>
											<div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-md">
												<Image
													src={product.image || '/placeholder.svg?height=80&width=96'}
													alt={product.title}
													fill
													className="object-cover"
												/>
											</div>
											<div className="flex-1">
												<div className="mb-1 text-xs text-gray-500">{product.category}</div>
												<h4 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">{product.title}</h4>
												<div className="mb-1 text-xs text-gray-500">{product.location}</div>
												<div className="flex items-center gap-2">
													<span className="text-sm font-bold text-gray-900">${product.discountedPrice}</span>
													<span className="text-xs text-gray-500 line-through">${product.originalPrice}</span>
													<span className="text-xs font-medium text-green-600">-{product.discountPercentage}%</span>
												</div>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>

						{products.length > 0 && (
							<div className="border-t border-gray-100 p-2">
								<Button
									onClick={() => {
										window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
									}}
									className="w-full rounded-full bg-purple-600 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700"
								>
									<Search className="mr-2 h-4 w-4" />
									Show all results
								</Button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Location Search Modal */}
			<LocationSearchModal
				isOpen={isLocationModalOpen}
				onClose={() => setIsLocationModalOpen(false)}
				onLocationSelect={handleLocationSelect}
			/>
		</>
	);
}
