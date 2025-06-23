import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { deleteProduct } from '@/firebase/merchantServices';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { Dispatch, SetStateAction } from 'react';

type props = {
	product: Product;
	setProducts: Dispatch<SetStateAction<Product[]>>;
};

const MerchantProductCard = ({ product, setProducts }: props) => {
	const { user } = useAuth();

	const handleDeleteProduct = async (productId: string, productTitle: string) => {
		try {
			// Check permissions
			if (!user?.permissions?.includes('delete')) {
				toast.error('Access Denied', `You don't have permission to delete products`);
				return;
			}

			await deleteProduct(productId);
			setProducts((prev) => prev.filter((p) => p.id !== productId));
			toast.success('Success', `"${productTitle}" has been deleted`);
		} catch (error) {
			console.error('Error deleting product:', error);
			toast.error('Error', 'Failed to delete product');
		}
	};
	return (
		<Card className="border-gray-700 bg-gray-800 transition-colors hover:border-gray-600">
			<CardContent className="p-0">
				{/* Image */}
				<div className="relative h-48 w-full">
					<Image
						src={product.image || '/placeholder.svg?height=200&width=300'}
						alt={product.title}
						fill
						className="rounded-t-lg object-cover"
					/>
					{product.badge && <Badge className="absolute top-2 left-2 bg-blue-600">{product.badge}</Badge>}
					<div className="absolute top-2 right-2 flex space-x-1">
						<Button
							size="sm"
							variant="secondary"
							className="h-8 w-8 p-0"
							onClick={() => window.open(product.redirectLink, '_blank')}
						>
							<ExternalLink className="h-3 w-3" />
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="space-y-3 p-4">
					<div>
						<Badge variant="outline" className="border-gray-600 text-xs text-gray-300">
							{product.category}
						</Badge>
					</div>

					<div>
						<h3 title={product.title} className="mb-1 line-clamp-1 font-semibold text-white">
							{product.title}
						</h3>
						<p className="text-sm text-gray-400">{product.business}</p>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center space-x-2">
								<span className="text-lg font-bold text-white">${product.discountedPrice}</span>
								<span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
							</div>
							<span className="text-xs text-green-400">-{product.discountPercentage}% OFF</span>
						</div>
						<div className="text-right">
							<div className="flex items-center text-sm text-yellow-400">⭐ {product.rating || 'N/A'}</div>
							<div className="text-xs text-gray-400">{product.reviewCount || 0} reviews</div>
						</div>
					</div>

					<div className="flex items-center space-x-2 pt-2">
						{user?.permissions?.includes('edit') ? (
							<Link
								href={`/merchant/edit-product/${product.id}`}
								className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
							>
								<Button size="sm" variant="outline" className="w-full">
									<Edit className="mr-1 h-3 w-3" />
									Edit
								</Button>
							</Link>
						) : (
							<Button size="sm" variant="outline" disabled className="flex-1 border-gray-600 text-gray-500">
								<Edit className="mr-1 h-3 w-3" />
								Edit
							</Button>
						)}
						{user?.permissions?.includes('delete') ? (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button size="sm" variant="destructive" className="flex-1 bg-red-600 text-white hover:bg-red-700">
										<Trash2 className="mr-1 h-3 w-3" />
										Delete
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className="border-gray-700 bg-gray-800">
									<AlertDialogHeader>
										<AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
										<AlertDialogDescription className="text-gray-400">
											Are you sure you want to delete &quot;{product.title}&quot;? This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => handleDeleteProduct(product.id, product.title)}
											className="bg-red-600 hover:bg-red-700"
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						) : (
							<Button size="sm" variant="outline" disabled className="flex-1 border-gray-600 text-gray-500">
								<Trash2 className="mr-1 h-3 w-3" />
								Delete
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default MerchantProductCard;
