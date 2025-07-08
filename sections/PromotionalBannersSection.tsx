'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { adService } from '@/firebase/adServices';
import { toast } from '@/hooks/use-toast';
import { Ad } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PromotionalBanners() {
	const [activeAds, setActiveAds] = useState<Ad[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchActiveAds();
	}, []);

	const fetchActiveAds = async () => {
		try {
			const activeAds = await adService.getActiveAds(2);
			setActiveAds(activeAds);
		} catch (error) {
			console.error('Error fetching active ads:', error);
			toast.error('Failed to fetch the ads');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto grid h-64 max-w-7xl gap-6 md:grid-cols-2">
				<Skeleton className="my-4 h-full flex-1 rounded-lg" />
				<Skeleton className="my-4 h-full flex-1 rounded-lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-8">
				<div className="py-8 text-red-500">Error fetching Ads: {error}</div>
				<Button
					onClick={fetchActiveAds}
					className="mx-auto bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Retry Fetching Ads
				</Button>
			</div>
		);
	}

	return (
		<section className="py-8">
			<h2 className="mb-6 text-2xl font-bold">Advertisements</h2>
			{/* Display loading skeletons if no ads are available */}
			{!activeAds || activeAds.length === 0 ? (
				<div className="mx-auto max-w-7xl">
					<p className="mt-4 text-gray-500">No active promotional banners available at the moment</p>
				</div>
			) : (
				<div className="mx-auto max-w-7xl">
					<div className="grid gap-6 md:grid-cols-2">
						{activeAds.map((ad) => (
							<div key={ad.id} className="relative h-64 overflow-hidden rounded-lg bg-gray-100">
								{ad.image && (
									<Image
										src={ad.image}
										alt={ad.title}
										layout="fill"
										objectFit="cover"
										className="absolute inset-0 h-full w-full object-cover"
									/>
								)}
								<div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
									<div>
										<h3 className="text-lg font-semibold">{ad.title}</h3>
										<p className="break-word mt-2 line-clamp-6 text-sm" dangerouslySetInnerHTML={{ __html: ad.description }} />
									</div>
									<Link href={ad.affiliateLink} target="_blank" rel="noopener noreferrer">
										<Button variant="secondary" className="rounded-full bg-white px-6 py-2 text-purple-600 hover:bg-gray-100">
											See More
										</Button>
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</section>
	);
}
