'use client';

import { ExternalLink, Heart, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { removeFromWishlist } from '@/firebase/userServices';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';

interface WishlistProductCardProps {
	product: Product;
	onRemove: (productId: string) => void;
}

export default function WishlistProductCard({ product, onRemove }: WishlistProductCardProps) {
	const { user } = useAuth();
	const [isRemoving, setIsRemoving] = useState(false);

	const handleRemoveFromWishlist = async () => {
		if (!user) return;

		try {
			setIsRemoving(true);
			await removeFromWishlist(user.uid, product.id);
			onRemove(product.id);
		} catch (error) {
			console.error('Error removing from wishlist:', error);
			toast.error('Error', `Error removing from wishlist: ${error}`);
			setIsRemoving(false);
		}
	};

	return (
		<div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
			{product.badge && (
				<div className="absolute top-2 left-2 z-10 rounded-full bg-purple-600 px-2 py-1 text-xs font-medium text-white">
					{product.badge}
				</div>
			)}

			<Button
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1 text-red-500 backdrop-blur-sm hover:bg-white hover:text-red-600"
				onClick={handleRemoveFromWishlist}
				disabled={isRemoving}
			>
				<Heart className="h-5 w-5 fill-current" />
				<span className="sr-only">Remove from wishlist</span>
			</Button>

			<Link href={`/product/${product.id}`} className="block">
				<div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
					<Image
						src={product.image || '/placeholder.svg?height=300&width=400'}
						alt={product.title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
			</Link>

			<div className="p-4">
				<div className="mb-1 flex items-center justify-between">
					<span className="text-xs font-medium text-purple-600">{product.category}</span>
					{/* <div className="flex items-center">
						<Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
						<span className="text-xs font-medium">{product.rating}</span>
					</div> */}
				</div>

				<Link href={`/product/${product.id}`} className="block">
					<h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900 group-hover:text-purple-600">
						{product.title}
					</h3>
				</Link>

				<div className="mb-1 text-xs text-gray-600">{product.business}</div>

				<div className="mb-2 flex items-center text-xs text-gray-500">
					<MapPin className="mr-1 h-3 w-3" />
					{product.location}
				</div>

				<div className="mb-3 flex items-baseline gap-2">
					{typeof product.discountedPrice === 'number' && typeof product.discountPercentage === 'number' ? (
						<>
							<span className="text-lg font-bold text-gray-900">${product.discountedPrice.toFixed(2)}</span>
							<span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
							<span className="text-xs font-medium text-green-600">-{product.discountPercentage}%</span>
						</>
					) : (
						<span className="text-lg font-bold text-gray-900">${product.originalPrice.toFixed(2)}</span>
					)}
				</div>

				<Button
					size="sm"
					className="w-full bg-green-600 hover:bg-green-700"
					onClick={() => window.open(product.affiliateLink, '_blank')}
				>
					<ExternalLink className="mr-1 h-3 w-3" />
					View Deal
				</Button>
			</div>
		</div>
	);
}
