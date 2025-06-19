'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ProductForm from '@/components/product-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { getProductById } from '@/firebase/productServices';
import type { Product } from '@/types';

export default function EditProductPage() {
	const { user } = useAuth();
	const params = useParams();
	const productId = params.id as string;
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (user && productId) {
			fetchProduct();
		}
	}, [user, productId]);

	const fetchProduct = async () => {
		try {
			setLoading(true);
			const productData = await getProductById(productId);

			if (!productData) {
				setError('Product not found');
				return;
			}

			// Check if the current user owns this product
			if (productData.merchantId !== user?.uid) {
				setError('You are not authorized to edit this product');
				return;
			}

			setProduct(productData);
		} catch (error) {
			console.error('Error fetching product:', error);
			setError('Failed to load product data');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl">
				<Card className="border-gray-700 bg-gray-800">
					<CardContent className="p-6">
						<div className="animate-pulse space-y-6">
							<div className="h-8 w-48 rounded bg-gray-700"></div>
							<div className="grid gap-6 md:grid-cols-2">
								<div className="h-10 rounded bg-gray-700"></div>
								<div className="h-10 rounded bg-gray-700"></div>
							</div>
							<div className="h-32 rounded bg-gray-700"></div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-4xl">
				<Card className="border-gray-700 bg-gray-800">
					<CardHeader>
						<CardTitle className="text-2xl text-red-400">Error</CardTitle>
						<CardDescription className="text-gray-400">{error}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!product) {
		return null;
	}

	return (
		<div className="mx-auto max-w-4xl">
			<Card className="border-gray-700 bg-gray-800">
				<CardHeader>
					<CardTitle className="text-2xl text-white">Edit Product</CardTitle>
					<CardDescription className="text-gray-400">
						Update your product listing. All fields marked with * are required.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProductForm mode="edit" initialData={product} />
				</CardContent>
			</Card>
		</div>
	);
}
