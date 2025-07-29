'use client';

import { MapPin, Phone, Mail, Globe, Store } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { getMerchantDetails } from '@/firebase/merchantDetailsServices';
import type { MerchantDetails } from '@/types';

interface MerchantDetailsCardProps {
	merchantId: string;
}

export default function MerchantDetailsCard({ merchantId }: MerchantDetailsCardProps) {
	const [merchant, setMerchant] = useState<MerchantDetails | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchMerchantDetails = async () => {
			try {
				const merchantData = await getMerchantDetails(merchantId);
				setMerchant(merchantData);
			} catch (error) {
				console.error('Error fetching merchant details:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchMerchantDetails();
	}, [merchantId]);

	if (loading) {
		return (
			<Card className="mt-8">
				<CardHeader>
					<div className="flex items-center space-x-4">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</CardContent>
			</Card>
		);
	}

	if (!merchant) {
		return null;
	}

	return (
		<Card className="mt-8">
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
						{merchant.logo ? (
							<Image
								src={merchant.logo}
								alt={merchant.name}
								width={48}
								height={48}
								className="rounded-full object-cover"
							/>
						) : (
							<Store className="h-6 w-6 text-purple-600" />
						)}
					</div>
					<div>
						<h3 className="text-xl font-semibold text-gray-900">{merchant.name}</h3>
						<p className="text-sm text-gray-500">Merchant Details</p>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="text-gray-700 leading-relaxed">{merchant.description}</p>
				</div>
				
				<Separator />
				
				<div className="space-y-3">
					<div className="flex items-center gap-3 text-sm">
						<MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
						<span className="text-gray-700">{merchant.address}</span>
					</div>
					
					<div className="flex items-center gap-3 text-sm">
						<Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
						<a 
							href={`tel:${merchant.phone}`}
							className="text-purple-600 hover:text-purple-700 hover:underline"
						>
							{merchant.phone}
						</a>
					</div>
					
					<div className="flex items-center gap-3 text-sm">
						<Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
						<a 
							href={`mailto:${merchant.email}`}
							className="text-purple-600 hover:text-purple-700 hover:underline"
						>
							{merchant.email}
						</a>
					</div>
					
					{merchant.website && (
						<div className="flex items-center gap-3 text-sm">
							<Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
							<a 
								href={merchant.website}
								target="_blank"
								rel="noopener noreferrer"
								className="text-purple-600 hover:text-purple-700 hover:underline"
							>
								Visit Website
							</a>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
