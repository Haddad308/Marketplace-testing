import { Ad, AdFormData } from '@/types';
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from './firabase';

export const adService = {
	// Get all ads
	async getAds(): Promise<Ad[]> {
		try {
			const q = query(collection(db, 'ads'), orderBy('position', 'asc'));
			const snapshot = await getDocs(q);
			return snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Ad[];
		} catch (error) {
			console.error('Error fetching ads:', error);
			throw error;
		}
	},

	// Get active ads only
	async getActiveAds(): Promise<Ad[]> {
		try {
			const q = query(collection(db, 'ads'), where('isActive', '==', true), orderBy('position', 'asc'));
			const snapshot = await getDocs(q);
			return snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Ad[];
		} catch (error) {
			console.error('Error fetching active ads:', error);
			throw error;
		}
	},

	// Create new ad
	async createAd(adData: AdFormData): Promise<string> {
		try {
			let imageUrl = '';

			if (adData.image) {
				// Get ImageKit auth params
				const authRes = await fetch('/api/imagekit-auth');
				const auth = await authRes.json();
				const formData = new FormData();

				formData.append('signature', auth.signature);
				formData.append('expire', auth.expire.toString());
				formData.append('token', auth.token);
				formData.append('file', adData.image);
				formData.append('fileName', `product_${Date.now()}`);
				formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

				const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
					method: 'POST',
					body: formData,
				});

				if (!uploadRes.ok) throw new Error('Image upload failed');

				const result = await uploadRes.json();
				imageUrl = result.url;
			}

			const docRef = await addDoc(collection(db, 'ads'), {
				title: adData.title,
				description: adData.description,
				image: imageUrl,
				affiliateLink: adData.affiliateLink,
				position: adData.position,
				isActive: adData.isActive,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			return docRef.id;
		} catch (error) {
			console.error('Error creating ad:', error);
			throw error;
		}
	},

	// Update ad
	async updateAd(id: string, adData: Partial<AdFormData>): Promise<void> {
		try {
			// Handle image upload if a new image is provided
			if (adData.image && adData.image instanceof File) {
				// Get ImageKit auth params
				const authRes = await fetch('/api/imagekit-auth');
				const auth = await authRes.json();
				const formData = new FormData();

				formData.append('signature', auth.signature);
				formData.append('expire', auth.expire.toString());
				formData.append('token', auth.token);
				formData.append('file', adData.image);
				formData.append('fileName', `product_${Date.now()}`);
				formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

				const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
					method: 'POST',
					body: formData,
				});

				if (!uploadRes.ok) throw new Error('Image upload failed');

				const result = await uploadRes.json();
				adData.image = result.url;
			} else {
				// Remove the image field if no new image is provided
				delete adData.image;
			}

			const updateData: any = {
				...adData,
				updatedAt: serverTimestamp(),
			};

			await updateDoc(doc(db, 'ads', id), updateData);
		} catch (error) {
			console.error('Error updating ad:', error);
			throw error;
		}
	},

	// Delete ad
	async deleteAd(id: string, imageUrl?: string): Promise<void> {
		try {
			// Delete image from storage if exists
			if (imageUrl) {
				try {
					const imageRef = ref(storage, imageUrl);
					await deleteObject(imageRef);
				} catch (error) {
					console.warn('Could not delete image:', error);
				}
			}

			await deleteDoc(doc(db, 'ads', id));
		} catch (error) {
			console.error('Error deleting ad:', error);
			throw error;
		}
	},
};
