'use client';

import { ExternalLink, Phone, Calendar, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getProductActionButtons } from '@/firebase/merchantDetailsServices';
import type { ActionButton } from '@/types';

interface ProductActionButtonsProps {
	productId: string;
}

const getButtonIcon = (iconName?: string) => {
	switch (iconName) {
		case 'phone':
			return <Phone className="h-4 w-4" />;
		case 'calendar':
			return <Calendar className="h-4 w-4" />;
		case 'mail':
			return <Mail className="h-4 w-4" />;
		case 'map':
			return <MapPin className="h-4 w-4" />;
		case 'external':
		default:
			return <ExternalLink className="h-4 w-4" />;
	}
};

const getButtonVariant = (style: ActionButton['style']) => {
	switch (style) {
		case 'primary':
			return 'default';
		case 'secondary':
			return 'outline';
		case 'success':
			return 'default';
		case 'warning':
			return 'outline';
		case 'danger':
			return 'destructive';
		default:
			return 'outline';
	}
};

const getButtonClasses = (style: ActionButton['style']) => {
	switch (style) {
		case 'primary':
			return 'bg-purple-600 hover:bg-purple-700 text-white';
		case 'secondary':
			return 'border-gray-300 text-gray-700 hover:bg-gray-50';
		case 'success':
			return 'bg-green-600 hover:bg-green-700 text-white';
		case 'warning':
			return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500';
		case 'danger':
			return 'bg-red-600 hover:bg-red-700 text-white';
		default:
			return 'border-gray-300 text-gray-700 hover:bg-gray-50';
	}
};

export default function ProductActionButtons({ productId }: ProductActionButtonsProps) {
	const [buttons, setButtons] = useState<ActionButton[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchActionButtons = async () => {
			try {
				const actionButtons = await getProductActionButtons(productId);
				setButtons(actionButtons);
			} catch (error) {
				console.error('Error fetching action buttons:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchActionButtons();
	}, [productId]);

	const handleButtonClick = (url: string) => {
		if (url.startsWith('tel:') || url.startsWith('mailto:')) {
			window.location.href = url;
		} else {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	};

	if (loading || buttons.length === 0) {
		return null;
	}

	return (
		<div className="mt-6">
			<h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
			<div className="flex flex-wrap gap-3">
				{buttons.map((button) => (
					<Button
						key={button.id}
						variant={getButtonVariant(button.style)}
						size="sm"
						className={`flex items-center gap-2 ${getButtonClasses(button.style)}`}
						onClick={() => handleButtonClick(button.url)}
					>
						{getButtonIcon(button.icon)}
						{button.label}
					</Button>
				))}
			</div>
		</div>
	);
}
