import { ActionButton, MerchantDetails } from '@/types';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from 'firebase/firestore';
import { db } from './firabase';

export async function getMerchantDetails(merchantId: string): Promise<MerchantDetails | null> {
	try {
		const merchantDoc = await getDoc(doc(db, 'merchants', merchantId));
		if (!merchantDoc.exists()) {
			return null;
		}
		return { id: merchantDoc.id, ...merchantDoc.data() } as MerchantDetails;
	} catch (error) {
		console.error('Error fetching merchant details:', error);
		throw error;
	}
}

export async function createMerchantDetails(merchantId: string, merchantData: Omit<MerchantDetails, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
	try {
		await setDoc(doc(db, 'merchants', merchantId), {
			...merchantData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error('Error creating merchant details:', error);
		throw error;
	}
}

export async function updateMerchantDetails(merchantId: string, updates: Partial<Omit<MerchantDetails, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
	try {
		await updateDoc(doc(db, 'merchants', merchantId), {
			...updates,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error('Error updating merchant details:', error);
		throw error;
	}
}

export async function getProductActionButtons(productId: string): Promise<ActionButton[]> {
	try {
		const q = query(
			collection(db, 'actionButtons'),
			where('productId', '==', productId),
			where('isActive', '==', true)
		);
		const querySnapshot = await getDocs(q);
		const buttons: ActionButton[] = [];
		
		querySnapshot.forEach((doc) => {
			buttons.push({ id: doc.id, ...doc.data() } as ActionButton);
		});
		
		// Sort by order
		return buttons.sort((a, b) => a.order - b.order);
	} catch (error) {
		console.error('Error fetching action buttons:', error);
		throw error;
	}
}

export async function saveActionButton(productId: string, button: Omit<ActionButton, 'id'>): Promise<string> {
	try {
		const buttonData = {
			...button,
			productId,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};
		
		const docRef = doc(collection(db, 'actionButtons'));
		await setDoc(docRef, buttonData);
		return docRef.id;
	} catch (error) {
		console.error('Error saving action button:', error);
		throw error;
	}
}

export async function updateActionButton(buttonId: string, updates: Partial<Omit<ActionButton, 'id'>>): Promise<void> {
	try {
		await updateDoc(doc(db, 'actionButtons', buttonId), {
			...updates,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error('Error updating action button:', error);
		throw error;
	}
}

export async function deleteActionButton(buttonId: string): Promise<void> {
	try {
		await updateDoc(doc(db, 'actionButtons', buttonId), {
			isActive: false,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error('Error deleting action button:', error);
		throw error;
	}
}
