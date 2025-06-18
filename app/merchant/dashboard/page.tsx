'use client';

import { Calendar, Eye, LucideProps, Package, Plus, Star, TrendingUp } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { getMerchantProducts } from '@/firebase/merchantServices';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import Link from 'next/link';

interface DashboardStats {
	totalProducts: number;
	activeProducts: number;
	averageRating: number;
	totalViews: number;
	recentProducts: Product[];
}

export default function MerchantDashboard() {
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats>({
		totalProducts: 0,
		activeProducts: 0,
		averageRating: 0,
		totalViews: 0,
		recentProducts: [],
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user) {
			fetchDashboardStats();
		}
	}, [user]);

	const fetchDashboardStats = async () => {
		if (!user) return;

		try {
			setLoading(true);

			const products = await getMerchantProducts(user.uid);

			// Calculate stats
			const totalProducts = products.length;
			const activeProducts = products.filter((product) => !product.isArchived).length;
			const averageRating =
				products.length > 0 ? products.reduce((sum, product) => sum + (product.rating || 0), 0) / products.length : 0;
			const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0);
			const recentProducts = products.slice(0, 5);

			setStats({
				totalProducts,
				activeProducts,
				averageRating: Math.round(averageRating * 10) / 10,
				totalViews,
				recentProducts,
			});
		} catch (error) {
			console.error('Error fetching dashboard stats:', error);
			toast.error('Error', `Error fetching dashboard stats: ${error}`);
		} finally {
			setLoading(false);
		}
	};

	const StatCard = ({
		title,
		value,
		description,
		icon: Icon,
		color,
	}: {
		title: string;
		value: string | number;
		description: string;
		icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
		color: string;
	}) => (
		<Card className="border-gray-700 bg-gray-800">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
				<Icon className={`h-4 w-4 ${color}`} />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold text-white">{value}</div>
				<p className="text-xs text-gray-400">{description}</p>
			</CardContent>
		</Card>
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="border-gray-700 bg-gray-800">
							<CardContent className="p-6">
								<div className="animate-pulse space-y-3">
									<div className="h-4 w-3/4 rounded bg-gray-700"></div>
									<div className="h-8 w-1/2 rounded bg-gray-700"></div>
									<div className="h-3 w-full rounded bg-gray-700"></div>
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
			{/* Welcome Section */}
			<div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
				<h2 className="mb-2 text-2xl font-bold">
					Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Merchant'}!
				</h2>
				<p className="mb-4 text-blue-100">Here&apos;s an overview of your products and performance.</p>
				<Link href="/merchant/add-product">
					<Button className="bg-white text-blue-600 hover:bg-gray-100">
						<Plus className="mr-2 h-4 w-4" />
						Add New Product
					</Button>
				</Link>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Products"
					value={stats.totalProducts}
					description="All products created"
					icon={Package}
					color="text-blue-400"
				/>
				<StatCard
					title="Active Products"
					value={stats.activeProducts}
					description="Currently published"
					icon={TrendingUp}
					color="text-green-400"
				/>
				<StatCard
					title="Average Rating"
					value={stats.averageRating || 'N/A'}
					description="Across all products"
					icon={Star}
					color="text-yellow-400"
				/>
				<StatCard
					title="Total Views"
					value={stats.totalViews.toLocaleString()}
					description="Product page visits"
					icon={Eye}
					color="text-purple-400"
				/>
			</div>

			{/* Recent Products */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="border-gray-700 bg-gray-800">
					<CardHeader>
						<CardTitle className="flex items-center text-white">
							<Calendar className="mr-2 h-5 w-5" />
							Recent Products
						</CardTitle>
						<CardDescription className="text-gray-400">Your latest product submissions</CardDescription>
					</CardHeader>
					<CardContent>
						{stats.recentProducts.length === 0 ? (
							<div className="py-8 text-center">
								<Package className="mx-auto mb-4 h-12 w-12 text-gray-600" />
								<p className="mb-4 text-gray-400">No products yet</p>
								<Link href="/merchant/add-product">
									<Button size="sm" className="bg-blue-600 hover:bg-blue-700">
										Create Your First Product
									</Button>
								</Link>
							</div>
						) : (
							<div className="space-y-4">
								{stats.recentProducts.map((product) => (
									<div key={product.id} className="flex items-center space-x-4 rounded-lg bg-gray-700 p-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-600">
											<Package className="h-6 w-6 text-gray-400" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-white">{product.title}</p>
											<p className="text-xs text-gray-400">
												{product.category} • ${product.discountedPrice}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium text-green-400">-{product.discountPercentage}%</p>
											<p className="text-xs text-gray-400">{product.rating} ⭐</p>
										</div>
									</div>
								))}
								<Link href="/merchant/manage-products">
									<Button variant="outline" size="sm" className="mt-4 w-full border-gray-600 text-gray-300 hover:bg-gray-700">
										View All Products
									</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="border-gray-700 bg-gray-800">
					<CardHeader>
						<CardTitle className="text-white">Quick Actions</CardTitle>
						<CardDescription className="text-gray-400">Common tasks and shortcuts</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href="/merchant/add-product">
							<Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
								<Plus className="mr-2 h-4 w-4" />
								Add New Product
							</Button>
						</Link>
						<Link href="/merchant/manage-products">
							<Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
								<Package className="mr-2 h-4 w-4" />
								Manage Products
							</Button>
						</Link>
						<Button
							variant="outline"
							className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
							disabled
						>
							<TrendingUp className="mr-2 h-4 w-4" />
							View Analytics (Coming Soon)
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
