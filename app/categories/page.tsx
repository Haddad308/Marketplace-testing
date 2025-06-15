'use client';

import { ArrowRight, Package, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/firebase/productServices';
import { categoryMetadata } from '@/lib/constants';
import type { Product } from '@/types';

interface CategoryData {
	name: string;
	slug: string;
	count: number;
	icon: string;
	description: string;
	color: string;
	products: Product[];
}

export default function CategoriesPage() {
	const [categories, setCategories] = useState<CategoryData[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCategoriesData();
	}, []);

	const fetchCategoriesData = async () => {
		try {
			const products = await getProducts();

			// Group products by category
			const categoryMap = new Map<string, Product[]>();

			products.forEach((product) => {
				const category = product.category;
				if (!categoryMap.has(category)) {
					categoryMap.set(category, []);
				}
				categoryMap.get(category)!.push(product);
			});

			// Create category data
			const categoriesData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, products]) => {
				const metadata = categoryMetadata[name as keyof typeof categoryMetadata] || {
					icon: '📦',
					description: `Great deals on ${name.toLowerCase()}`,
					color: 'from-gray-500 to-slate-500',
				};

				return {
					name,
					slug: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
					count: products.length,
					products,
					...metadata,
				};
			});

			// Sort by product count (most popular first)
			categoriesData.sort((a, b) => b.count - a.count);

			setCategories(categoriesData);
		} catch (error) {
			console.error('Error fetching categories:', error);
		} finally {
			setLoading(false);
		}
	};

	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalDeals = categories.reduce((sum, category) => sum + category.count, 0);

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
			{/* Header Section */}
			<div className="border-b border-gray-200 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="mb-4 text-4xl font-bold text-gray-900">Browse Categories</h1>
						<p className="mb-6 text-xl text-gray-600">
							Discover amazing deals across {categories.length} categories with {totalDeals.toLocaleString()} total deals
						</p>

						{/* Search Bar */}
						<div className="mx-auto max-w-md">
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<Search className="h-5 w-5 text-gray-400" />
								</div>
								<Input
									type="text"
									placeholder="Search categories..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full rounded-full border-gray-300 py-3 pr-4 pl-10 focus:border-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Categories Grid */}
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{loading ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{[...Array(8)].map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="p-6">
									<div className="mb-4 h-16 w-16 rounded-full bg-gray-200"></div>
									<div className="mb-2 h-6 rounded bg-gray-200"></div>
									<div className="mb-4 h-4 rounded bg-gray-200"></div>
									<div className="h-4 w-20 rounded bg-gray-200"></div>
								</CardContent>
							</Card>
						))}
					</div>
				) : filteredCategories.length === 0 ? (
					<div className="py-12 text-center">
						<Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<h3 className="mb-2 text-lg font-medium text-gray-900">No categories found</h3>
						<p className="text-gray-500">Try adjusting your search terms.</p>
					</div>
				) : (
					<>
						{/* Featured Categories */}
						<div className="mb-8">
							<h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
								<TrendingUp className="mr-2 h-6 w-6 text-purple-600" />
								Most Popular Categories
							</h2>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{filteredCategories.slice(0, 3).map((category) => (
									<Link key={category.slug} href={`/categories/${category.slug}`}>
										<Card className="group cursor-pointer border-2 transition-all duration-300 hover:border-purple-300 hover:shadow-lg">
											<CardContent className="p-6">
												<div
													className={`h-16 w-16 rounded-full bg-gradient-to-r ${category.color} mb-4 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110`}
												>
													{category.icon}
												</div>
												<h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-purple-600">
													{category.name}
												</h3>
												<p className="mb-4 line-clamp-2 text-sm text-gray-600">{category.description}</p>
												<div className="flex items-center justify-between">
													<span className="text-sm font-medium text-purple-600">{category.count} deals</span>
													<ArrowRight className="h-4 w-4 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-600" />
												</div>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						</div>

						{/* All Categories */}
						<div>
							<h2 className="mb-6 text-2xl font-bold text-gray-900">All Categories</h2>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{filteredCategories.map((category) => (
									<Link key={category.slug} href={`/categories/${category.slug}`}>
										<Card className="group cursor-pointer transition-all duration-300 hover:border-purple-200 hover:shadow-md">
											<CardContent className="p-4">
												<div className="flex items-center space-x-4">
													<div
														className={`h-12 w-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-105`}
													>
														{category.icon}
													</div>
													<div className="min-w-0 flex-1">
														<h3 className="truncate font-semibold text-gray-900 transition-colors group-hover:text-purple-600">
															{category.name}
														</h3>
														<p className="text-sm text-gray-500">{category.count} deals</p>
													</div>
													<ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-600" />
												</div>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						</div>
					</>
				)}

				{/* Call to Action */}
				{!loading && filteredCategories.length > 0 && (
					<div className="mt-12 text-center">
						<div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
							<h3 className="mb-4 text-2xl font-bold text-gray-900">Can't find what you're looking for?</h3>
							<p className="mb-6 text-gray-600">Use our search to find specific deals or browse all available offers.</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Link href="/search">
									<Button className="bg-purple-600 text-white hover:bg-purple-700">
										<Search className="mr-2 h-4 w-4" />
										Search All Deals
									</Button>
								</Link>
								<Link href="/">
									<Button variant="outline">View Homepage</Button>
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
