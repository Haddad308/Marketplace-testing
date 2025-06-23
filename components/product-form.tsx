'use client';

import type React from 'react';

import { DollarSign, ExternalLink, MapPin, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { createProduct, updateProduct } from '@/firebase/merchantServices';
import { toast } from '@/hooks/use-toast';
import type { Product, ProductFormData } from '@/types';

const categories = [
	'Beauty & Spas',
	'Things To Do',
	'Auto & Home',
	'Food & Drink',
	'Gifts',
	'Local',
	'Travel',
	'Goods',
	'Coupons',
];

interface ProductFormProps {
	mode: 'create' | 'edit';
	initialData?: Product;
}

export default function ProductForm({ mode, initialData }: ProductFormProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

	const [formData, setFormData] = useState<ProductFormData>({
		title: initialData?.title || '',
		business: initialData?.business || '',
		category: initialData?.category || '',
		image: initialData?.image || null,
		originalPrice: initialData?.originalPrice || 0,
		discountedPrice: initialData?.discountedPrice || 0,
		location: initialData?.location || '',
		distance: initialData?.distance || '',
		redirectLink: initialData?.redirectLink || '',
		badge: initialData?.badge || '',
		discountPercentage: initialData?.discountPercentage || 0,
	});

	const handleInputChange = (field: keyof ProductFormData, value: string | number | File | null) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setFormData((prev) => ({ ...prev, image: null }));
		setImagePreview(null);
	};

	const calculateDiscount = () => {
		if (formData.originalPrice > 0 && formData.discountedPrice > 0) {
			return Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100);
		}
		return 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.image) {
			toast.error('Product image is required');
			return;
		}

		if (!user) {
			toast.error('Error', 'You must be logged in to save a product');
			return;
		}

		// Check permissions
		const requiredPermission = mode === 'create' ? 'add' : 'edit';
		if (!user.permissions?.includes(requiredPermission)) {
			toast.error('Access Denied', `You don't have permission to ${mode} products`);
			return;
		}

		// Validation
		if (!formData.title || !formData.business || !formData.category) {
			toast.error('Error', 'Please fill in all required fields');
			return;
		}

		if (formData.originalPrice <= 0 || formData.discountedPrice <= 0) {
			toast.error('Error', 'Please enter valid prices');
			return;
		}

		if (formData.discountedPrice >= formData.originalPrice) {
			toast.error('Error', 'Discounted price must be less than original price');
			return;
		}

		if (!formData.redirectLink) {
			toast.error('Error', 'Please provide a redirect link');
			return;
		}

		try {
			setIsSubmitting(true);

			if (mode === 'create') {
				await createProduct(user.uid, formData);
				toast.success('Success', 'Product created successfully!');
			} else if (mode === 'edit' && initialData) {
				await updateProduct(initialData.id, formData);
				toast.success('Success', 'Product updated successfully!');
			}

			router.push('/merchant/manage-products');
		} catch (error) {
			console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} product:`, error);
			toast.error('Error', `Failed to ${mode === 'create' ? 'create' : 'update'} product. Please try again.`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Basic Information */}
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="title" className="text-gray-300">
						Product Title *
					</Label>
					<Input
						id="title"
						placeholder="e.g., 60-Minute Deep Tissue Massage"
						value={formData.title}
						onChange={(e) => handleInputChange('title', e.target.value)}
						className="border-gray-600 bg-gray-700 text-white placeholder-gray-400"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="business" className="text-gray-300">
						Business Name *
					</Label>
					<Input
						id="business"
						placeholder="e.g., Relaxation Spa & Wellness"
						value={formData.business}
						onChange={(e) => handleInputChange('business', e.target.value)}
						className="border-gray-600 bg-gray-700 text-white placeholder-gray-400"
						required
					/>
				</div>
			</div>

			{/* Category and Badge */}
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="category" className="text-gray-300">
						Category *
					</Label>
					<Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
						<SelectTrigger className="border-gray-600 bg-gray-700 text-white">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="badge" className="text-gray-300">
						Badge (Optional)
					</Label>
					<Input
						id="badge"
						placeholder="e.g., Popular, New, Limited Time"
						value={formData.badge}
						onChange={(e) => handleInputChange('badge', e.target.value)}
						className="border-gray-600 bg-gray-700 text-white placeholder-gray-400"
					/>
				</div>
			</div>

			{/* Pricing */}
			<div className="grid gap-6 md:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="originalPrice" className="text-gray-300">
						Original Price * ($)
					</Label>
					<div className="relative">
						<DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							id="originalPrice"
							type="number"
							step="0.01"
							min="0"
							placeholder="100.00"
							value={formData.originalPrice || ''}
							onChange={(e) => handleInputChange('originalPrice', Number.parseFloat(e.target.value) || 0)}
							className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="discountedPrice" className="text-gray-300">
						Discounted Price * ($)
					</Label>
					<div className="relative">
						<DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							id="discountedPrice"
							type="number"
							step="0.01"
							min="0"
							placeholder="50.00"
							value={formData.discountedPrice || ''}
							onChange={(e) => handleInputChange('discountedPrice', Number.parseFloat(e.target.value) || 0)}
							className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label className="text-gray-300">Discount Percentage</Label>
					<div className="flex h-10 items-center rounded-md border border-gray-600 bg-gray-700 px-3">
						<span className="font-medium text-green-400">{calculateDiscount()}% OFF</span>
					</div>
				</div>
			</div>

			{/* Location */}
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="location" className="text-gray-300">
						Location *
					</Label>
					<div className="relative">
						<MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							id="location"
							placeholder="e.g., Downtown Chicago"
							value={formData.location}
							onChange={(e) => handleInputChange('location', e.target.value)}
							className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="distance" className="text-gray-300">
						Distance (Optional)
					</Label>
					<Input
						id="distance"
						placeholder="e.g., 2.5 miles"
						value={formData.distance}
						onChange={(e) => handleInputChange('distance', e.target.value)}
						className="border-gray-600 bg-gray-700 text-white placeholder-gray-400"
					/>
				</div>
			</div>

			{/* Redirect Link */}
			<div className="space-y-2">
				<Label htmlFor="redirectLink" className="text-gray-300">
					Booking/Purchase Link *
				</Label>
				<div className="relative">
					<ExternalLink className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
					<Input
						id="redirectLink"
						type="url"
						placeholder="https://your-booking-site.com/product"
						value={formData.redirectLink}
						onChange={(e) => handleInputChange('redirectLink', e.target.value)}
						className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
						required
					/>
				</div>
				<p className="text-xs text-gray-400">
					This is where customers will be redirected when they click &quot;View Deal&quot;
				</p>
			</div>

			{/* Image Upload */}
			<div className="space-y-2">
				<Label className="text-gray-300">Product Image *</Label>
				<div className="rounded-lg border-2 border-dashed border-gray-600 p-6">
					{imagePreview ? (
						<div className="relative">
							<img src={imagePreview || '/placeholder.svg'} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
							<Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2" onClick={removeImage}>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<div className="text-center">
							<Upload className="mx-auto h-12 w-12 text-gray-400" />
							<div className="mt-4">
								<label htmlFor="image-upload" className="cursor-pointer">
									<span className="mt-2 block text-sm font-medium text-gray-300">Click to upload an image</span>
									<span className="mt-1 block text-xs text-gray-400">PNG, JPG, GIF up to 10MB</span>
								</label>
								<input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end space-x-4 pt-6">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push('/merchant/manage-products')}
					className="border-gray-600 text-gray-300 hover:bg-gray-700"
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700">
					{isSubmitting ? (
						<>
							<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							{mode === 'create' ? 'Creating...' : 'Updating...'}
						</>
					) : mode === 'create' ? (
						'Create Product'
					) : (
						'Update Product'
					)}
				</Button>
			</div>
		</form>
	);
}
