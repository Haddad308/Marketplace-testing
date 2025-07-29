import type { Product, ProductFormData } from '@/types';
import {
	addDoc,
	arrayRemove,
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
import { db } from './firabase';

export async function createProduct(merchantId: string, productData: ProductFormData): Promise<string> {
	try {
		let imageUrl = '';

		// Upload image if provided
		if (productData.image) {
			try {
				// Get ImageKit auth params
				const authRes = await fetch('/api/imagekit-auth');
				
				if (!authRes.ok) {
					const errorData = await authRes.json();
					console.warn('ImageKit not configured properly:', errorData.message);
					throw new Error('Image upload service not available. Please configure ImageKit or use a different image hosting solution.');
				}
				
				const auth = await authRes.json();
				
				// Check if auth response contains error
				if (auth.error) {
					throw new Error(auth.message || 'Failed to get ImageKit authentication');
				}

				const formData = new FormData();
				formData.append('signature', auth.signature);
				formData.append('expire', auth.expire.toString());
				formData.append('token', auth.token);
				formData.append('file', productData.image);
				formData.append('fileName', `product_${Date.now()}`);
				formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

				const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
					method: 'POST',
					body: formData,
				});

				if (!uploadRes.ok) {
					const errorText = await uploadRes.text();
					throw new Error(`Image upload failed: ${errorText}`);
				}

				const result = await uploadRes.json();
				imageUrl = result.url;
			} catch (imageError) {
				console.error('Image upload error:', imageError);
				// For now, we'll continue without the image rather than failing the entire product creation
				// In production, you might want to use a fallback image service or require proper ImageKit setup
				throw new Error(`Image upload failed: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
			}
		}

		// If discountedPrice is undefined, remove it from updateData
		if (productData.discountedPrice === undefined) {
			delete productData.discountedPrice;
			delete productData.discountPercentage;
		}

		const newProduct = {
			...productData,
			image: imageUrl,
			merchantId,
			rating: 0,
			reviewCount: 0,
			isPopular: false,
			views: 0,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		const docRef = await addDoc(collection(db, 'products'), newProduct);
		return docRef.id;
	} catch (error) {
		console.error('Error creating product:', error);
		throw error;
	}
}

export async function updateProduct(productId: string, updates: Partial<ProductFormData>): Promise<void> {
	try {
		const productRef = doc(db, 'products', productId);

		const updateData: Record<string, unknown> = { ...updates };

		// Handle image upload if a new image is provided
		if (updates.image && updates.image instanceof File) {
			try {
				// Get ImageKit auth params
				const authRes = await fetch('/api/imagekit-auth');
				
				if (!authRes.ok) {
					const errorData = await authRes.json();
					console.warn('ImageKit not configured properly:', errorData.message);
					throw new Error('Image upload service not available. Please configure ImageKit or use a different image hosting solution.');
				}
				
				const auth = await authRes.json();
				
				// Check if auth response contains error
				if (auth.error) {
					throw new Error(auth.message || 'Failed to get ImageKit authentication');
				}

				const formData = new FormData();
				formData.append('signature', auth.signature);
				formData.append('expire', auth.expire.toString());
				formData.append('token', auth.token);
				formData.append('file', updates.image);
				formData.append('fileName', `product_${Date.now()}`);
				formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

				const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
					method: 'POST',
					body: formData,
				});

				if (!uploadRes.ok) {
					const errorText = await uploadRes.text();
					throw new Error(`Image upload failed: ${errorText}`);
				}

				const result = await uploadRes.json();
				updateData.image = result.url;
			} catch (imageError) {
				console.error('Image upload error:', imageError);
				throw new Error(`Image upload failed: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
			}
		} else {
			// Remove the image field if no new image is provided
			delete updateData.image;
		}

		// If discountedPrice is undefined, remove it from updateData
		if (updateData.discountedPrice === undefined) {
			delete updateData.discountedPrice;
			delete updateData.discountPercentage;
		}

		await updateDoc(productRef, {
			...updateData,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error('Error updating product:', error);
		throw error;
	}
}

export async function getMerchantProducts(merchantId: string): Promise<Product[]> {
	try {
		const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'));

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Product[];
	} catch (error) {
		console.error('Error fetching merchant products:', error);
		throw error;
	}
}

export async function deleteProduct(productId: string): Promise<void> {
	try {
		await deleteDoc(doc(db, 'products', productId));

		// Query users who have this productId in their wishlist
		const q = query(collection(db, 'users'), where('wishlist', 'array-contains', productId));
		const snapshot = await getDocs(q);

		// Remove the productId from each matched user's wishlist
		const updatePromises = snapshot.docs.map((userDoc) =>
			updateDoc(userDoc.ref, {
				wishlist: arrayRemove(productId),
			})
		);

		await Promise.all(updatePromises);
	} catch (error) {
		console.error('Error deleting product:', error);
		throw error;
	}
}
