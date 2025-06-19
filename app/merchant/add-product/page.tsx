'use client';

import ProductForm from '@/components/product-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddProductPage() {
	return (
		<div className="mx-auto max-w-4xl">
			<Card className="border-gray-700 bg-gray-800">
				<CardHeader>
					<CardTitle className="text-2xl text-white">Add New Product</CardTitle>
					<CardDescription className="text-gray-400">
						Create a new product listing for your business. All fields marked with * are required.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProductForm mode="create" />
				</CardContent>
			</Card>
		</div>
	);
}
