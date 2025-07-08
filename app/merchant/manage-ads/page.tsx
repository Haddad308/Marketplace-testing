'use client';

import type React from 'react';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { adService } from '@/firebase/adServices';
import { toast } from '@/hooks/use-toast';
import { Ad, AdFormData, AdFormErrors, AdTouchedFields } from '@/types';
import { Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManageAdsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [ads, setAds] = useState<Ad[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAd, setEditingAd] = useState<Ad | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState<AdFormData>({
		title: '',
		description: '',
		image: null,
		affiliateLink: '',
		position: 1,
		isActive: true,
	});

	// Check if user is admin
	useEffect(() => {
		if (user && user.role !== 'admin') {
			router.push('/merchant/dashboard');
			return;
		}
	}, [user, router]);

	// Fetch ads
	useEffect(() => {
		fetchAds();
	}, []);

	const fetchAds = async () => {
		try {
			const adsData = await adService.getAds();
			setAds(adsData);
		} catch (error) {
			toast.error('Failed to fetch ads');
		} finally {
			setLoading(false);
		}
	};

	// Validation functions
	const validateField = (field: keyof AdFormData, value: unknown): string | undefined => {
		switch (field) {
			case 'title': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Product title is required';
				if (val.trim().length < 3) return 'Title must be at least 3 characters';
				if (val.trim().length > 100) return 'Title must be less than 100 characters';
				break;
			}

			case 'description': {
				const val = typeof value === 'string' ? value : '';
				if (!val.trim()) return 'Product description is required';
				if (val.trim().length < 10) return 'Description must be at least 10 characters';
				if (val.trim().length > 1000) return 'Description must be less than 1000 characters';
				break;
			}
			case 'image': {
				if (!value) return 'Image is required';
				if (typeof value === 'string' && !value.startsWith('http')) {
					return 'Please upload a valid image file';
				}
				if (value instanceof File && !value.type.startsWith('image/')) {
					return 'Please upload a valid image file';
				}
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

	const [errors, setErrors] = useState<AdFormErrors>(() => {
		const initialErrors: AdFormErrors = {};
		Object.keys(formData).forEach((key) => {
			const field = key as keyof AdFormData;
			const error = validateField(field, formData[field]);
			if (error) {
				initialErrors[field as keyof AdFormErrors] = error;
			}
		});
		return initialErrors;
	});

	const [submitError, setSubmitError] = useState<string>('');

	const [touched, setTouched] = useState<AdTouchedFields>({
		title: false,
		image: false,
		description: false,
		affiliateLink: false,
	});

	console.dir(errors);
	console.dir(touched);

	// Validate all fields
	const validateForm = (): AdFormErrors => {
		const newErrors: AdFormErrors = {};

		Object.keys(formData).forEach((key) => {
			const field = key as keyof AdFormData;
			// Only add errors for fields that exist in AdFormErrors
			if (field in errors) {
				const error = validateField(field, formData[field]);
				if (error) {
					newErrors[field as keyof AdFormErrors] = error;
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
	const handleInputChange = (field: keyof AdFormData, value: string | null) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear submit error when user starts typing
		if (submitError) {
			setSubmitError('');
		}

		// Validate field if it's been touched
		if (field in touched && touched[field as keyof AdTouchedFields]) {
			const error = validateField(field, value);
			setErrors((prev) => ({
				...prev,
				[field]: error,
			}));
		}
	};

	// Handle field blur (mark as touched)
	const handleFieldBlur = (field: keyof AdTouchedFields) => {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError('');
		setSubmitting(true);

		if (!user) {
			setSubmitError('You must be logged in to save a product');
			return;
		}
		if (user.role !== 'admin') {
			setSubmitError('You do not have permission to manage ads');
			return;
		}

		// Mark all fields as touched
		const allTouched = Object.keys(touched).reduce((acc, key) => {
			acc[key as keyof AdTouchedFields] = true;
			return acc;
		}, {} as AdTouchedFields);
		setTouched(allTouched);

		// Validate form
		const formErrors = validateForm();
		setErrors(formErrors);

		if (Object.keys(formErrors).length > 0) {
			setSubmitError('Please fix the errors above before submitting');
			return;
		}

		try {
			if (editingAd) {
				await adService.updateAd(editingAd.id, formData);
				toast.success('Ad updated successfully');
			} else {
				await adService.createAd(formData);
				toast.success('Ad created successfully');
			}

			await fetchAds();
			resetForm();
			setDialogOpen(false);
		} catch (error) {
			setSubmitError(editingAd ? 'Failed to update ad' : 'Failed to create ad');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (ad: Ad) => {
		try {
			await adService.deleteAd(ad.id, ad.image);
			toast.success('Ad deleted successfully');
			await fetchAds();
		} catch (error) {
			toast.error('Failed to delete ad');
		}
	};

	const handleEdit = (ad: Ad) => {
		setEditingAd(ad);
		setFormData({
			title: ad.title,
			description: ad.description,
			image: ad.image,
			affiliateLink: ad.affiliateLink,
			position: ad.position,
			isActive: ad.isActive,
		});
		setDialogOpen(true);
	};

	const resetForm = () => {
		setEditingAd(null);

		setFormData({
			title: '',
			description: '',
			image: null,
			affiliateLink: '',
			position: 1,
			isActive: true,
		});

		setErrors(() => {
			const initialErrors: AdFormErrors = {};
			Object.keys(formData).forEach((key) => {
				const field = key as keyof AdFormData;
				const error = validateField(field, formData[field]);
				if (error) {
					initialErrors[field as keyof AdFormErrors] = error;
				}
			});
			return initialErrors;
		});

		setTouched({
			title: false,
			image: false,
			description: false,
			affiliateLink: false,
		});
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));
		}
	};

	if (user?.role !== 'admin') {
		return null;
	}

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-gray-400">Loading ads...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-100">Manage Ads</h1>
					<p className="text-gray-400">Manage promotional banners (2 spots available)</p>
				</div>

				<Dialog
					open={dialogOpen}
					onOpenChange={(open) => {
						if (!open) {
							resetForm();
						}
						setDialogOpen(open);
					}}
				>
					<DialogTrigger asChild>
						<Button
							disabled={ads.length >= 2}
							className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Plus className="h-4 w-4" />
							Add Ad
						</Button>
					</DialogTrigger>

					<DialogContent className="max-h-[100dvh] max-w-2xl overflow-y-scroll border-gray-600 bg-gray-800">
						<DialogHeader>
							<DialogTitle className="text-gray-100">{editingAd ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
						</DialogHeader>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="title" className="text-gray-200">
									Title *
								</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) => handleInputChange('title', e.target.value)}
									onBlur={() => handleFieldBlur('title')}
									className={`border-gray-600 bg-gray-700 text-white placeholder-gray-400 ${errors.title && touched.title ? 'border-red-500' : ''}`}
								/>
								{errors.title && touched.title && <span className="text-sm text-red-400">{errors.title}</span>}
							</div>

							<div>
								<Label htmlFor="description" className="text-gray-200">
									Description *
								</Label>
								<div onBlur={() => handleFieldBlur('description')}>
									<RichTextEditor
										value={formData.description}
										onChange={(value) => handleInputChange('description', value)}
										className={`border-gray-600 bg-gray-700 text-white placeholder-gray-400 ${
											errors.description && touched.description ? 'border-red-500' : ''
										}`}
										placeholder="Enter ad description with formatting..."
									/>
								</div>
								<div className="flex justify-between text-xs text-gray-400">
									<span>{formData.description.length}/1000 characters</span>
								</div>
								{errors.description && touched.description && (
									<span className="text-sm text-red-400">{errors.description}</span>
								)}
							</div>

							<div>
								<Label htmlFor="image" className="text-gray-200">
									Image {editingAd ? '' : '*'}
								</Label>
								<div>
									<Input
										id="image"
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										onBlur={() => handleFieldBlur('image')}
										className={`"border-gray-600 bg-gray-700 text-gray-100 ${errors.image && touched.image ? 'border-red-500' : ''}`}
									/>
									{errors.image && touched.image && <span className="text-sm text-red-400">{errors.image}</span>}
								</div>
							</div>

							<div>
								<Label htmlFor="affiliateLink" className="text-gray-200">
									Affiliate Link *
								</Label>
								<Input
									id="affiliateLink"
									type="url"
									placeholder="https://your-affiliate-link.com"
									value={formData.affiliateLink}
									onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
									onBlur={() => handleFieldBlur('affiliateLink')}
									className={`border-gray-600 bg-gray-700 text-white placeholder-gray-400 ${
										errors.affiliateLink && touched.affiliateLink ? 'border-red-500' : ''
									}`}
								/>
								{errors.affiliateLink && touched.affiliateLink && (
									<span className="text-sm text-red-400">{errors.affiliateLink}</span>
								)}
							</div>

							<div>
								<Label htmlFor="position" className="text-gray-200">
									Position
								</Label>
								<Select
									value={formData.position.toString()}
									onValueChange={(value) => setFormData((prev) => ({ ...prev, position: Number.parseInt(value) as 1 | 2 }))}
								>
									<SelectTrigger className="border-gray-600 bg-gray-700 text-gray-100">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="border-gray-600 bg-gray-700">
										<SelectItem value="1">Position 1 (Left)</SelectItem>
										<SelectItem value="2">Position 2 (Right)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center space-x-2">
								<Label htmlFor="isActive" className="text-gray-200">
									Inactive
								</Label>
								<Switch
									id="isActive"
									checked={formData.isActive}
									onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
								/>
								<Label htmlFor="isActive" className="text-gray-200">
									Active
								</Label>
							</div>

							{/* Submit Error */}
							{submitError && (
								<div className="rounded-md border border-red-500 bg-red-900/20 p-3">
									<span className="text-sm text-red-400">{submitError}</span>
								</div>
							)}

							<div className="flex justify-end space-x-2 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}
									className="border-gray-600 text-gray-300 hover:bg-gray-700"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={hasErrors() || submitting}
									className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{submitting ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{ads.length === 0 ? (
					<div className="col-span-2 py-12 text-center">
						<p className="text-gray-400">No ads created yet. Create your first ad to get started.</p>
					</div>
				) : (
					ads.map((ad) => (
						<Card key={ad.id} className="border-gray-600 bg-gray-800">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2 text-gray-100">
										{ad.title}
										{ad.isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
									</CardTitle>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEdit(ad)}
											className="border-gray-600 text-gray-300 hover:bg-gray-700"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-900/20">
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent className="border-gray-700 bg-gray-800">
												<AlertDialogHeader>
													<AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
													<AlertDialogDescription className="text-gray-400">
														Are you sure you want to delete &quot;{ad.title}&quot;? This action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
													<AlertDialogAction onClick={() => handleDelete(ad)} className="bg-red-600 hover:bg-red-700">
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{ad.image && (
										<div className="relative h-32 w-full overflow-hidden rounded-lg">
											<Image src={ad.image || '/placeholder.svg'} alt={ad.title} fill className="object-cover" />
										</div>
									)}

									<div className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: ad.description }} />

									<div className="text-xs text-gray-500">
										Position: {ad.position} | Status: {ad.isActive ? 'Active' : 'Inactive'}
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
