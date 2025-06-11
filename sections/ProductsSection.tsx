'use client';

import ProductCard from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Mock data for demonstration
const mockProducts = [
	{
		id: '1',
		title: 'Premium Spa Package + Massage Therapy',
		business: 'Serenity Wellness Spa',
		category: 'Beauty & Spas',
		image: '/placeholder.svg?height=300&width=400',
		originalPrice: 199.99,
		discountedPrice: 89.99,
		discountPercentage: 55,
		rating: 4.8,
		reviewCount: 2847,
		location: 'Downtown Chicago',
		distance: '2.1 mi',
		isPopular: true,
		badge: 'Popular Choice',
	},
	{
		id: '2',
		title: 'Annual Gym Membership + Personal Training Sessions',
		business: 'FitLife Fitness Center',
		category: 'Health & Fitness',
		image: '/placeholder.svg?height=300&width=400',
		originalPrice: 599.99,
		discountedPrice: 199.99,
		discountPercentage: 67,
		rating: 4.6,
		reviewCount: 1523,
		location: 'North Side',
		distance: '3.4 mi',
		isPopular: false,
	},
	{
		id: '3',
		title: 'Gourmet Dinner for Two + Wine Pairing',
		business: 'The Metropolitan Bistro',
		category: 'Food & Drink',
		image: '/placeholder.svg?height=300&width=400',
		originalPrice: 149.99,
		discountedPrice: 74.99,
		discountPercentage: 50,
		rating: 4.9,
		reviewCount: 892,
		location: 'River North',
		distance: '1.8 mi',
		isPopular: true,
		badge: "Chef's Special",
	},
	{
		id: '4',
		title: 'Adventure Park Day Pass + Equipment Rental',
		business: 'Thrill Seekers Adventure Park',
		category: 'Things To Do',
		image: '/placeholder.svg?height=300&width=400',
		originalPrice: 89.99,
		discountedPrice: 39.99,
		discountPercentage: 56,
		rating: 4.7,
		reviewCount: 1247,
		location: 'Suburbs',
		distance: '12.5 mi',
		isPopular: false,
	},
	{
		id: '5',
		title: 'Professional Photography Session + Prints',
		business: 'Capture Moments Studio',
		category: 'Services',
		image: '/placeholder.svg?height=300&width=400',
		originalPrice: 299.99,
		discountedPrice: 129.99,
		discountPercentage: 57,
		rating: 4.8,
		reviewCount: 634,
		location: 'Lincoln Park',
		distance: '4.2 mi',
		isPopular: true,
		badge: 'Limited Time',
	},
	{
		id: '6',
		title: 'Weekend Getaway Package + Breakfast',
		business: 'Lakeside Resort & Spa',
		category: 'Travel',
		image: '/placeholder.svg?height=300&width=400',
		originalPrice: 399.99,
		discountedPrice: 199.99,
		discountPercentage: 50,
		rating: 4.5,
		reviewCount: 2156,
		location: 'Lake Geneva',
		distance: '45.3 mi',
		isPopular: false,
	},
];

export default function ProductsSection() {
	const [favorites, setFavorites] = useState<string[]>([]);

	const toggleFavorite = (productId: string) => {
		setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Products Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{mockProducts.map((product) => (
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
		</div>
	);
}
