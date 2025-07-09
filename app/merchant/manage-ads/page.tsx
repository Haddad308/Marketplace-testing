'use client';

import AdForm from '@/components/ui/ad-form';
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
import { useAuth } from '@/contexts/auth-context';
import { adService } from '@/firebase/adServices';
import { toast } from '@/hooks/use-toast';
import { Ad } from '@/types';
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
			toast.error(`Failed to fetch ads: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (ad: Ad) => {
		try {
			await adService.deleteAd(ad.id, ad.image);
			toast.success('Ad deleted successfully');
			await fetchAds();
		} catch (error) {
			toast.error(`Failed to delete ad: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const handleEdit = (ad: Ad) => {
		setEditingAd(ad);
		setDialogOpen(true);
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
					<p className="text-gray-400">Manage promotional banners</p>
				</div>

				<Dialog
					open={dialogOpen}
					onOpenChange={(open) => {
						if (!open) {
							setEditingAd(null);
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
							Create Ad
						</Button>
					</DialogTrigger>

					<DialogContent className="max-h-[100dvh] max-w-2xl overflow-y-scroll border-gray-600 bg-gray-800">
						<DialogHeader>
							<DialogTitle className="text-gray-100">{editingAd ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
						</DialogHeader>
						<AdForm setDialogOpen={setDialogOpen} fetchAds={fetchAds} editingAd={editingAd} setEditingAd={setEditingAd} />
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
							<CardContent className="h-full">
								<div className="flex h-full flex-col justify-between space-y-4">
									<div>
										{ad.image && (
											<div className="relative h-32 w-full overflow-hidden rounded-lg">
												<Image src={ad.image || '/placeholder.svg'} alt={ad.title} fill className="object-cover" />
											</div>
										)}

										<div
											className="mt-8 line-clamp-6 text-sm break-all text-gray-300"
											dangerouslySetInnerHTML={{ __html: ad.description }}
										/>
									</div>

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
