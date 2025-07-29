'use client';

import type React from 'react';

import { DollarSign, ExternalLink, Phone, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationSearch } from '@/components/ui/location-search';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { createProduct, updateProduct } from '@/firebase/merchantServices';
import { toast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/constants';
import type { FormErrors, Product, ProductFormData, TouchedFields } from '@/types';
import { Textarea } from './ui/textarea';

const categories = CATEGORIES.map((cat) => cat.name);

interface ProductFormProps {
	mode: 'create' | 'edit';
	initialData?: Product;
	onProductCreated?: (productId: string) => void;
}

export default function ProductForm({ mode, initialData, onProductCreated }: ProductFormProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
	const [submitError, setSubmitError] = useState<string>('');

	const [formData, setFormData] = useState<ProductFormData>({
		title: initialData?.title || '',
		business: initialData?.business || '',
		category: initialData?.category || '',
		image: null,
		originalPrice: initialData?.originalPrice || 0,
		discountedPrice: initialData?.discountedPrice || undefined,
		location: initialData?.location || '',
		phone: initialData?.phone || '',
		description: initialData?.description || '',
		affiliateLink: initialData?.affiliateLink || '',
		badge: initialData?.badge || '',
	});

	// Validation functions
	const validateField = (field: keyof ProductFormData, value: unknown): string | undefined => {
		switch (field) {
			case 'title': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Product title is required';
				if (val.trim().length < 3) return 'Title must be at least 3 characters';
				if (val.trim().length > 100) return 'Title must be less than 100 characters';
				break;
			}
			case 'business': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Business name is required';
				if (val.trim().length < 2) return 'Business name must be at least 2 characters';
				if (val.trim().length > 80) return 'Business name must be less than 80 characters';
				break;
			}
			case 'category': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Category is required';
				break;
			}
			case 'image': {
				if (mode === 'create' && !value && !imagePreview) return 'Product image is required';
				break;
			}
			case 'originalPrice': {
				const val = typeof value === 'number' ? value : 0;
				if (!val || val <= 0) return 'Original price must be greater than 0';
				if (val > 999999) return 'Price cannot exceed $999,999';
				break;
			}
			case 'discountedPrice': {
				if (value !== undefined && value !== null && value !== '') {
					const val = typeof value === 'number' ? value : 0;
					if (val <= 0) return 'Discounted price must be greater than 0';
					if (val >= formData.originalPrice) return 'Discounted price must be less than original price';
					if (val > 999999) return 'Price cannot exceed $999,999';
				}
				break;
			}
			case 'location': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Location is required';
				break;
			}
			case 'phone': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Phone number is required';
				const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
				const cleanPhone = val.replace(/[\s\-$.]/g, '');
				if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 10) return 'Please enter a valid phone number';
				break;
			}
			case 'description': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Product description is required';
				if (val.trim().length < 10) return 'Description must be at least 10 characters';
				if (val.trim().length > 1000) return 'Description must be less than 1000 characters';
				break;
			}
			case 'affiliateLink': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Affiliate link is required';
				try {
					new URL(val);
				} catch {
					return 'Please enter a valid URL';
				}
				break;
			}
		}
		return undefined;
	};

	const [errors, setErrors] = useState<FormErrors>(() => {
		const initialErrors: FormErrors = {};
		Object.keys(formData).forEach((key) => {
			const field = key as keyof ProductFormData;
			const error = validateField(field, formData[field]);
			if (error) {
				initialErrors[field as keyof FormErrors] = error;
			}
		});
		return initialErrors;
	});

	const [touched, setTouched] = useState<TouchedFields>({
		title: false,
		business: false,
		category: false,
		image: false,
		originalPrice: false,
		discountedPrice: false,
		location: false,
		phone: false,
		description: false,
		affiliateLink: false,
	});

	// Validate all fields
	const validateForm = (): FormErrors => {
		const newErrors: FormErrors = {};

		Object.keys(formData).forEach((key) => {
			const field = key as keyof ProductFormData;
			// Only add errors for fields that exist in FormErrors
			if (field in errors) {
				const error = validateField(field, formData[field]);
				if (error) {
					newErrors[field as keyof FormErrors] = error;
				}
			}
		});

		return newErrors;
	};

	// Check if form has errors
	const hasErrors = (): boolean => {
		const currentErrors = validateForm();
		return Object.keys(currentErrors).length > 0;
	};

	// Handle field changes
	const handleInputChange = (field: keyof ProductFormData, value: string | number | File | null) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear submit error when user starts typing
		if (submitError) {
			setSubmitError('');
		}

		// Validate field if it's been touched
		if (field in touched && touched[field as keyof TouchedFields]) {
			const error = validateField(field, value);
			setErrors((prev) => ({
				...prev,
				[field]: error,
			}));
		}
	};

	// Handle field blur (mark as touched)
	const handleFieldBlur = (field: keyof TouchedFields) => {
		setTouched((prev) => ({
			...prev,
			[field]: true,
		}));

		// Validate field when it loses focus
		const error = validateField(field, formData[field]);
		setErrors((prev) => ({
			...prev,
			[field]: error,
		}));
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				setErrors((prev) => ({
					...prev,
					image: 'Image size must be less than 10MB',
				}));
				return;
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				setErrors((prev) => ({
					...prev,
					image: 'Please select a valid image file',
				}));
				return;
			}

			setFormData((prev) => ({ ...prev, image: file }));
			setErrors((prev) => ({
				...prev,
				image: undefined,
			}));

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
		setImagePreview(mode === 'edit' ? initialData?.image || null : null);

		if (mode === 'create') {
			setErrors((prev) => ({
				...prev,
				image: 'Product image is required',
			}));
		}
	};

	const calculateDiscount = () => {
		if (
			formData.originalPrice > 0 &&
			formData.discountedPrice !== null &&
			formData.discountedPrice !== undefined &&
			formData.discountedPrice > 0
		) {
			return Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100);
		}
		return 0;
	};

	// Update discount percentage when prices change
	useEffect(() => {
		const discount = calculateDiscount();
		setFormData((prev) => ({
			...prev,
			discountPercentage: discount,
		}));
	}, [formData.originalPrice, formData.discountedPrice]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError('');

		if (!user) {
			setSubmitError('You must be logged in to save a product');
			return;
		}

		// Check permissions
		const requiredPermission = mode === 'create' ? 'add' : 'edit';
		if (!user.permissions?.includes(requiredPermission)) {
			setSubmitError(`You don't have permission to ${mode} products`);
			return;
		}

		// Mark all fields as touched
		const allTouched = Object.keys(touched).reduce((acc, key) => {
			acc[key as keyof TouchedFields] = true;
			return acc;
		}, {} as TouchedFields);
		setTouched(allTouched);

		// Validate form
		const formErrors = validateForm();
		setErrors(formErrors);

		if (Object.keys(formErrors).length > 0) {
			setSubmitError('Please fix the errors above before submitting');
			return;
		}

		try {
			setIsSubmitting(true);

			if (mode === 'create') {
				const productId = await createProduct(user.uid, formData);
				toast.success('Product created successfully!');
				
				// Call the callback with the created product ID
				if (onProductCreated) {
					onProductCreated(productId);
					// Don't redirect automatically - let the user configure action buttons first
					return;
				}
			} else if (mode === 'edit' && initialData) {
				await updateProduct(initialData.id, formData);
				toast.success('Product updated successfully!');
			}

			router.push('/merchant/manage-products');
		} catch (error) {
			console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} product:`, error);
			setSubmitError(`Failed to ${mode === 'create' ? 'create' : 'update'} product. Please try again.`);
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
						onBlur={() => handleFieldBlur('title')}
						className={`border-gray-600 bg-gray-700 text-white placeholder-gray-400 ${errors.title && touched.title ? 'border-red-500' : ''}`}
					/>
					{errors.title && touched.title && <span className="text-sm text-red-400">{errors.title}</span>}
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
						onBlur={() => handleFieldBlur('business')}
						className={`border-gray-600 bg-gray-700 text-white placeholder-gray-400 ${
							errors.business && touched.business ? 'border-red-500' : ''
						}`}
					/>
					{errors.business && touched.business && <span className="text-sm text-red-400">{errors.business}</span>}
				</div>
			</div>

			{/* Category and Badge */}
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="category" className="text-gray-300">
						Category *
					</Label>

					<Select
						value={formData.category}
						onValueChange={(value) => {
							handleInputChange('category', value);
						}}
					>
						<div onBlur={() => handleFieldBlur('category')}>
							<SelectTrigger
								className={`border-gray-600 bg-gray-700 text-white ${errors.category && touched.category ? 'border-red-500' : ''}`}
							>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
						</div>

						<SelectContent>
							{categories.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.category && touched.category && <span className="text-sm text-red-400">{errors.category}</span>}
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
							min="0"
							placeholder="100.00"
							value={formData.originalPrice || ''}
							onChange={(e) => handleInputChange('originalPrice', Number.parseFloat(e.target.value) || 0)}
							onBlur={() => handleFieldBlur('originalPrice')}
							className={`[appearance:textfield] border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
								errors.originalPrice && touched.originalPrice ? 'border-red-500' : ''
							}`}
						/>
					</div>
					{errors.originalPrice && touched.originalPrice && (
						<span className="text-sm text-red-400">{errors.originalPrice}</span>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="discountedPrice" className="text-gray-300">
						Discounted Price (Optional) ($)
					</Label>
					<div className="relative">
						<DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							id="discountedPrice"
							type="number"
							min="0"
							placeholder="50.00"
							value={formData.discountedPrice || ''}
							onChange={(e) => {
								const value = e.target.value === '' ? null : Number.parseFloat(e.target.value) || 0;
								handleInputChange('discountedPrice', value);
							}}
							onBlur={() => handleFieldBlur('discountedPrice')}
							className={`[appearance:textfield] border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
								errors.discountedPrice && touched.discountedPrice ? 'border-red-500' : ''
							}`}
						/>
					</div>
					{errors.discountedPrice && touched.discountedPrice && (
						<span className="text-sm text-red-400">{errors.discountedPrice}</span>
					)}
				</div>

				<div className="space-y-2">
					<Label className="text-gray-300">Discount Percentage</Label>
					<div className="flex h-10 items-center rounded-md border border-gray-600 bg-gray-700 px-3">
						<span className="font-medium text-green-400">
							{calculateDiscount() > 0 ? `${calculateDiscount()}% OFF` : 'No discount'}
						</span>
					</div>
				</div>
			</div>

			{/* Location and Phone */}
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label className="text-gray-300">Location *</Label>
					<LocationSearch
						value={formData.location}
						onValueChange={(value) => {
							handleInputChange('location', value);
						}}
						onBlur={() => handleFieldBlur('location')}
						placeholder="Select location..."
						error={!!errors.location && touched.location}
					/>
					{errors.location && touched.location && <span className="text-sm text-red-400">{errors.location}</span>}
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone" className="text-gray-300">
						Phone Number *
					</Label>
					<div className="relative">
						<Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							id="phone"
							type="tel"
							placeholder="(555) 123-4567"
							value={formData.phone}
							onChange={(e) => handleInputChange('phone', e.target.value)}
							onBlur={() => handleFieldBlur('phone')}
							className={`border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400 ${
								errors.phone && touched.phone ? 'border-red-500' : ''
							}`}
						/>
					</div>
					{errors.phone && touched.phone && <span className="text-sm text-red-400">{errors.phone}</span>}
				</div>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="description" className="text-gray-300">
					Product Description *
				</Label>
				<Textarea
					id="description"
					placeholder="Describe your product in detail..."
					value={formData.description}
					onChange={(e) => handleInputChange('description', e.target.value)}
					onBlur={() => handleFieldBlur('description')}
					rows={4}
					className={`resize-none border-gray-600 bg-gray-700 text-white placeholder-gray-400 ${
						errors.description && touched.description ? 'border-red-500' : ''
					}`}
				/>
				<div className="flex justify-between text-xs text-gray-400">
					<span>{formData.description.length}/1000 characters</span>
				</div>
				{errors.description && touched.description && <span className="text-sm text-red-400">{errors.description}</span>}
			</div>

			{/* Affiliate Link */}
			<div className="space-y-2">
				<Label htmlFor="affiliateLink" className="text-gray-300">
					Affiliate Link *
				</Label>
				<div className="relative">
					<ExternalLink className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
					<Input
						id="affiliateLink"
						type="url"
						placeholder="https://your-affiliate-link.com"
						value={formData.affiliateLink}
						onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
						onBlur={() => handleFieldBlur('affiliateLink')}
						className={`border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400 ${
							errors.affiliateLink && touched.affiliateLink ? 'border-red-500' : ''
						}`}
					/>
				</div>
				<p className="text-xs text-gray-400">
					This is where customers will be redirected when they click &quot;View Deal&quot;
				</p>
				{errors.affiliateLink && touched.affiliateLink && (
					<span className="text-sm text-red-400">{errors.affiliateLink}</span>
				)}
			</div>

			{/* Image Upload */}
			<div className="space-y-2">
				<Label className="text-gray-300">Product Image {mode === 'create' ? '*' : ''}</Label>
				<div
					className={`rounded-lg border-2 border-dashed border-gray-600 p-6 ${errors.image && touched.image ? 'border-red-500' : ''}`}
				>
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
				{errors.image && touched.image && <span className="text-sm text-red-400">{errors.image}</span>}
			</div>

			{/* Submit Error */}
			{submitError && (
				<div className="rounded-md border border-red-500 bg-red-900/20 p-3">
					<span className="text-sm text-red-400">{submitError}</span>
				</div>
			)}

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
				<Button
					type="submit"
					disabled={isSubmitting || hasErrors()}
					className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
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
