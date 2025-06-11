'use client';

import { Product } from '@/types';
import { Heart, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

interface ProductCardProps {
	product: Product;
	isFavorite: boolean;
	onToggleFavorite: () => void;
}

export default function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps) {
	const {
		id,
		title,
		business,
		category,
		image,
		originalPrice,
		discountedPrice,
		discountPercentage,
		rating,
		reviewCount,
		location,
		distance,
		redirectLink,
		badge,
	} = product;

	return (
		<div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
			{/* Image Container */}
			<div className="relative aspect-[4/3] overflow-hidden">
				<Image
					src={image || '/placeholder.svg'}
					alt={title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>

				{/* Badge */}
				{badge && (
					<div className="absolute top-3 left-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
						{badge}
					</div>
				)}

				{/* Wishlist Button */}
				<Button
					onClick={onToggleFavorite}
					className={`absolute top-3 right-3 h-8 w-8 rounded-full p-2 transition-colors duration-200 ${
						isFavorite ? 'bg-purple-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-purple-600'
					}`}
				>
					<Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
				</Button>
			</div>

			{/* Content */}
			<div className="p-4">
				{/* Business & Category */}
				<div className="mb-2 flex items-center justify-between">
					<span className="text-sm font-medium text-purple-600">{business}</span>
					<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">{category}</span>
				</div>

				{/* Title */}
				<Link href={`/product/${id}`}>
					<h3 className="mb-3 line-clamp-2 cursor-pointer font-semibold text-gray-900 transition-colors duration-200 hover:text-purple-600">
						{title}
					</h3>
				</Link>

				{/* Location */}
				<div className="mb-3 flex items-center text-sm text-gray-600">
					<MapPin className="mr-1 h-4 w-4" />
					<span>{location}</span>
					<span className="mx-2">•</span>
					<span>{distance}</span>
				</div>

				{/* Rating */}
				<div className="mb-4 flex items-center">
					<div className="flex items-center">
						<Star className="h-4 w-4 fill-current text-yellow-400" />
						<span className="ml-1 text-sm font-medium text-gray-900">{rating}</span>
					</div>
					<span className="ml-2 text-sm text-gray-500">({reviewCount.toLocaleString()})</span>
				</div>

				{/* Pricing */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<span className="text-lg font-bold text-purple-600">${discountedPrice.toFixed(2)}</span>
						<span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
					</div>
					<div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
						-{discountPercentage}%
					</div>
				</div>

				{/* CTA Button */}
				<Link href={redirectLink || `/product/${id}`}>
					<Button className="mt-4 w-full rounded-lg bg-purple-600 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-purple-700">
						View Deal
					</Button>
				</Link>
			</div>
		</div>
	);
}
