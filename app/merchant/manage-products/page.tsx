'use client';

import { Filter, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import MerchantProductCard from '@/components/cards/MerchantProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { getMerchantProducts } from '@/firebase/merchantServices';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';

export default function ManageServicesPage() {
	const { user } = useAuth();
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [sortBy, setSortBy] = useState('newest');

	useEffect(() => {
		if (user) {
			fetchProducts();
		}
	}, [user]);

	useEffect(() => {
		filterAndSortProducts();
	}, [products, searchQuery, categoryFilter, sortBy]);

	const fetchProducts = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const merchantProducts = await getMerchantProducts(user.uid);
			setProducts(merchantProducts);
		} catch (error) {
			console.error('Error fetching products:', error);
			toast.error('Error', 'Failed to fetch products');
		} finally {
			setLoading(false);
		}
	};

	const filterAndSortProducts = () => {
		let filtered = [...products];

		// Apply search filter
		if (searchQuery) {
			filtered = filtered.filter(
				(product) =>
					product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.business.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Apply category filter
		if (categoryFilter !== 'all') {
			filtered = filtered.filter((product) => product.category === categoryFilter);
		}

		// Apply sorting
		switch (sortBy) {
			case 'newest':
				filtered.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
				break;
			case 'oldest':
				filtered.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
				break;
			case 'price-high':
				filtered.sort((a, b) => (b.discountedPrice ?? b.originalPrice) - (a.discountedPrice ?? a.originalPrice));
				break;
			case 'price-low':
				filtered.sort((a, b) => (a.discountedPrice ?? a.originalPrice) - (b.discountedPrice ?? b.originalPrice));
				break;
			case 'discount':
				filtered.sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0));
				break;
			default:
				break;
		}

		setFilteredProducts(filtered);
	};

	const categories = [...new Set(products.map((p) => p.category))];

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-700"></div>
					<div className="h-10 w-32 animate-pulse rounded bg-gray-700"></div>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="border-gray-700 bg-gray-800">
							<CardContent className="p-6">
								<div className="animate-pulse space-y-4">
									<div className="h-32 rounded bg-gray-700"></div>
									<div className="h-4 w-3/4 rounded bg-gray-700"></div>
									<div className="h-4 w-1/2 rounded bg-gray-700"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-white">Manage Products</h2>
					<p className="text-gray-400">View and manage all your product listings</p>
				</div>
				{user?.permissions?.some((perm) => perm === 'add' || perm === 'edit') && (
					<Link href="/merchant/add-product">
						<Button className="bg-blue-600 hover:bg-blue-700">
							<Plus className="mr-2 h-4 w-4" />
							Add New Product
						</Button>
					</Link>
				)}
			</div>

			{/* Filters */}
			<Card className="border-gray-700 bg-gray-800">
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 sm:flex-row">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
								<Input
									placeholder="Search products..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
								/>
							</div>
						</div>

						{/* Category Filter */}
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-48 border-gray-600 bg-gray-700 text-white">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Sort */}
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-48 border-gray-600 bg-gray-700 text-white">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Newest First</SelectItem>
								<SelectItem value="oldest">Oldest First</SelectItem>
								<SelectItem value="price-high">Price: High to Low</SelectItem>
								<SelectItem value="price-low">Price: Low to High</SelectItem>
								<SelectItem value="discount">Highest Discount</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Results Summary */}
			<div className="flex items-center justify-between">
				<p className="text-gray-400">
					Showing {filteredProducts.length} of {products.length} products
				</p>
			</div>

			{/* Products Grid */}
			{filteredProducts.length === 0 ? (
				<Card className="border-gray-700 bg-gray-800">
					<CardContent className="p-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
							<Search className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="mb-2 text-lg font-medium text-white">No products found</h3>
						<p className="mb-6 text-gray-400">
							{products.length === 0 ? "You haven't created any products yet." : 'No products match your current filters.'}
						</p>
						{products.length === 0 ? (
							user?.permissions?.some((perm) => perm === 'add' || perm === 'edit') && (
								<Link href="/merchant/add-product">
									<Button className="bg-blue-600 hover:bg-blue-700">
										<Plus className="mr-2 h-4 w-4" />
										Create Your First Product
									</Button>
								</Link>
							)
						) : (
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery('');
									setCategoryFilter('all');
									setSortBy('newest');
								}}
								className="border-gray-600 text-gray-300 hover:bg-gray-700"
							>
								Clear Filters
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredProducts.map((product) => (
						<MerchantProductCard key={product.id} product={product} setProducts={setProducts} />
					))}
				</div>
			)}
		</div>
	);
}
