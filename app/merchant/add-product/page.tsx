'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ActionButtonManager from '@/components/ActionButtonManager';
import ProductForm from '@/components/product-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddProductPage() {
	const router = useRouter();
	const [createdProductId, setCreatedProductId] = useState<string | null>(null);

	const handleProductCreated = (productId: string) => {
		setCreatedProductId(productId);
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<Card className="border-gray-700 bg-gray-800">
				<CardHeader>
					<CardTitle className="text-2xl text-white">
						{createdProductId ? 'Product Created Successfully!' : 'Add New Product'}
					</CardTitle>
					<CardDescription className="text-gray-400">
						{createdProductId 
							? 'Your product has been created. You can now configure action buttons below or skip this step.'
							: 'Create a new product listing for your business. All fields marked with * are required.'
						}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!createdProductId ? (
						<ProductForm mode="create" onProductCreated={handleProductCreated} />
					) : (
						<div className="flex justify-center">
							<Button 
								onClick={() => router.push('/merchant/manage-products')}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Go to Manage Products
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
			
			{/* Action Buttons Management - Show after product is created */}
			{createdProductId && (
				<ActionButtonManager productId={createdProductId} />
			)}
		</div>
	);
}
