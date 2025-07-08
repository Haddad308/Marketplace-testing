import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { adService } from '@/firebase/adServices';
import { toast } from '@/hooks/use-toast';
import { Ad, AdFormData, AdFormErrors, AdTouchedFields } from '@/types';
import { useState } from 'react';

type props = {
	setDialogOpen: (open: boolean) => void;
	fetchAds: () => Promise<void>;
	editingAd?: Ad | null;
	setEditingAd: React.Dispatch<React.SetStateAction<Ad | null>>;
};

const AdForm = ({ setDialogOpen, fetchAds, editingAd, setEditingAd }: props) => {
	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState<AdFormData>({
		title: editingAd?.title || '',
		description: editingAd?.description || '',
		image: editingAd?.image || null,
		affiliateLink: editingAd?.affiliateLink || '',
		position: editingAd?.position || 1,
		isActive: editingAd?.isActive || true,
	});

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
				if (val.trim().length > 150) return 'Description must be less than 150 characters';
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

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));
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
			setSubmitError(
				editingAd
					? `Failed to update ad: ${error instanceof Error ? error.message : 'Unknown error'}`
					: `Failed to create ad: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setSubmitting(false);
		}
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

	return (
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
					<span>{formData.description.length}/150 characters</span>
				</div>
				{errors.description && touched.description && <span className="text-sm text-red-400">{errors.description}</span>}
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
	);
};

export default AdForm;
