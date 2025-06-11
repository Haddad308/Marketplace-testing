import { Product } from '@/types';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firabase';

export async function getProducts() {
	try {
		const snapshot = await getDocs(collection(db, 'products'));
		return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }));
	} catch (error) {
		throw new Error(`Error fetching products: ${error}`);
	}
}

export async function uploadProduct(product: Product) {
	try {
		await addDoc(collection(db, 'products'), product);
	} catch (error) {
		throw new Error(`Error uploading product: ${error}`);
	}
}
