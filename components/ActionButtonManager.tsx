'use client';

import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProductActionButtons, saveActionButton, updateActionButton, deleteActionButton } from '@/firebase/merchantDetailsServices';
import { toast } from '@/hooks/use-toast';
import type { ActionButton } from '@/types';

interface ActionButtonManagerProps {
	productId: string;
}

type ButtonFormData = {
	label: string;
	url: string;
	style: ActionButton['style'];
	icon: string;
	order: number;
};

const iconOptions = [
	{ value: 'external', label: 'External Link' },
	{ value: 'phone', label: 'Phone' },
	{ value: 'calendar', label: 'Calendar' },
	{ value: 'mail', label: 'Mail' },
	{ value: 'map', label: 'Map' },
];

const styleOptions = [
	{ value: 'primary', label: 'Primary (Purple)' },
	{ value: 'secondary', label: 'Secondary (Gray)' },
	{ value: 'success', label: 'Success (Green)' },
	{ value: 'warning', label: 'Warning (Yellow)' },
	{ value: 'danger', label: 'Danger (Red)' },
];

export default function ActionButtonManager({ productId }: ActionButtonManagerProps) {
	const [buttons, setButtons] = useState<ActionButton[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [formData, setFormData] = useState<ButtonFormData>({
		label: '',
		url: '',
		style: 'primary',
		icon: 'external',
		order: 1,
	});

	useEffect(() => {
		const fetchButtonsAsync = async () => {
			try {
				const actionButtons = await getProductActionButtons(productId);
				setButtons(actionButtons);
			} catch (error) {
				console.error('Error fetching action buttons:', error);
				toast.error('Failed to fetch action buttons');
			} finally {
				setLoading(false);
			}
		};

		fetchButtonsAsync();
	}, [productId]);

	const fetchButtons = async () => {
		try {
			const actionButtons = await getProductActionButtons(productId);
			setButtons(actionButtons);
		} catch (error) {
			console.error('Error fetching action buttons:', error);
			toast.error('Failed to fetch action buttons');
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			label: '',
			url: '',
			style: 'primary',
			icon: 'external',
			order: buttons.length + 1,
		});
		setShowAddForm(false);
		setEditingId(null);
	};

	const handleSave = async () => {
		if (!formData.label.trim() || !formData.url.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (buttons.length >= 5 && !editingId) {
			toast.error('Maximum of 5 action buttons allowed');
			return;
		}

		try {
			if (editingId) {
				await updateActionButton(editingId, {
					...formData,
					isActive: true,
				});
				toast.success('Action button updated successfully');
			} else {
				await saveActionButton(productId, {
					...formData,
					isActive: true,
				});
				toast.success('Action button created successfully');
			}
			
			resetForm();
			fetchButtons();
		} catch (error) {
			console.error('Error saving action button:', error);
			toast.error('Failed to save action button');
		}
	};

	const handleEdit = (button: ActionButton) => {
		setFormData({
			label: button.label,
			url: button.url,
			style: button.style,
			icon: button.icon || 'external',
			order: button.order,
		});
		setEditingId(button.id);
		setShowAddForm(true);
	};

	const handleDelete = async (buttonId: string) => {
		if (!confirm('Are you sure you want to delete this action button?')) {
			return;
		}

		try {
			await deleteActionButton(buttonId);
			toast.success('Action button deleted successfully');
			fetchButtons();
		} catch (error) {
			console.error('Error deleting action button:', error);
			toast.error('Failed to delete action button');
		}
	};

	if (loading) {
		return (
			<Card className="border-gray-700 bg-gray-800">
				<CardHeader>
					<CardTitle className="text-white">Action Buttons</CardTitle>
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
				<CardTitle className="text-white">Action Buttons ({buttons.length}/5)</CardTitle>
				{!showAddForm && buttons.length < 5 && (
					<Button 
						onClick={() => setShowAddForm(true)}
						size="sm"
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
					>
						<Plus className="h-4 w-4" />
						Add Button
					</Button>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Add/Edit Form */}
				{showAddForm && (
					<Card className="border-2 border-dashed border-gray-600 bg-gray-700">
						<CardContent className="p-4 space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="font-medium text-white">
									{editingId ? 'Edit Action Button' : 'Add New Action Button'}
								</h4>
								<Button
									variant="ghost"
									size="sm"
									onClick={resetForm}
									className="text-gray-400 hover:text-white hover:bg-gray-600"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="label" className="text-gray-300">Button Label</Label>
									<Input
										id="label"
										value={formData.label}
										onChange={(e) => setFormData({ ...formData, label: e.target.value })}
										placeholder="e.g. Call Now, Book Appointment"
										className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
									/>
								</div>
								
								<div>
									<Label htmlFor="url" className="text-gray-300">URL or Action</Label>
									<Input
										id="url"
										value={formData.url}
										onChange={(e) => setFormData({ ...formData, url: e.target.value })}
										placeholder="https://... or tel:+1234567890"
										className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
									/>
								</div>
								
								<div>
									<Label htmlFor="style" className="text-gray-300">Button Style</Label>
									<Select 
										value={formData.style} 
										onValueChange={(value: ActionButton['style']) => 
											setFormData({ ...formData, style: value })
										}
									>
										<SelectTrigger className="bg-gray-600 border-gray-500 text-white">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-gray-600 border-gray-500">
											{styleOptions.map((option) => (
												<SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-500">
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								
								<div>
									<Label htmlFor="icon" className="text-gray-300">Icon</Label>
									<Select 
										value={formData.icon} 
										onValueChange={(value) => 
											setFormData({ ...formData, icon: value })
										}
									>
										<SelectTrigger className="bg-gray-600 border-gray-500 text-white">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-gray-600 border-gray-500">
											{iconOptions.map((option) => (
												<SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-500">
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								
								<div className="md:col-span-2">
									<Label htmlFor="order" className="text-gray-300">Display Order</Label>
									<Input
										id="order"
										type="number"
										min="1"
										max="5"
										value={formData.order}
										onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
										className="bg-gray-600 border-gray-500 text-white"
									/>
								</div>
							</div>
							
							<div className="flex gap-2 pt-2">
								<Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
									<Save className="h-4 w-4" />
									{editingId ? 'Update' : 'Create'} Button
								</Button>
								<Button variant="outline" onClick={resetForm} className="border-gray-500 text-gray-300 hover:bg-gray-600">
									Cancel
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Buttons List */}
				<div className="space-y-2">
					{buttons.length === 0 ? (
						<div className="text-center py-8 text-gray-400">
							No action buttons configured. Click &quot;Add Button&quot; to create one.
						</div>
					) : (
						buttons.map((button) => (
							<div 
								key={button.id}
								className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-700"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="font-medium text-white">{button.label}</span>
										<span className={`px-2 py-1 text-xs rounded-full ${
											button.style === 'primary' ? 'bg-purple-100 text-purple-700' :
											button.style === 'success' ? 'bg-green-100 text-green-700' :
											button.style === 'warning' ? 'bg-yellow-100 text-yellow-700' :
											button.style === 'danger' ? 'bg-red-100 text-red-700' :
											'bg-gray-100 text-gray-700'
										}`}>
											{button.style}
										</span>
									</div>
									<div className="text-sm text-gray-400 mt-1">
										{button.url} • Order: {button.order}
									</div>
								</div>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleEdit(button)}
										className="text-gray-400 hover:text-white hover:bg-gray-600"
									>
										<Edit className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDelete(button.id)}
										className="text-red-400 hover:text-red-300 hover:bg-gray-600"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
