'use client';

import { Save, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { getMerchantDetails, createMerchantDetails, updateMerchantDetails } from '@/firebase/merchantDetailsServices';
import { toast } from '@/hooks/use-toast';
import type { MerchantDetails } from '@/types';

export default function MerchantDetailsManager() {
	const { user } = useAuth();
	const [merchantDetails, setMerchantDetails] = useState<MerchantDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		address: '',
		phone: '',
		email: '',
		website: '',
	});

	useEffect(() => {
		const fetchDetails = async () => {
			if (!user) return;

			try {
				const details = await getMerchantDetails(user.uid);
				setMerchantDetails(details);
				
				if (details) {
					setFormData({
						name: details.name || '',
						description: details.description || '',
						address: details.address || '',
						phone: details.phone || '',
						email: details.email || '',
						website: details.website || '',
					});
				} else {
					// Pre-fill with user data if available
					setFormData({
						name: user.displayName || '',
						description: '',
						address: '',
						phone: '',
						email: user.email || '',
						website: '',
					});
					setIsEditing(true); // Start in editing mode if no details exist
				}
			} catch (error) {
				console.error('Error fetching merchant details:', error);
				toast.error('Failed to fetch merchant details');
			} finally {
				setLoading(false);
			}
		};

		fetchDetails();
	}, [user]);

	const fetchMerchantDetails = async () => {
		if (!user) return;

		try {
			const details = await getMerchantDetails(user.uid);
			setMerchantDetails(details);
			
			if (details) {
				setFormData({
					name: details.name || '',
					description: details.description || '',
					address: details.address || '',
					phone: details.phone || '',
					email: details.email || '',
					website: details.website || '',
				});
			} else {
				// Pre-fill with user data if available
				setFormData({
					name: user.displayName || '',
					description: '',
					address: '',
					phone: '',
					email: user.email || '',
					website: '',
				});
				setIsEditing(true); // Start in editing mode if no details exist
			}
		} catch (error) {
			console.error('Error fetching merchant details:', error);
			toast.error('Failed to fetch merchant details');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!user) return;

		if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		try {
			if (merchantDetails) {
				await updateMerchantDetails(user.uid, formData);
				toast.success('Merchant details updated successfully');
			} else {
				await createMerchantDetails(user.uid, formData);
				toast.success('Merchant details created successfully');
			}
			
			fetchMerchantDetails();
			setIsEditing(false);
		} catch (error) {
			console.error('Error saving merchant details:', error);
			toast.error('Failed to save merchant details');
		}
	};

	const handleCancel = () => {
		if (merchantDetails) {
			setFormData({
				name: merchantDetails.name || '',
				description: merchantDetails.description || '',
				address: merchantDetails.address || '',
				phone: merchantDetails.phone || '',
				email: merchantDetails.email || '',
				website: merchantDetails.website || '',
			});
			setIsEditing(false);
		}
	};

	if (loading) {
		return (
			<Card className="border-gray-700 bg-gray-800">
				<CardHeader>
					<CardTitle className="text-white">Merchant Details</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4 text-gray-400">Loading...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-gray-700 bg-gray-800">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-white">
					{merchantDetails ? 'Merchant Details' : 'Set Up Your Merchant Profile'}
				</CardTitle>
				{!isEditing && merchantDetails && (
					<Button 
						onClick={() => setIsEditing(true)}
						size="sm"
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
					>
						<Edit className="h-4 w-4" />
						Edit
					</Button>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				{isEditing ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name" className="text-gray-300">Business Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="Your business name"
									className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
								/>
							</div>
							
							<div>
								<Label htmlFor="email" className="text-gray-300">Contact Email *</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									placeholder="contact@yourbusiness.com"
									className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
								/>
							</div>
							
							<div>
								<Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									placeholder="+1 (555) 123-4567"
									className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
								/>
							</div>
							
							<div>
								<Label htmlFor="website" className="text-gray-300">Website (Optional)</Label>
								<Input
									id="website"
									value={formData.website}
									onChange={(e) => setFormData({ ...formData, website: e.target.value })}
									placeholder="https://yourbusiness.com"
									className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
								/>
							</div>
						</div>
						
						<div>
							<Label htmlFor="address" className="text-gray-300">Address</Label>
							<Input
								id="address"
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								placeholder="123 Business St, City, State 12345"
								className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
							/>
						</div>
						
						<div>
							<Label htmlFor="description" className="text-gray-300">Business Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Tell customers about your business..."
								rows={4}
								className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
							/>
						</div>
						
						<div className="flex gap-2 pt-4">
							<Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
								<Save className="h-4 w-4" />
								{merchantDetails ? 'Update' : 'Create'} Details
							</Button>
							{merchantDetails && (
								<Button variant="outline" onClick={handleCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
									<X className="h-4 w-4 mr-2" />
									Cancel
								</Button>
							)}
						</div>
					</>
				) : merchantDetails ? (
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label className="text-sm font-medium text-gray-400">Business Name</Label>
								<p className="text-white">{merchantDetails.name}</p>
							</div>
							
							<div>
								<Label className="text-sm font-medium text-gray-400">Contact Email</Label>
								<p className="text-white">{merchantDetails.email}</p>
							</div>
							
							<div>
								<Label className="text-sm font-medium text-gray-400">Phone Number</Label>
								<p className="text-white">{merchantDetails.phone}</p>
							</div>
							
							{merchantDetails.website && (
								<div>
									<Label className="text-sm font-medium text-gray-400">Website</Label>
									<a 
										href={merchantDetails.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-400 hover:text-blue-300 hover:underline"
									>
										{merchantDetails.website}
									</a>
								</div>
							)}
						</div>
						
						{merchantDetails.address && (
							<div>
								<Label className="text-sm font-medium text-gray-400">Address</Label>
								<p className="text-white">{merchantDetails.address}</p>
							</div>
						)}
						
						{merchantDetails.description && (
							<div>
								<Label className="text-sm font-medium text-gray-400">Business Description</Label>
								<p className="text-gray-300 leading-relaxed">{merchantDetails.description}</p>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-8 text-gray-400">
						<p>No merchant details found. Please set up your merchant profile to help customers learn more about your business.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
